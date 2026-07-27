def test_fluxo_completo_de_atendimento(client, token_setor_a):
    cidadao = client.post(
        "/cidadaos/",
        json={"nome": "Fluxo Completo Teste", "masp": "55501"},
    ).json()

    criado = client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao["id"],
            "setor_id": 1,
            "assunto": "Consulta de documentação",
            "prioridade": "NORMAL",
        },
    )
    assert criado.status_code == 201, criado.text
    atendimento = criado.json()
    assert atendimento["status"] == "AGUARDANDO"
    assert atendimento["numero_senha"].startswith("A-")

    headers = {"Authorization": f"Bearer {token_setor_a}"}

    convocado = client.patch(
        f"/atendimentos/{atendimento['id']}/convocar",
        json={},
        headers=headers,
    )
    assert convocado.status_code == 200, convocado.text
    assert convocado.json()["status"] == "CONVOCADO"
    assert convocado.json()["servidor_masp"] == "12345"

    iniciado = client.patch(
        f"/atendimentos/{atendimento['id']}/iniciar",
        json={},
        headers=headers,
    )
    assert iniciado.status_code == 200
    assert iniciado.json()["status"] == "EM_ATENDIMENTO"

    finalizado = client.patch(
        f"/atendimentos/{atendimento['id']}/finalizar",
        json={"resultado": "Resolvido em teste", "observacoes": None},
        headers=headers,
    )
    assert finalizado.status_code == 200
    assert finalizado.json()["status"] == "FINALIZADO"

    # O log de auditoria deve ter uma entrada por ação realizada.
    auditoria = client.get("/atendimentos/auditoria", headers=headers)
    assert auditoria.status_code == 200
    acoes = [log["acao"] for log in auditoria.json()]
    assert "CONVOCAR" in acoes
    assert "INICIAR" in acoes
    assert "FINALIZAR" in acoes


def test_prioridade_prioritario_e_aceita(client):
    cidadao = client.post(
        "/cidadaos/",
        json={"nome": "Pessoa Prioritária", "masp": "55502"},
    ).json()

    resposta = client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao["id"],
            "setor_id": 1,
            "assunto": "Atendimento prioritário",
            "prioridade": "PRIORITARIO",
        },
    )
    assert resposta.status_code == 201
    assert resposta.json()["prioridade"] == "PRIORITARIO"


def test_cancelar_atendimento_ja_finalizado_e_rejeitado(client, token_setor_a):
    cidadao = client.post(
        "/cidadaos/", json={"nome": "Cancelar Depois", "masp": "55503"}
    ).json()

    atendimento = client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao["id"],
            "setor_id": 1,
            "assunto": "Vai ser finalizado",
        },
    ).json()

    headers = {"Authorization": f"Bearer {token_setor_a}"}
    client.patch(f"/atendimentos/{atendimento['id']}/convocar", json={}, headers=headers)
    client.patch(f"/atendimentos/{atendimento['id']}/iniciar", json={}, headers=headers)
    client.patch(
        f"/atendimentos/{atendimento['id']}/finalizar",
        json={"resultado": "Feito", "observacoes": None},
        headers=headers,
    )

    resposta = client.patch(
        f"/atendimentos/{atendimento['id']}/cancelar",
        json={"observacoes": "Tentativa tardia"},
        headers=headers,
    )
    assert resposta.status_code == 400
