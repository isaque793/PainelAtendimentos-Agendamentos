import os
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext


password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def gerar_hash_senha(senha: str) -> str:
    return password_context.hash(senha)


def verificar_senha(
    senha_informada: str,
    senha_hash: str,
) -> bool:
    return password_context.verify(
        senha_informada,
        senha_hash,
    )


# --- Autenticação por token (JWT) ---
#
# Emitido uma única vez no login do servidor (POST /setores/acesso) e
# exigido em todas as ações de escrita sobre atendimentos (convocar,
# iniciar, finalizar, cancelar). Sem ele, ninguém consegue mexer na fila
# de um setor, mesmo sabendo o setor_id — a senha do setor só é
# conferida no login; depois disso, é o token que prova quem está
# fazendo cada ação.
#
# SECRET_KEY: em produção, DEFINA no .env (variável JWT_SECRET_KEY).
# O valor abaixo é só um fallback para desenvolvimento local — nunca use
# esse valor padrão em um ambiente real.
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "chave-de-desenvolvimento-NAO-use-em-producao-troque-no-.env",
)
ALGORITHM = "HS256"
EXPIRACAO_TOKEN_HORAS = 8


def gerar_token_acesso(dados: dict) -> str:
    """Gera um JWT contendo os dados informados (setor_id, servidor_nome,
    servidor_masp) mais um prazo de expiração."""
    payload = dados.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(
        hours=EXPIRACAO_TOKEN_HORAS
    )
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token_acesso(token: str) -> dict:
    """Decodifica e valida um JWT. Levanta jwt.PyJWTError se o token for
    inválido, adulterado ou tiver expirado."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
