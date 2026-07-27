from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (garante que os modelos sejam registrados)
from app.core.rate_limit import RateLimitMiddleware
from app.core.security import gerar_hash_senha
from app.database.base import Base
from app.database.connection import SessionLocal, engine
from app.models.perfil_setor import PerfilSetor
from app.models.setor import Setor
from app.routers import atendimento_router, cidadao_router
from app.routers.setor_router import router as setor_router


Base.metadata.create_all(bind=engine)


def seed_setores_exemplo():
    """
    Cria setores de exemplo (A, B, C e D) na primeira vez que o sistema
    sobe, só se ainda não existir nenhum setor cadastrado — assim dá pra
    testar o fluxo completo (acesso do servidor, fila, chamada) sem
    precisar cadastrar nada manualmente antes. Senha de todos: "1234".

    Se você já tem setores reais cadastrados, esta função não faz nada
    (só roda quando a tabela de setores está vazia).
    """
    db = SessionLocal()

    try:
        if db.query(Setor).first() is not None:
            return

        senha_hash = gerar_hash_senha("1234")

        setores_exemplo = [
            {"nome": "Setor A", "sigla": "A", "numero_sala": "Sala 1"},
            {"nome": "Setor B", "sigla": "B", "numero_sala": "Sala 2"},
            {"nome": "Setor C", "sigla": "C", "numero_sala": "Sala 3"},
            {"nome": "Setor D", "sigla": "D", "numero_sala": "Sala 4"},
        ]

        for dados in setores_exemplo:
            db.add(
                Setor(
                    nome=dados["nome"],
                    sigla=dados["sigla"],
                    numero_sala=dados["numero_sala"],
                    senha_hash=senha_hash,
                    ativo=True,
                    perfil=PerfilSetor.OPERADOR.value,
                )
            )

        db.commit()
    finally:
        db.close()


def seed_setor_direcao():
    """
    Garante que exista um setor com perfil DIRECAO, mesmo em bancos que
    já tinham A/B/C/D antes desta revisão — por isso roda toda vez que
    o sistema sobe (não só quando a tabela está vazia), checando se já
    existe algum setor de Direção antes de criar. Senha inicial: "1234"
    — troque depois de configurar os diretores de verdade.
    """
    db = SessionLocal()

    try:
        ja_existe = (
            db.query(Setor)
            .filter(Setor.perfil == PerfilSetor.DIRECAO.value)
            .first()
        )

        if ja_existe is not None:
            return

        db.add(
            Setor(
                nome="Direção",
                sigla="DIR",
                numero_sala="Direção",
                senha_hash=gerar_hash_senha("1234"),
                ativo=True,
                perfil=PerfilSetor.DIRECAO.value,
            )
        )

        db.commit()
    finally:
        db.close()


seed_setores_exemplo()
seed_setor_direcao()

app = FastAPI(
    title="Painel de Atendimentos",
    description=(
        "API do Painel de Atendimentos da SRE — fila, chamada, "
        "histórico por cidadão e relatório em Excel (mensal ou "
        "semanal, por setor ou consolidado para a Direção)."
    ),
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Libera também os domínios públicos do GitHub Codespaces
    # (ex.: https://algo-5173.app.github.dev), usados ao acessar o
    # frontend fora do localhost.
    allow_origin_regex=r"https://.*\.app\.github\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Limita quantas solicitações o totem público consegue enviar por
# minuto — protege contra abuso/spam nas rotas sem login.
app.add_middleware(RateLimitMiddleware)

app.include_router(cidadao_router.router)
app.include_router(atendimento_router.router)
app.include_router(setor_router)


@app.get("/")
def verificar_api():
    return {
        "mensagem": "API do Painel de Atendimentos funcionando"
    }
