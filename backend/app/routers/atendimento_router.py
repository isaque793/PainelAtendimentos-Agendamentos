from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.repositories.atendimento_repository import AtendimentoRepository
from app.repositories.cidadao_repository import CidadaoRepository
from app.schemas.atendimento import (
    AtendimentoCancelar,
    AtendimentoConvocar,
    AtendimentoCreate,
    AtendimentoFinalizar,
    AtendimentoIniciar,
    AtendimentoResponse,
)
from app.services.atendimento_service import AtendimentoService


router = APIRouter(
    prefix="/atendimentos",
    tags=["Atendimentos"],
)


def criar_service(db: Session) -> AtendimentoService:
    atendimento_repository = AtendimentoRepository(db)
    cidadao_repository = CidadaoRepository(db)

    return AtendimentoService(
        repository=atendimento_repository,
        cidadao_repository=cidadao_repository,
    )


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
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    return service.listar_fila()


@router.get(
    "/aguardando",
    response_model=list[AtendimentoResponse],
)
def listar_aguardando(
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    return service.listar_aguardando()


@router.get(
    "/em-atendimento",
    response_model=list[AtendimentoResponse],
)
def listar_em_atendimento(
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    return service.listar_em_atendimento()


@router.get(
    "/finalizados",
    response_model=list[AtendimentoResponse],
)
def listar_finalizados(
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    return service.listar_finalizados()


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
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        return service.convocar(
            atendimento_id,
            dados,
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        )


@router.patch(
    "/{atendimento_id}/iniciar",
    response_model=AtendimentoResponse,
)
def iniciar_atendimento(
    atendimento_id: int,
    dados: AtendimentoIniciar,
    db: Session = Depends(get_db),
):
    service = criar_service(db)

    try:
        return service.iniciar(
            atendimento_id,
            dados,
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        )


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