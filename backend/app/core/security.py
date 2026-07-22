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