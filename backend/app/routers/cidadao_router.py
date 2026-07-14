from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.repositories.cidadao_repository import CidadaoRepository
from app.services.cidadao_service import CidadaoService
from app.schemas.cidadao import (
    CidadaoCreate,
    CidadaoResponse,
    CidadaoUpdate
)

router = APIRouter(
    prefix="/cidadaos",
    tags=["Cidadãos"]
)


@router.post("/", response_model=CidadaoResponse)
def criar_cidadao(
    dados: CidadaoCreate,
    db: Session = Depends(get_db)
):
    repository = CidadaoRepository(db)
    service = CidadaoService(repository)

    try:
        return service.criar(dados)

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )


@router.get("/", response_model=list[CidadaoResponse])
def listar_cidadaos(
    db: Session = Depends(get_db)
):
    repository = CidadaoRepository(db)
    service = CidadaoService(repository)

    return service.listar()


@router.get("/{cidadao_id}", response_model=CidadaoResponse)
def buscar_cidadao(
    cidadao_id: int,
    db: Session = Depends(get_db)
):
    repository = CidadaoRepository(db)
    service = CidadaoService(repository)

    try:
        return service.buscar_por_id(cidadao_id)

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro)
        )


@router.delete("/{cidadao_id}")
def excluir_cidadao(
    cidadao_id: int,
    db: Session = Depends(get_db)
):
    repository = CidadaoRepository(db)
    service = CidadaoService(repository)

    try:
        service.excluir(cidadao_id)

        return {
            "mensagem": "Cidadão excluído com sucesso."
        }

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro)
        )
    

    
@router.put("/{cidadao_id}", response_model=CidadaoResponse)
def atualizar_cidadao(
    cidadao_id: int,
    dados: CidadaoUpdate,
    db: Session = Depends(get_db)
):
    repository = CidadaoRepository(db)
    service = CidadaoService(repository)

    try:
        return service.atualizar(cidadao_id,dados)

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro)
        ) 