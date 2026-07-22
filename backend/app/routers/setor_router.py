from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.repositories.setor_repository import (
    SetorRepository,
)
from app.schemas.setor import (
    SetorAcesso,
    SetorAcessoResponse,
    SetorCreate,
    SetorPublico,
    SetorResponse,
    SetorUpdate,
)
from app.services.setor_service import SetorService


router = APIRouter(
    prefix="/setores",
    tags=["Setores"],
)


def obter_service(
    db: Session = Depends(get_db),
) -> SetorService:
    repository = SetorRepository(db)

    return SetorService(repository)


@router.post(
    "/",
    response_model=SetorResponse,
    status_code=201,
)
def criar_setor(
    dados: SetorCreate,
    service: SetorService = Depends(
        obter_service
    ),
):
    try:
        return service.criar(dados)

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.get(
    "/",
    response_model=list[SetorResponse],
)
def listar_setores(
    service: SetorService = Depends(
        obter_service
    ),
):
    return service.listar()


@router.get(
    "/publicos",
    response_model=list[SetorPublico],
)
def listar_setores_publicos(
    service: SetorService = Depends(
        obter_service
    ),
):
    return service.listar_ativos()


@router.get(
    "/{setor_id}",
    response_model=SetorResponse,
)
def buscar_setor(
    setor_id: int,
    service: SetorService = Depends(
        obter_service
    ),
):
    try:
        return service.buscar_por_id(
            setor_id
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro),
        ) from erro


@router.post(
    "/acesso",
    response_model=SetorAcessoResponse,
)
def validar_acesso_setor(
    dados: SetorAcesso,
    service: SetorService = Depends(
        obter_service
    ),
):
    try:
        return service.validar_acesso(
            dados
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=401,
            detail=str(erro),
        ) from erro


@router.put(
    "/{setor_id}",
    response_model=SetorResponse,
)
def atualizar_setor(
    setor_id: int,
    dados: SetorUpdate,
    service: SetorService = Depends(
        obter_service
    ),
):
    try:
        return service.atualizar(
            setor_id,
            dados,
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


