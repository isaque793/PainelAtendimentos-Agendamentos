from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import ServidorAutenticado, obter_servidor_autenticado
from app.database.connection import get_db
from app.repositories.cidadao_repository import CidadaoRepository
from app.schemas.cidadao import (
    CidadaoCreate,
    CidadaoIdentificar,
    CidadaoResponse,
    CidadaoUpdate,
)
from app.services.cidadao_service import CidadaoService

router = APIRouter(
    prefix="/cidadaos",
    tags=["Cidadãos"],
)


def obter_service(
    db: Session = Depends(get_db),
) -> CidadaoService:
    return CidadaoService(CidadaoRepository(db))


@router.post("/", response_model=CidadaoResponse)
def criar_cidadao(
    dados: CidadaoCreate,
    service: CidadaoService = Depends(obter_service),
):
    try:
        return service.criar(dados)

    except ValueError as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro),
        ) from erro


@router.get("/", response_model=list[CidadaoResponse])
def listar_cidadaos(
    limite: int = 500,
    offset: int = 0,
    service: CidadaoService = Depends(obter_service),
):
    return service.listar(limite=limite, offset=offset)


@router.get("/buscar", response_model=list[CidadaoResponse])
def buscar_cidadaos(
    termo: str,
    service: CidadaoService = Depends(obter_service),
):
    """Busca por nome (parcial), CPF ou MASP — usada pela pesquisa de
    registros no painel de controle. Registrada antes de '/{cidadao_id}'
    para não ser interpretada como um id."""
    return service.buscar(termo)


@router.post("/identificar", response_model=CidadaoResponse)
def identificar_cidadao(
    dados: CidadaoIdentificar,
    service: CidadaoService = Depends(obter_service),
):
    """
    Rota pública usada pelo totem quando o cidadão JÁ TEM cadastro:
    ele informa CPF, MASP ou nome e recebe de volta o próprio registro,
    podendo então entrar na fila novamente. Sem isso, uma segunda visita
    à SRE esbarraria na restrição de CPF único no cadastro.
    """
    try:
        return service.identificar(dados.termo)

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro),
        ) from erro


@router.get("/{cidadao_id}", response_model=CidadaoResponse)
def buscar_cidadao(
    cidadao_id: int,
    service: CidadaoService = Depends(obter_service),
):
    try:
        return service.buscar_por_id(cidadao_id)

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro),
        ) from erro


@router.put("/{cidadao_id}", response_model=CidadaoResponse)
def atualizar_cidadao(
    cidadao_id: int,
    dados: CidadaoUpdate,
    service: CidadaoService = Depends(obter_service),
):
    try:
        return service.atualizar(cidadao_id, dados)

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro),
        ) from erro


@router.delete("/{cidadao_id}")
def excluir_cidadao(
    cidadao_id: int,
    servidor: ServidorAutenticado = Depends(obter_servidor_autenticado),
    service: CidadaoService = Depends(obter_service),
):
    """
    Exclui o cidadão junto com todo o histórico de atendimentos dele.

    Exige login: apagar um cadastro é irreversível e leva junto os
    registros de atendimento, então não pode ficar aberto na rota
    pública. A tela ainda pede confirmação antes de chamar aqui.
    """
    try:
        total_atendimentos = service.excluir(cidadao_id)

        return {
            "mensagem": "Cidadão excluído com sucesso.",
            "atendimentos_removidos": total_atendimentos,
        }

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro),
        ) from erro
