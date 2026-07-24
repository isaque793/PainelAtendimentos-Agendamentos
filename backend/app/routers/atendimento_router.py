from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.atendimento_service import AtendimentoService
from app.database.connection import get_db
from app.repositories.atendimento_repository import AtendimentoRepository
from app.repositories.cidadao_repository import CidadaoRepository
from app.repositories.setor_repository import SetorRepository

from app.schemas.atendimento import (
    AtendimentoCancelar,
    AtendimentoConvocar,
    AtendimentoCreate,
    AtendimentoFinalizar,
    AtendimentoIniciar,
    AtendimentoResponse,
    ChamadaPublica,
)

from app.repositories.setor_repository import (
    SetorRepository,
)


router = APIRouter(
    prefix="/atendimentos",
    tags=["Atendimentos"],
)


def criar_service(
    db: Session,
) -> AtendimentoService:
    repository = AtendimentoRepository(db)
    cidadao_repository = CidadaoRepository(db)
    setor_repository = SetorRepository(db)

    return AtendimentoService(
        repository=repository,
        cidadao_repository=cidadao_repository,
        setor_repository=setor_repository,
    )

def obter_service(
    db: Session = Depends(get_db),
) -> AtendimentoService:
    return AtendimentoService(
        repository=AtendimentoRepository(db),
        cidadao_repository=CidadaoRepository(db),
        setor_repository=SetorRepository(db),
    )


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
    service = criar_service(db)

    try:
        return service.criar(dados)

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        )


@router.get(
    "/",
    response_model=list[AtendimentoResponse],
)
def listar_atendimentos(
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    return service.listar_todos()


@router.get(
    "/fila",
    response_model=list[AtendimentoResponse],
)
def listar_fila(
    setor_id: int,
    service: AtendimentoService = Depends(
        obter_service
    ),
):
    try:
        return service.listar_fila(setor_id)

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
    setor_id: int,
    service: AtendimentoService = Depends(
        obter_service
    ),
):
    try:
        return service.listar_aguardando(
            setor_id
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
    setor_id: int,
    service: AtendimentoService = Depends(
        obter_service
    ),
):
    try:
        return service.listar_em_atendimento(
            setor_id
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
    setor_id: int,
    service: AtendimentoService = Depends(
        obter_service
    ),
):
    try:
        return service.listar_finalizados(
            setor_id
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
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        return service.buscar_por_id(atendimento_id)

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro),
        )


@router.patch(
    "/{atendimento_id}/convocar",
    response_model=AtendimentoResponse,
)
def convocar_atendimento(
    atendimento_id: int,
    dados: AtendimentoConvocar,
    service: AtendimentoService = Depends(
        obter_service
    ),
):
    try:
        return service.convocar(
            atendimento_id,
            dados,
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
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        return service.iniciar(
            atendimento_id
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
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        return service.finalizar(
            atendimento_id,
            dados,
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        )


@router.patch(
    "/{atendimento_id}/cancelar",
    response_model=AtendimentoResponse,
)
def cancelar_atendimento(
    atendimento_id: int,
    dados: AtendimentoCancelar,
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        return service.cancelar(
            atendimento_id,
            dados,
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        )