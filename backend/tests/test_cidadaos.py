def test_criar_cidadao_com_cpf_valido(client):
    resposta = client.post(
        "/cidadaos/",
        json={"nome": "Maria da Silva", "cpf": "111.444.777-35"},
    )
    assert resposta.status_code == 200, resposta.text
    corpo = resposta.json()
    assert corpo["nome"] == "Maria da Silva"
    # O CPF deve ser normalizado (sem pontuação) ao ser salvo.
    assert corpo["cpf"] == "11144477735"


def test_criar_cidadao_com_cpf_invalido_e_rejeitado(client):
    resposta = client.post(
        "/cidadaos/",
        json={"nome": "Fulano de Tal", "cpf": "111.111.111-11"},
    )
    assert resposta.status_code == 422


def test_criar_cidadao_com_cpf_nao_numerico_e_rejeitado(client):
    resposta = client.post(
        "/cidadaos/",
        json={"nome": "Ciclano", "cpf": "abc.def.ghi-jk"},
    )
    assert resposta.status_code == 422


def test_criar_cidadao_sem_cpf_nem_masp_e_rejeitado(client):
    resposta = client.post(
        "/cidadaos/",
        json={"nome": "Sem Documento"},
    )
    assert resposta.status_code == 400


def test_nao_permite_cpf_duplicado(client):
    dados = {"nome": "Pessoa Uma", "cpf": "529.982.247-25"}
    primeira = client.post("/cidadaos/", json=dados)
    assert primeira.status_code == 200

    segunda = client.post(
        "/cidadaos/",
        json={"nome": "Pessoa Duas", "cpf": "529.982.247-25"},
    )
    assert segunda.status_code == 400


def test_buscar_cidadaos_por_nome(client):
    client.post(
        "/cidadaos/",
        json={"nome": "Zelia Testando Busca", "masp": "99988"},
    )

    resposta = client.get("/cidadaos/buscar", params={"termo": "Zelia"})
    assert resposta.status_code == 200
    nomes = [c["nome"] for c in resposta.json()]
    assert "Zelia Testando Busca" in nomes
