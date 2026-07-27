from datetime import datetime
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.auth import ServidorAutenticado, obter_servidor_autenticado
from app.database.connection import get_db
from app.repositories.atendimento_repository import AtendimentoRepository
from app.repositories.auditoria_repository import AuditoriaRepository
from app.repositories.cidadao_repository import CidadaoRepository
from app.repositories.setor_repository import SetorRepository
from app.services.atendimento_service import AtendimentoService
from app.services.relatorio_service import (
    MESES,
    gerar_relatorio,
    intervalo_da_semana,
    intervalo_do_mes,
)

from app.schemas.atendimento import (
    AtendimentoCancelar,
    AtendimentoConvocar,
    AtendimentoCreate,
    AtendimentoFinalizar,
    AtendimentoIniciar,
    AtendimentoResponse,
    ChamadaPublica,
)
from app.schemas.auditoria import LogAuditoriaResponse


router = APIRouter(
    prefix="/atendimentos",
    tags=["Atendimentos"],
)


def criar_service(
    db: Session,
) -> AtendimentoService:
    return AtendimentoService(
        repository=AtendimentoRepository(db),
        cidadao_repository=CidadaoRepository(db),
        setor_repository=SetorRepository(db),
        auditoria_repository=AuditoriaRepository(db),
    )


def obter_service(
    db: Session = Depends(get_db),
) -> AtendimentoService:
    return criar_service(db)


def _setor_efetivo(
    servidor: ServidorAutenticado,
    setor_id_solicitado: int | None,
) -> int | None:
    """
    Decide qual setor de fato é usado numa consulta:

    * Direção pode pedir um setor específico (``setor_id_solicitado``)
      ou nada — nesse caso os dados vêm de TODOS os setores juntos.
    * Qualquer outro perfil é sempre travado no próprio setor do token,
      não importa o que o cliente tenha mandado na URL. É isso que
      impede um operador de ler a fila ou o histórico de outro setor
      só trocando o parâmetro na requisição.
    """
    if servidor.eh_direcao:
        return setor_id_solicitado

    return servidor.setor_id


@router.get(
    "/chamada-publica",
    response_model=list[ChamadaPublica],
)
def listar_chamada_publica(
    db: Session = Depends(get_db),
):
    """Endpoint para a TV da sala de espera. O response_model garante que
    só os campos declarados em ChamadaPublica saem na resposta — nenhum
    dado pessoal além do nome é exposto, mesmo que o objeto interno tenha
    mais campos."""
    service = criar_service(db)

    return service.listar_chamada_publica()


@router.post(
    "/",
    response_model=AtendimentoResponse,
    status_code=201,
)
def criar_atendimento(
    dados: AtendimentoCreate,
    db: Session = Depends(get_db),
):
    """Rota pública: qualquer cidadão usa esta rota pelo totem de
    solicitação, sem autenticação — de propósito."""
    service = criar_service(db)

    try:
        return service.criar(dados)

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.get(
    "/",
    response_model=list[AtendimentoResponse],
)
def listar_atendimentos(
    cidadao_id: int | None = None,
    limite: int = 100,
    offset: int = 0,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: AtendimentoService = Depends(obter_service),
):
    """
    Lista atendimentos, opcionalmente filtrando por ``cidadao_id`` —
    usado pela tela de histórico da pessoa. Protegido por login: um
    operador só enxerga a parte do histórico atendida no próprio setor;
    a Direção enxerga o histórico completo, de todos os setores.
    """
    return service.listar_todos(
        cidadao_id=cidadao_id,
        setor_id=_setor_efetivo(servidor, None),
        limite=limite,
        offset=offset,
    )


@router.get(
    "/relatorio.xlsx",
    response_class=Response,
)
def gerar_relatorio_xlsx(
    tipo: str = Query(
        default="mensal",
        pattern="^(mensal|semanal)$",
        description="'mensal' ou 'semanal'.",
    ),
    ano: int | None = Query(
        default=None,
        ge=2000,
        le=2100,
        description="Ano de referência (relatório mensal). Padrão: ano atual.",
    ),
    mes: int | None = Query(
        default=None,
        ge=1,
        le=12,
        description="Mês de referência, 1 a 12 (relatório mensal). Padrão: mês atual.",
    ),
    data_referencia: str | None = Query(
        default=None,
        description=(
            "Qualquer dia dentro da semana desejada, formato "
            "AAAA-MM-DD (relatório semanal). Padrão: hoje."
        ),
    ),
    setor_id: int | None = Query(
        default=None,
        description=(
            "Setor a relatar. Só tem efeito para quem está logado como "
            "Direção — se omitido, a Direção recebe todos os setores "
            "juntos. Para os demais perfis este parâmetro é ignorado: "
            "o relatório é sempre do próprio setor."
        ),
    ),
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    db: Session = Depends(get_db),
):
    """
    Relatório de atendimentos em Excel — mensal ou semanal — com uma
    aba de números consolidados e outra com o detalhamento de cada
    atendimento.

    Protegido por login. Um operador comum só emite o relatório do
    próprio setor. A Direção pode escolher um setor específico ou pedir
    todos juntos (parâmetro ``setor_id`` omitido).
    """
    service = criar_service(db)

    setor_alvo = _setor_efetivo(servidor, setor_id)
    agregado = setor_alvo is None

    if tipo == "semanal":
        try:
            referencia = (
                datetime.strptime(data_referencia, "%Y-%m-%d")
                if data_referencia
                else datetime.now()
            )
        except ValueError as erro:
            raise HTTPException(
                status_code=422,
                detail="data_referencia inválida. Use o formato AAAA-MM-DD.",
            ) from erro

        inicio, fim = intervalo_da_semana(referencia)

        titulo_periodo = (
            f"Semana de {inicio.strftime('%d/%m/%Y')} a "
            f"{fim.strftime('%d/%m/%Y')}"
        )
        sufixo_arquivo = (
            f"semana-{inicio.strftime('%Y-%m-%d')}"
        )
    else:
        hoje = datetime.now()
        ano_final = ano or hoje.year
        mes_final = mes or hoje.month

        try:
            inicio, fim = intervalo_do_mes(ano_final, mes_final)
        except ValueError as erro:
            raise HTTPException(
                status_code=422,
                detail=str(erro),
            ) from erro

        titulo_periodo = f"{MESES[mes_final - 1].capitalize()} de {ano_final}"
        sufixo_arquivo = f"{MESES[mes_final - 1]}-{ano_final}"

    if agregado:
        titulo_abrangencia = "Todos os setores"
        sufixo_setor = "todos-os-setores"
    else:
        try:
            setor = SetorRepository(db).buscar_por_id(setor_alvo)
        except Exception:  # noqa: BLE001 — buscar_por_id não lança, só devolve None
            setor = None

        if not setor:
            raise HTTPException(
                status_code=404,
                detail="Setor não encontrado.",
            )

        titulo_abrangencia = setor.nome
        sufixo_setor = setor.sigla.lower()

    atendimentos = service.listar_por_periodo(
        inicio=inicio,
        fim=fim,
        setor_id=setor_alvo,
    )

    conteudo = gerar_relatorio(
        atendimentos=atendimentos,
        titulo_periodo=titulo_periodo,
        titulo_abrangencia=titulo_abrangencia,
        agregado=agregado,
    )

    nome_arquivo = (
        f"relatorio-atendimentos-{sufixo_setor}-{sufixo_arquivo}.xlsx"
    )

    return Response(
        content=conteudo,
        media_type=(
            "application/vnd.openxmlformats-officedocument"
            ".spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                "attachment; filename*=UTF-8''"
                + quote(nome_arquivo)
            ),
            # Sem isso o navegador não enxerga o nome do arquivo quando
            # o download é feito por fetch a partir de outra origem.
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@router.get(
    "/auditoria",
    response_model=list[LogAuditoriaResponse],
)
def listar_auditoria(
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    db: Session = Depends(get_db),
):
    """Histórico de ações (quem convocou/iniciou/finalizou/cancelou o
    quê). Protegido por login: operador vê só o próprio setor; a
    Direção vê de todos."""
    repository = AuditoriaRepository(db)

    if servidor.eh_direcao:
        return repository.listar_todos()

    return repository.listar_por_setor(servidor.setor_id)


@router.get(
    "/fila",
    response_model=list[AtendimentoResponse],
)
def listar_fila(
    setor_id: int | None = None,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: AtendimentoService = Depends(obter_service),
):
    try:
        return service.listar_fila(
            _setor_efetivo(servidor, setor_id)
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.get(
    "/aguardando",
    response_model=list[AtendimentoResponse],
)
def listar_aguardando(
    setor_id: int | None = None,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: AtendimentoService = Depends(obter_service),
):
    try:
        return service.listar_aguardando(
            _setor_efetivo(servidor, setor_id)
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.get(
    "/em-atendimento",
    response_model=list[AtendimentoResponse],
)
def listar_em_atendimento(
    setor_id: int | None = None,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: AtendimentoService = Depends(obter_service),
):
    try:
        return service.listar_em_atendimento(
            _setor_efetivo(servidor, setor_id)
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.get(
    "/finalizados",
    response_model=list[AtendimentoResponse],
)
def listar_finalizados(
    setor_id: int | None = None,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: AtendimentoService = Depends(obter_service),
):
    try:
        return service.listar_finalizados(
            _setor_efetivo(servidor, setor_id)
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.get(
    "/{atendimento_id}",
    response_model=AtendimentoResponse,
)
def buscar_atendimento(
    atendimento_id: int,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        atendimento = service.buscar_por_id(atendimento_id)

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro),
        ) from erro

    # Um operador não pode consultar, nem adivinhando o ID, um
    # atendimento de outro setor — a Direção não tem essa restrição.
    if (
        not servidor.eh_direcao
        and atendimento.setor_id != servidor.setor_id
    ):
        raise HTTPException(
            status_code=404,
            detail="Atendimento não encontrado.",
        )

    return atendimento


@router.patch(
    "/{atendimento_id}/convocar",
    response_model=AtendimentoResponse,
)
def convocar_atendimento(
    atendimento_id: int,
    dados: AtendimentoConvocar,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: AtendimentoService = Depends(
        obter_service
    ),
):
    try:
        return service.convocar(
            atendimento_id,
            dados,
            servidor,
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.patch(
    "/{atendimento_id}/iniciar",
    response_model=AtendimentoResponse,
)
def iniciar_atendimento(
    atendimento_id: int,
    dados: AtendimentoIniciar,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        return service.iniciar(
            atendimento_id,
            dados,
            servidor,
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.patch(
    "/{atendimento_id}/finalizar",
    response_model=AtendimentoResponse,
)
def finalizar_atendimento(
    atendimento_id: int,
    dados: AtendimentoFinalizar,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        return service.finalizar(
            atendimento_id,
            dados,
            servidor,
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.patch(
    "/{atendimento_id}/cancelar",
    response_model=AtendimentoResponse,
)
def cancelar_atendimento(
    atendimento_id: int,
    dados: AtendimentoCancelar,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        return service.cancelar(
            atendimento_id,
            dados,
            servidor,
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro
