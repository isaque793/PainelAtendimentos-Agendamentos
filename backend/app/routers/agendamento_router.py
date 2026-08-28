from calendar import monthrange
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import ServidorAutenticado, obter_servidor_autenticado
from app.database.connection import get_db
from app.models.agendamento import Agendamento, StatusAgendamento
from app.models.atendimento import Atendimento, StatusAtendimento
from app.models.cidadao import Cidadao
from app.repositories.agendamento_repository import AgendamentoRepository
from app.repositories.cidadao_repository import CidadaoRepository
from app.repositories.setor_repository import SetorRepository
from app.schemas.agendamento import AgendamentoCreate, AgendamentoResponse
from app.schemas.atendimento import AtendimentoResponse
from app.utils.formatacao import apenas_digitos


router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])


@router.post("/", response_model=AgendamentoResponse, status_code=201)
def criar_agendamento(
    dados: AgendamentoCreate,
    db: Session = Depends(get_db),
):
    if dados.data_hora <= datetime.now():
        raise HTTPException(
            status_code=400,
            detail="Escolha uma data e horário futuros.",
        )

    if dados.data_hora.minute not in (0, 30) or dados.data_hora.second != 0:
        raise HTTPException(
            status_code=400,
            detail="Escolha um horário disponível em intervalos de 30 minutos.",
        )

    setor = SetorRepository(db).buscar_por_id(dados.setor_id)
    if setor is None or not setor.ativo or setor.perfil == "DIRECAO":
        raise HTTPException(
            status_code=400,
            detail="Selecione um setor de atendimento válido.",
        )

    agendamento_repository = AgendamentoRepository(db)
    if agendamento_repository.horario_ocupado(
        dados.setor_id, dados.data_hora
    ):
        raise HTTPException(
            status_code=409,
            detail="Este horário já está reservado para o setor escolhido.",
        )

    cpf = apenas_digitos(dados.cpf)
    cidadao_repository = CidadaoRepository(db)
    cidadao = cidadao_repository.buscar_por_cpf(cpf)

    if cidadao is None:
        cidadao = cidadao_repository.criar(
            Cidadao(
                nome=dados.nome.strip(),
                cpf=cpf,
                telefone=dados.telefone.strip(),
                email=dados.email,
            )
        )
    else:
        cidadao.nome = dados.nome.strip()
        cidadao.telefone = dados.telefone.strip()
        cidadao.email = dados.email
        db.commit()
        db.refresh(cidadao)

    agendamento = Agendamento(
        protocolo=agendamento_repository.gerar_protocolo(),
        setor_id=dados.setor_id,
        cidadao_id=cidadao.id,
        data_hora=dados.data_hora,
        assunto=dados.assunto.strip(),
        descricao=(dados.descricao or "").strip() or None,
    )

    return agendamento_repository.criar(agendamento)


@router.get(
    "/mensal",
    response_model=list[AgendamentoResponse],
)
def listar_agendamentos_mensais(
    ano: int,
    mes: int,
    setor_id: int | None = None,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    db: Session = Depends(get_db),
):
    if mes < 1 or mes > 12:
        raise HTTPException(status_code=400, detail="Mês inválido.")

    setor_efetivo = None if servidor.eh_direcao else servidor.setor_id
    if servidor.eh_direcao and setor_id is not None:
        setor_efetivo = setor_id

    inicio = datetime(ano, mes, 1)
    if mes == 12:
        fim = datetime(ano + 1, 1, 1)
    else:
        fim = datetime(ano, mes + 1, 1)

    return AgendamentoRepository(db).listar_por_mes(
        inicio,
        fim,
        setor_efetivo,
    )


@router.post(
    "/{agendamento_id}/iniciar",
    response_model=AtendimentoResponse,
)
def iniciar_agendamento(
    agendamento_id: int,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    db: Session = Depends(get_db),
):
    agendamento = db.get(Agendamento, agendamento_id)
    if agendamento is None or (
        not servidor.eh_direcao
        and agendamento.setor_id != servidor.setor_id
    ):
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if agendamento.status != StatusAgendamento.AGENDADO.value:
        raise HTTPException(
            status_code=409,
            detail="Este agendamento não está disponível para início.",
        )

    atendimento_existente = db.query(Atendimento).filter(
        Atendimento.agendamento_id == agendamento.id
    ).first()
    if atendimento_existente is not None:
        raise HTTPException(
            status_code=409,
            detail="Este agendamento já foi convertido em atendimento.",
        )

    agora = datetime.now()
    atendimento = Atendimento(
        agendamento_id=agendamento.id,
        cidadao_id=agendamento.cidadao_id,
        setor_id=agendamento.setor_id,
        assunto=agendamento.assunto,
        descricao=agendamento.descricao,
        prioridade="NORMAL",
        status=StatusAtendimento.EM_ATENDIMENTO.value,
        servidor_nome=servidor.servidor_nome,
        servidor_masp=servidor.servidor_masp,
        numero_sala=agendamento.setor.numero_sala,
        data_solicitacao=agendamento.created_at,
        data_convocacao=agora,
        data_inicio=agora,
    )
    agendamento.status = StatusAgendamento.EM_ATENDIMENTO.value
    db.add(atendimento)
    db.commit()
    db.refresh(atendimento)
    return atendimento


@router.get(
    "/{agendamento_id}",
    response_model=AgendamentoResponse,
)
def buscar_agendamento(
    agendamento_id: int,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    db: Session = Depends(get_db),
):
    agendamento = db.get(Agendamento, agendamento_id)
    if agendamento is None:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    if not servidor.eh_direcao and agendamento.setor_id != servidor.setor_id:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    return agendamento
