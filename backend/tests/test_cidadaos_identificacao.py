"""
Testes das funcionalidades adicionadas na revisão de julho/2026:

* "login" do cidadão que já tem cadastro (POST /cidadaos/identificar);
* exclusão de cadastro levando junto o histórico de atendimentos;
* formatação oficial de CPF e MASP nas respostas da API.
"""


def test_identificar_cidadao_por_cpf(client):
    criado = client.post(
        "/cidadaos/",
        json={"nome": "Joana Retorno", "cpf": "168.995.350-09"},
    )
    assert criado.status_code == 200, criado.text

    # A pessoa digita o CPF com máscara no totem — deve encontrar
    # do mesmo jeito, já que o banco guarda só os dígitos.
    resposta = client.post(
        "/cidadaos/identificar",
        json={"termo": "168.995.350-09"},
    )
    assert resposta.status_code == 200, resposta.text
    assert resposta.json()["id"] == criado.json()["id"]


def test_identificar_cidadao_por_masp(client):
    criado = client.post(
        "/cidadaos/",
        json={"nome": "Servidor Retorno", "masp": "1234567-8"},
    )
    assert criado.status_code == 200, criado.text
    # O MASP também é normalizado para dígitos ao ser salvo.
    assert criado.json()["masp"] == "12345678"

    resposta = client.post(
        "/cidadaos/identificar",
        json={"termo": "12345678"},
    )
    assert resposta.status_code == 200
    assert resposta.json()["id"] == criado.json()["id"]


def test_identificar_cidadao_inexistente_retorna_404(client):
    resposta = client.post(
        "/cidadaos/identificar",
        json={"termo": "999.999.999-99"},
    )
    assert resposta.status_code == 404


def test_identificar_com_termo_curto_e_rejeitado(client):
    resposta = client.post("/cidadaos/identificar", json={"termo": "ab"})
    assert resposta.status_code == 422


def test_identificar_por_nome_ambiguo_pede_documento(client):
    client.post(
        "/cidadaos/",
        json={"nome": "Homonimo Silva Um", "masp": "77701"},
    )
    client.post(
        "/cidadaos/",
        json={"nome": "Homonimo Silva Dois", "masp": "77702"},
    )

    resposta = client.post(
        "/cidadaos/identificar",
        json={"termo": "Homonimo Silva"},
    )
    assert resposta.status_code == 404
    assert "CPF" in resposta.json()["detail"]


def test_cidadao_ja_cadastrado_consegue_novo_atendimento(client):
    """
    Cenário relatado: a pessoa volta à SRE, tenta se cadastrar de novo e
    esbarra no CPF único. Pela rota de identificação ela consegue entrar
    na fila outra vez, e os dois atendimentos ficam no mesmo histórico.
    """
    cidadao = client.post(
        "/cidadaos/",
        json={"nome": "Retorna Sempre", "cpf": "231.002.999-81"},
    )
    assert cidadao.status_code == 200, cidadao.text
    cidadao_id = cidadao.json()["id"]

    # Segunda tentativa de cadastro: continua bloqueada, de propósito.
    duplicado = client.post(
        "/cidadaos/",
        json={"nome": "Retorna Sempre", "cpf": "231.002.999-81"},
    )
    assert duplicado.status_code == 400

    identificado = client.post(
        "/cidadaos/identificar",
        json={"termo": "231.002.999-81"},
    )
    assert identificado.status_code == 200
    assert identificado.json()["id"] == cidadao_id

    for _ in range(2):
        criado = client.post(
            "/atendimentos/",
            json={
                "cidadao_id": cidadao_id,
                "setor_id": 1,
                "assunto": "Vida escolar",
                "prioridade": "NORMAL",
            },
        )
        assert criado.status_code == 201, criado.text

    historico = client.get(
        "/atendimentos/", params={"cidadao_id": cidadao_id}
    )
    assert historico.status_code == 200
    assert len(historico.json()) == 2


def test_resposta_traz_cpf_e_masp_formatados(client):
    resposta = client.post(
        "/cidadaos/",
        json={
            "nome": "Formatacao Teste",
            "cpf": "39053344705",
            "masp": "76543210",
        },
    )
    assert resposta.status_code == 200, resposta.text

    corpo = resposta.json()
    # O campo cru continua só com dígitos (usado em buscas)...
    assert corpo["cpf"] == "39053344705"
    assert corpo["masp"] == "76543210"
    # ...e a versão formatada vem pronta para a tela.
    assert corpo["cpf_formatado"] == "390.533.447-05"
    assert corpo["masp_formatado"] == "7654321-0"


def test_excluir_cidadao_exige_login(client):
    cidadao = client.post(
        "/cidadaos/",
        json={"nome": "Sem Login Nao Apaga", "masp": "66601"},
    ).json()

    resposta = client.delete(f"/cidadaos/{cidadao['id']}")
    assert resposta.status_code == 401


def test_excluir_cidadao_remove_historico_de_atendimentos(
    client,
    token_setor_a,
):
    headers = {"Authorization": f"Bearer {token_setor_a}"}

    cidadao = client.post(
        "/cidadaos/",
        json={"nome": "Para Excluir Teste", "masp": "66602"},
    ).json()

    atendimento = client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao["id"],
            "setor_id": 1,
            "assunto": "Outros assuntos",
            "prioridade": "NORMAL",
        },
    )
    assert atendimento.status_code == 201, atendimento.text

    # Gera um log de auditoria, para provar que a exclusão em cascata
    # também dá conta da tabela que aponta para o atendimento.
    client.patch(
        f"/atendimentos/{atendimento.json()['id']}/convocar",
        json={},
        headers=headers,
    )

    exclusao = client.delete(
        f"/cidadaos/{cidadao['id']}", headers=headers
    )
    assert exclusao.status_code == 200, exclusao.text
    assert exclusao.json()["atendimentos_removidos"] == 1

    assert client.get(f"/cidadaos/{cidadao['id']}").status_code == 404

    restantes = client.get(
        "/atendimentos/", params={"cidadao_id": cidadao["id"]}
    )
    assert restantes.json() == []


def test_excluir_cidadao_inexistente_retorna_404(client, token_setor_a):
    resposta = client.delete(
        "/cidadaos/999999",
        headers={"Authorization": f"Bearer {token_setor_a}"},
    )
    assert resposta.status_code == 404
