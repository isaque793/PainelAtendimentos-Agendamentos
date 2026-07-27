from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LogAuditoriaResponse(BaseModel):
    id: int
    atendimento_id: int
    acao: str
    setor_id: int
    servidor_nome: str
    servidor_masp: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
