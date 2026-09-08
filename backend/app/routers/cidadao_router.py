from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import ServidorAutenticado, obter_servidor_autenticado
from app.database.connection import get_db
from app.repositories.cidadao_repository import CidadaoRepository
from app.schemas.cidadao import (
    CidadaoCreate,
    CidadaoIdentificar,
    CidadaoPublicoResponse,
    CidadaoResponse,
    CidadaoUpdate,
)
from app.services.cidadao_service import CidadaoService

router = APIRouter(prefix="/cidadaos", tags=["Cidadãos"])


def obter_service(db: Session = Depends(get_db)) -> CidadaoService:
    return CidadaoService(CidadaoRepository(db))


def exigir_direcao(
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
) -> ServidorAutenticado:
    if not servidor.eh_direcao:
        raise HTTPException(
            status_code=403,
            detail="Apenas a Direção pode realizar esta operação.",
        )
    return servidor


@router.post("/", response_model=CidadaoResponse)
def criar_cidadao(
    dados: CidadaoCreate,
    service: CidadaoService = Depends(obter_service),
):
    try:
        return service.criar(dados)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.get("/", response_model=list[CidadaoResponse])
def listar_cidadaos(
    _servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    limite: int = 500,
    offset: int = 0,
    service: CidadaoService = Depends(obter_service),
):
    return service.listar(limite=limite, offset=offset)


@router.get("/buscar", response_model=list[CidadaoResponse])
def buscar_cidadaos(
    termo: str,
    _servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: CidadaoService = Depends(obter_service),
):
    return service.buscar(termo)


@router.post("/identificar", response_model=CidadaoPublicoResponse)
def identificar_cidadao(
    dados: CidadaoIdentificar,
    service: CidadaoService = Depends(obter_service),
):
    try:
        return service.identificar(dados.termo)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.get("/{cidadao_id}", response_model=CidadaoResponse)
def buscar_cidadao(
    cidadao_id: int,
    _servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: CidadaoService = Depends(obter_service),
):
    try:
        return service.buscar_por_id(cidadao_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.put("/{cidadao_id}", response_model=CidadaoResponse)
def atualizar_cidadao(
    cidadao_id: int,
    dados: CidadaoUpdate,
    _servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: CidadaoService = Depends(obter_service),
):
    try:
        return service.atualizar(cidadao_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.delete("/{cidadao_id}")
def excluir_cidadao(
    cidadao_id: int,
    _servidor: ServidorAutenticado = Depends(exigir_direcao),
    service: CidadaoService = Depends(obter_service),
):
    try:
        total_atendimentos = service.excluir(cidadao_id)
        return {
            "mensagem": "Cidadão excluído com sucesso.",
            "atendimentos_removidos": total_atendimentos,
        }
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro
