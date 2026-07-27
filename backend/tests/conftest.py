"""
Configuração compartilhada dos testes.

IMPORTANTE: as duas linhas de os.environ abaixo precisam rodar ANTES de
qualquer `import app...` — é isso que garante que os testes usem um
banco SQLite temporário e isolado, em vez do banco de desenvolvimento
(painel.db) ou de produção. Por isso elas ficam no topo do arquivo, fora
de qualquer função.
"""
import os
import tempfile

_diretorio_temp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(
    _diretorio_temp, "test_painel.db"
)
os.environ["JWT_SECRET_KEY"] = "chave-de-teste-nao-usar-em-producao"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    """Cliente de teste único para toda a sessão — o banco é criado (e
    populado com os setores de exemplo A/B/C/D, senha '1234') uma única
    vez, na importação de app.main."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def token_setor_a(client):
    """Faz login no Setor A (semeado automaticamente) e devolve um
    token de acesso válido, pronto pra usar no header Authorization."""
    resposta = client.post(
        "/setores/acesso",
        json={
            "setor_id": 1,
            "servidor_nome": "Servidor de Teste",
            "servidor_masp": "12345",
            "senha": "1234",
        },
    )
    assert resposta.status_code == 200, resposta.text
    return resposta.json()["access_token"]


@pytest.fixture()
def token_setor_b(client):
    """Login no Setor B (id 2) — usado para testar o isolamento entre
    setores (um operador de B não pode ver dados de A, e vice-versa)."""
    resposta = client.post(
        "/setores/acesso",
        json={
            "setor_id": 2,
            "servidor_nome": "Servidor do Setor B",
            "servidor_masp": "22222",
            "senha": "1234",
        },
    )
    assert resposta.status_code == 200, resposta.text
    return resposta.json()["access_token"]


@pytest.fixture()
def setor_direcao_id(client):
    """
    Descobre o id do setor de Direção semeado automaticamente pelo
    ``seed_setor_direcao()`` em app.main — não é fixo, então é buscado
    pela lista pública de setores em vez de assumir um número.
    """
    resposta = client.get("/setores/")
    assert resposta.status_code == 200, resposta.text

    direcao = next(
        setor
        for setor in resposta.json()
        if setor["perfil"] == "DIRECAO"
    )
    return direcao["id"]


@pytest.fixture()
def token_direcao(client, setor_direcao_id):
    """Faz login no setor de Direção e devolve um token com
    perfil=DIRECAO, usado para testar o acesso consolidado a todos os
    setores."""
    resposta = client.post(
        "/setores/acesso",
        json={
            "setor_id": setor_direcao_id,
            "servidor_nome": "Diretora de Teste",
            "servidor_masp": "90001",
            "senha": "1234",
        },
    )
    assert resposta.status_code == 200, resposta.text
    return resposta.json()["access_token"]
