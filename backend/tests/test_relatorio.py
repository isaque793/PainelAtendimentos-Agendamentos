"""
Testes do relatório de atendimentos em Excel
(GET /atendimentos/relatorio.xlsx).

Cobre: exigência de login, relatório mensal e semanal, isolamento por
setor (um operador só emite o relatório do próprio setor, mesmo
tentando forçar outro pela URL) e o relatório consolidado exclusivo da
Direção (todos os setores juntos, ou um setor específico à escolha).
"""
import io
from datetime import datetime, timedelta

import pytest

openpyxl = pytest.importorskip("openpyxl")

TIPO_XLSX = (
    "application/vnd.openxmlformats-officedocument"
    ".spreadsheetml.sheet"
)


def _abrir_planilha(resposta):
    return openpyxl.load_workbook(io.BytesIO(resposta.content))


def _valores_da_primeira_coluna(aba):
    """Os rótulos da aba de resumo ficam todos na coluna A."""
    return [
        celula.value
        for celula in aba["A"]
        if celula.value is not None
    ]


def _criar_e_concluir_atendimento(
    client,
    headers,
    setor_id,
    nome_cidadao,
    cpf,
    masp_cidadao=None,
):
    cidadao = client.post(
        "/cidadaos/",
        json={"nome": nome_cidadao, "cpf": cpf, "masp": masp_cidadao},
    )
    assert cidadao.status_code == 200, cidadao.text

    atendimento = client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao.json()["id"],
            "setor_id": setor_id,
            "assunto": "documentacao",
            "prioridade": "NORMAL",
        },
    )
    assert atendimento.status_code == 201, atendimento.text

    atendimento_id = atendimento.json()["id"]

    client.patch(
        f"/atendimentos/{atendimento_id}/convocar",
        json={},
        headers=headers,
    )
    client.patch(
        f"/atendimentos/{atendimento_id}/iniciar",
        json={},
        headers=headers,
    )
    client.patch(
        f"/atendimentos/{atendimento_id}/finalizar",
        json={"resultado": "Concluído em teste", "observacoes": None},
        headers=headers,
    )

    return cidadao.json()["id"]


def test_relatorio_exige_login(client):
    resposta = client.get("/atendimentos/relatorio.xlsx")
    assert resposta.status_code == 401


def test_relatorio_mensal_do_proprio_setor(client, token_setor_a):
    headers = {"Authorization": f"Bearer {token_setor_a}"}

    _criar_e_concluir_atendimento(
        client,
        headers,
        setor_id=1,
        nome_cidadao="Relatorio Mensal Teste",
        cpf="104.332.181-00",
    )

    hoje = datetime.now()

    resposta = client.get(
        "/atendimentos/relatorio.xlsx",
        params={"tipo": "mensal", "ano": hoje.year, "mes": hoje.month},
        headers=headers,
    )
    assert resposta.status_code == 200, resposta.text
    assert resposta.headers["content-type"] == TIPO_XLSX

    planilha = _abrir_planilha(resposta)
    assert planilha.sheetnames == ["Resumo", "Atendimentos"]

    detalhes = planilha["Atendimentos"]
    # Relatório de setor único não tem coluna "Setor" (repetitiva).
    assert "Setor" not in [c.value for c in detalhes[1]]

    nomes = [
        linha[1]
        for linha in detalhes.iter_rows(min_row=2, values_only=True)
    ]
    assert "Relatorio Mensal Teste" in nomes

    resumo_rotulos = _valores_da_primeira_coluna(planilha["Resumo"])
    assert "Todos os setores" not in " ".join(
        str(r) for r in resumo_rotulos
    )


def test_relatorio_semanal_do_proprio_setor(client, token_setor_a):
    headers = {"Authorization": f"Bearer {token_setor_a}"}

    _criar_e_concluir_atendimento(
        client,
        headers,
        setor_id=1,
        nome_cidadao="Relatorio Semanal Teste",
        cpf="960.013.389-14",
    )

    hoje = datetime.now().strftime("%Y-%m-%d")

    resposta = client.get(
        "/atendimentos/relatorio.xlsx",
        params={"tipo": "semanal", "data_referencia": hoje},
        headers=headers,
    )
    assert resposta.status_code == 200, resposta.text

    planilha = _abrir_planilha(resposta)
    detalhes = planilha["Atendimentos"]
    nomes = [
        linha[1]
        for linha in detalhes.iter_rows(min_row=2, values_only=True)
    ]
    assert "Relatorio Semanal Teste" in nomes


def test_operador_nao_consegue_forcar_setor_de_outro(
    client,
    token_setor_a,
):
    """
    Mesmo que o operador do Setor A tente passar setor_id=2 na URL, o
    relatório continua sendo só do Setor A — o parâmetro do cliente é
    ignorado para quem não é Direção.
    """
    headers = {"Authorization": f"Bearer {token_setor_a}"}

    _criar_e_concluir_atendimento(
        client,
        headers,
        setor_id=1,
        nome_cidadao="So Do Setor A",
        cpf="083.863.794-99",
    )

    hoje = datetime.now()

    resposta = client.get(
        "/atendimentos/relatorio.xlsx",
        params={
            "tipo": "mensal",
            "ano": hoje.year,
            "mes": hoje.month,
            "setor_id": 2,
        },
        headers=headers,
    )
    assert resposta.status_code == 200, resposta.text

    planilha = _abrir_planilha(resposta)
    nomes = [
        linha[1]
        for linha in planilha["Atendimentos"].iter_rows(
            min_row=2, values_only=True
        )
    ]
    # O cidadão do Setor A aparece — o relatório não pulou para o
    # Setor B só porque o parâmetro pediu isso.
    assert "So Do Setor A" in nomes


def test_operador_de_outro_setor_nao_ve_dados_do_setor_a(
    client,
    token_setor_a,
    token_setor_b,
):
    headers_a = {"Authorization": f"Bearer {token_setor_a}"}
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}

    _criar_e_concluir_atendimento(
        client,
        headers_a,
        setor_id=1,
        nome_cidadao="Exclusivo Setor A",
        cpf="026.542.351-14",
    )

    hoje = datetime.now()

    resposta = client.get(
        "/atendimentos/relatorio.xlsx",
        params={"tipo": "mensal", "ano": hoje.year, "mes": hoje.month},
        headers=headers_b,
    )
    assert resposta.status_code == 200, resposta.text

    planilha = _abrir_planilha(resposta)
    nomes = [
        linha[1]
        for linha in planilha["Atendimentos"].iter_rows(
            min_row=2, values_only=True
        )
    ]
    assert "Exclusivo Setor A" not in nomes


def test_direcao_pode_gerar_relatorio_agregado_de_todos_os_setores(
    client,
    token_setor_a,
    token_setor_b,
    token_direcao,
):
    headers_a = {"Authorization": f"Bearer {token_setor_a}"}
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}
    headers_direcao = {"Authorization": f"Bearer {token_direcao}"}

    _criar_e_concluir_atendimento(
        client,
        headers_a,
        setor_id=1,
        nome_cidadao="Agregado Setor A",
        cpf="161.559.407-89",
    )
    _criar_e_concluir_atendimento(
        client,
        headers_b,
        setor_id=2,
        nome_cidadao="Agregado Setor B",
        cpf="816.184.959-50",
    )

    hoje = datetime.now()

    resposta = client.get(
        "/atendimentos/relatorio.xlsx",
        params={"tipo": "mensal", "ano": hoje.year, "mes": hoje.month},
        headers=headers_direcao,
    )
    assert resposta.status_code == 200, resposta.text

    planilha = _abrir_planilha(resposta)
    detalhes = planilha["Atendimentos"]

    # Relatório agregado ganha a coluna extra "Setor".
    assert "Setor" in [c.value for c in detalhes[1]]

    nomes = [
        linha[1]
        for linha in detalhes.iter_rows(min_row=2, values_only=True)
    ]
    assert "Agregado Setor A" in nomes
    assert "Agregado Setor B" in nomes

    resumo_rotulos = [
        str(v) for v in _valores_da_primeira_coluna(planilha["Resumo"])
    ]
    assert any("Todos os setores" in rotulo for rotulo in resumo_rotulos)
    assert "Atendimentos por setor" in resumo_rotulos


def test_direcao_pode_escolher_um_setor_especifico(
    client,
    token_setor_a,
    token_setor_b,
    token_direcao,
):
    headers_a = {"Authorization": f"Bearer {token_setor_a}"}
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}
    headers_direcao = {"Authorization": f"Bearer {token_direcao}"}

    _criar_e_concluir_atendimento(
        client,
        headers_a,
        setor_id=1,
        nome_cidadao="Direcao Filtrando A",
        cpf="310.341.316-56",
    )
    _criar_e_concluir_atendimento(
        client,
        headers_b,
        setor_id=2,
        nome_cidadao="Direcao Filtrando B",
        cpf="475.255.341-44",
    )

    hoje = datetime.now()

    resposta = client.get(
        "/atendimentos/relatorio.xlsx",
        params={
            "tipo": "mensal",
            "ano": hoje.year,
            "mes": hoje.month,
            "setor_id": 1,
        },
        headers=headers_direcao,
    )
    assert resposta.status_code == 200, resposta.text

    planilha = _abrir_planilha(resposta)
    nomes = [
        linha[1]
        for linha in planilha["Atendimentos"].iter_rows(
            min_row=2, values_only=True
        )
    ]
    assert "Direcao Filtrando A" in nomes
    assert "Direcao Filtrando B" not in nomes


def test_relatorio_com_mes_invalido_e_rejeitado(client, token_setor_a):
    resposta = client.get(
        "/atendimentos/relatorio.xlsx",
        params={"tipo": "mensal", "ano": 2026, "mes": 13},
        headers={"Authorization": f"Bearer {token_setor_a}"},
    )
    assert resposta.status_code == 422


def test_relatorio_semanal_com_data_invalida_e_rejeitado(
    client,
    token_setor_a,
):
    resposta = client.get(
        "/atendimentos/relatorio.xlsx",
        params={"tipo": "semanal", "data_referencia": "27-07-2026"},
        headers={"Authorization": f"Bearer {token_setor_a}"},
    )
    assert resposta.status_code == 422


def test_relatorio_com_tipo_invalido_e_rejeitado(client, token_setor_a):
    resposta = client.get(
        "/atendimentos/relatorio.xlsx",
        params={"tipo": "anual"},
        headers={"Authorization": f"Bearer {token_setor_a}"},
    )
    assert resposta.status_code == 422
