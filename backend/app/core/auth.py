import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.core.security import decodificar_token_acesso
from app.models.perfil_setor import PerfilSetor

security = HTTPBearer()

class ServidorAutenticado(BaseModel):
    """Identidade do servidor extraída do token — nunca do corpo da
    requisição. Isso impede que alguém finalize/cancele um atendimento
    de outro setor só porque conseguiu adivinhar um setor_id."""
    setor_id: int
    servidor_nome: str
    servidor_masp: str
    perfil: PerfilSetor = PerfilSetor.OPERADOR

    @property
    def eh_direcao(self) -> bool:
        """Tokens emitidos antes desta revisão não têm 'perfil' — o
        padrão OPERADOR (definido acima) garante que eles continuem
        funcionando como sempre, só sem os poderes da Direção."""
        return self.perfil == PerfilSetor.DIRECAO


def obter_servidor_autenticado(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> ServidorAutenticado:

    token = credentials.credentials

    try:
        payload = decodificar_token_acesso(token)
    except jwt.ExpiredSignatureError as erro:
        raise HTTPException(
            status_code=401,
            detail="Sessão expirada. Faça login novamente.",
        ) from erro
    except jwt.PyJWTError as erro:
        raise HTTPException(
            status_code=401,
            detail="Token inválido. Faça login novamente.",
        ) from erro

    try:
        return ServidorAutenticado(
            setor_id=payload["setor_id"],
            servidor_nome=payload["servidor_nome"],
            servidor_masp=payload["servidor_masp"],
            perfil=payload.get("perfil", PerfilSetor.OPERADOR.value),
        )
    except KeyError as erro:
        raise HTTPException(
            status_code=401,
            detail="Token inválido. Faça login novamente.",
        ) from erro
