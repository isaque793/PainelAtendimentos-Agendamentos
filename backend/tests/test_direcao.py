"""
Testes do perfil de acesso da Direção (perfil DIRECAO) introduzido
nesta revisão: isolamento entre setores para operadores comuns, e
acesso agregado (todos os setores) exclusivo da Direção.
"""


def test_gerenciar_setor_exige_direcao(client, token_setor_a):
    """Um operador comum (não-Direção) não pode criar nem editar
    setores — é assim que o perfil DIRECAO é protegido contra
    autopromoção."""
    sem_token = client.post(
        "/setores/",
        json={
            "nome": "Setor Teste Sem Login",
            "sigla": "TSL",
            "numero_sala": "Sala 9",
            "senha": "1234",
        },
    )
    assert sem_token.status_code == 401

    com_operador = client.post(
        "/setores/",
        json={
            "nome": "Setor Teste Operador",
            "sigla": "TSO",
            "numero_sala": "Sala 9",
            "senha": "1234",
        },
        headers={"Authorization": f"Bearer {token_setor_a}"},
    )
    assert com_operador.status_code == 403


def test_direcao_pode_criar_setor(client, token_direcao):
    resposta = client.post(
        "/setores/",
        json={
            "nome": "Setor Teste Direcao",
            "sigla": "TSD",
            "numero_sala": "Sala 9",
            "senha": "1234",
        },
        headers={"Authorization": f"Bearer {token_direcao}"},
    )
    assert resposta.status_code == 201, resposta.text
    assert resposta.json()["perfil"] == "OPERADOR"


def test_setor_direcao_nao_aparece_no_totem(client):
    """
    /setores/publicos é usado tanto pelo totem (solicitação de
    atendimento) quanto pela tela de login — por isso continua trazendo
    o setor de Direção, mas com o perfil marcado para o frontend
    escondê-lo do totem.
    """
    resposta = client.get("/setores/publicos")
    assert resposta.status_code == 200

    direcao = [
        s for s in resposta.json() if s["perfil"] == "DIRECAO"
    ]
    assert len(direcao) == 1
    assert direcao[0]["nome"] == "Direção"


def _criar_e_concluir(client, headers, setor_id, nome, masp):
    cidadao = client.post(
        "/cidadaos/",
        json={"nome": nome, "masp": masp},
    )
    assert cidadao.status_code == 200, cidadao.text

    atendimento = client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao.json()["id"],
            "setor_id": setor_id,
            "assunto": "outros",
            "prioridade": "NORMAL",
        },
    )
    assert atendimento.status_code == 201, atendimento.text

    return atendimento.json()["id"], cidadao.json()["id"]


def test_operador_nao_ve_fila_de_outro_setor_mesmo_forcando_url(
    client,
    token_setor_a,
    token_setor_b,
):
    headers_a = {"Authorization": f"Bearer {token_setor_a}"}
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}

    id_b, _ = _criar_e_concluir(
        client, headers_b, setor_id=2, nome="Fila Isolada B", masp="81001"
    )

    # O operador do Setor A tenta espiar a fila do Setor B passando
    # setor_id=2 na URL — deve continuar vendo só a fila do próprio
    # setor (vazia, nesse caso), porque o parâmetro é ignorado para
    # quem não é Direção.
    resposta = client.get(
        "/atendimentos/fila",
        params={"setor_id": 2},
        headers=headers_a,
    )
    assert resposta.status_code == 200
    ids_na_fila = [item["id"] for item in resposta.json()]
    assert id_b not in ids_na_fila


def test_operador_sem_login_nao_acessa_fila(client):
    resposta = client.get("/atendimentos/fila")
    assert resposta.status_code == 401


def test_direcao_ve_fila_agregada_de_todos_os_setores(
    client,
    token_setor_a,
    token_setor_b,
    token_direcao,
):
    headers_a = {"Authorization": f"Bearer {token_setor_a}"}
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}
    headers_direcao = {"Authorization": f"Bearer {token_direcao}"}

    id_a, _ = _criar_e_concluir(
        client, headers_a, setor_id=1, nome="Fila A p Direcao", masp="81002"
    )
    id_b, _ = _criar_e_concluir(
        client, headers_b, setor_id=2, nome="Fila B p Direcao", masp="81003"
    )

    resposta = client.get(
        "/atendimentos/fila",
        headers=headers_direcao,
    )
    assert resposta.status_code == 200

    ids_na_fila = [item["id"] for item in resposta.json()]
    assert id_a in ids_na_fila
    assert id_b in ids_na_fila


def test_direcao_pode_filtrar_fila_por_setor_especifico(
    client,
    token_setor_a,
    token_setor_b,
    token_direcao,
):
    headers_a = {"Authorization": f"Bearer {token_setor_a}"}
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}
    headers_direcao = {"Authorization": f"Bearer {token_direcao}"}

    id_a, _ = _criar_e_concluir(
        client, headers_a, setor_id=1, nome="Fila A Filtro Dir", masp="81004"
    )
    id_b, _ = _criar_e_concluir(
        client, headers_b, setor_id=2, nome="Fila B Filtro Dir", masp="81005"
    )

    resposta = client.get(
        "/atendimentos/fila",
        params={"setor_id": 1},
        headers=headers_direcao,
    )
    assert resposta.status_code == 200

    ids_na_fila = [item["id"] for item in resposta.json()]
    assert id_a in ids_na_fila
    assert id_b not in ids_na_fila


def test_operador_nao_acessa_atendimento_de_outro_setor_por_id(
    client,
    token_setor_a,
    token_setor_b,
):
    headers_a = {"Authorization": f"Bearer {token_setor_a}"}
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}

    id_b, _ = _criar_e_concluir(
        client, headers_b, setor_id=2, nome="Sozinho no B", masp="81006"
    )

    resposta = client.get(
        f"/atendimentos/{id_b}",
        headers=headers_a,
    )
    assert resposta.status_code == 404


def test_direcao_acessa_atendimento_de_qualquer_setor_por_id(
    client,
    token_setor_b,
    token_direcao,
):
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}
    headers_direcao = {"Authorization": f"Bearer {token_direcao}"}

    id_b, _ = _criar_e_concluir(
        client, headers_b, setor_id=2, nome="Visivel p Direcao", masp="81007"
    )

    resposta = client.get(
        f"/atendimentos/{id_b}",
        headers=headers_direcao,
    )
    assert resposta.status_code == 200


def test_historico_do_cidadao_e_restrito_ao_setor_do_operador(
    client,
    token_setor_a,
    token_setor_b,
):
    headers_a = {"Authorization": f"Bearer {token_setor_a}"}
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}

    _, cidadao_id = _criar_e_concluir(
        client, headers_a, setor_id=1, nome="Historico Cruzado", masp="81008"
    )

    # O mesmo cidadão também é atendido pelo Setor B.
    client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao_id,
            "setor_id": 2,
            "assunto": "outros",
            "prioridade": "NORMAL",
        },
    )

    historico_visto_por_b = client.get(
        "/atendimentos/",
        params={"cidadao_id": cidadao_id},
        headers=headers_b,
    )
    assert historico_visto_por_b.status_code == 200

    setores_vistos = {
        item["setor_id"] for item in historico_visto_por_b.json()
    }
    # O operador do Setor B só enxerga a parte do histórico atendida
    # no próprio setor — nada do Setor A aparece.
    assert setores_vistos == {2}


def test_historico_do_cidadao_completo_para_direcao(
    client,
    token_setor_a,
    token_setor_b,
    token_direcao,
):
    headers_a = {"Authorization": f"Bearer {token_setor_a}"}
    headers_b = {"Authorization": f"Bearer {token_setor_b}"}
    headers_direcao = {"Authorization": f"Bearer {token_direcao}"}

    _, cidadao_id = _criar_e_concluir(
        client, headers_a, setor_id=1, nome="Historico p Direcao", masp="81009"
    )

    client.post(
        "/atendimentos/",
        json={
            "cidadao_id": cidadao_id,
            "setor_id": 2,
            "assunto": "outros",
            "prioridade": "NORMAL",
        },
    )

    historico = client.get(
        "/atendimentos/",
        params={"cidadao_id": cidadao_id},
        headers=headers_direcao,
    )
    assert historico.status_code == 200

    setores_vistos = {item["setor_id"] for item in historico.json()}
    assert setores_vistos == {1, 2}
