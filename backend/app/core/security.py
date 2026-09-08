import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def gerar_hash_senha(senha: str) -> str:
    return password_context.hash(senha)


def verificar_senha(senha_informada: str, senha_hash: str) -> bool:
    return password_context.verify(senha_informada, senha_hash)


SECRET_KEY_PADRAO = (
    "chave-de-desenvolvimento-NAO-use-em-producao-troque-no-.env"
)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY_PADRAO)
AMBIENTE = os.getenv("APP_ENV", "development").strip().lower()

if AMBIENTE in {"production", "prod"} and SECRET_KEY == SECRET_KEY_PADRAO:
    raise RuntimeError(
        "JWT_SECRET_KEY precisa ser definida com um valor aleatório "
        "antes de iniciar o backend em produção."
    )

ALGORITHM = "HS256"
EXPIRACAO_TOKEN_HORAS = 8


def gerar_token_acesso(dados: dict) -> str:
    payload = dados.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(
        hours=EXPIRACAO_TOKEN_HORAS
    )
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token_acesso(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
