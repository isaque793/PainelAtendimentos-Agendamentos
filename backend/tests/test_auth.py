def test_setores_de_exemplo_foram_semeados(client):
    resposta = client.get("/setores/publicos")
    assert resposta.status_code == 200
    siglas = {s["sigla"] for s in resposta.json()}
    assert siglas == {"A", "B", "C", "D"}


def test_login_com_senha_correta_retorna_token(client):
    resposta = client.post(
        "/setores/acesso",
        json={
            "setor_id": 1,
            "servidor_nome": "João Servidor",
            "servidor_masp": "111",
            "senha": "1234",
        },
    )
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert "access_token" in corpo
    assert corpo["token_type"] == "bearer"


def test_login_com_senha_errada_e_rejeitado(client):
    resposta = client.post(
        "/setores/acesso",
        json={
            "setor_id": 1,
            "servidor_nome": "João Servidor",
            "servidor_masp": "111",
            "senha": "senha-errada",
        },
    )
    assert resposta.status_code == 401


def test_convocar_atendimento_sem_token_e_rejeitado(client):
    cidadao = client.post(
        "/cidadaos/", json={"nome": "Alvo do Teste", "masp": "77777"}
    ).json()

    atendimento = client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao["id"],
            "setor_id": 1,
            "assunto": "Teste sem token",
        },
    ).json()

    resposta = client.patch(
        f"/atendimentos/{atendimento['id']}/convocar",
        json={},
    )
    assert resposta.status_code == 401


def test_convocar_atendimento_de_outro_setor_e_rejeitado(client, token_setor_a):
    cidadao = client.post(
        "/cidadaos/", json={"nome": "Pessoa Setor B", "masp": "88888"}
    ).json()

    # setor_id=2 deve ser o Setor B (segundo semeado).
    atendimento = client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao["id"],
            "setor_id": 2,
            "assunto": "Atendimento de outro setor",
        },
    ).json()

    resposta = client.patch(
        f"/atendimentos/{atendimento['id']}/convocar",
        json={},
        headers={"Authorization": f"Bearer {token_setor_a}"},
    )
    assert resposta.status_code == 400
    assert "outro setor" in resposta.json()["detail"]
