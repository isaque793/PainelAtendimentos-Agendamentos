from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.agendamento import StatusAgendamento
from app.schemas.atendimento import SetorResumo


class CidadaoAgendamentoResumo(BaseModel):
    id: int
    nome: str
    cpf: str | None
    masp: str | None
    telefone: str | None
    email: str | None

    model_config = ConfigDict(from_attributes=True)


class AgendamentoCreate(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    cpf: str = Field(min_length=11, max_length=14)
    telefone: str = Field(min_length=8, max_length=20)
    email: EmailStr | None = None
    setor_id: int
    data_hora: datetime
    assunto: str = Field(min_length=3, max_length=150)
    descricao: str | None = Field(default=None, max_length=1000)


class AgendamentoResponse(BaseModel):
    id: int
    protocolo: str
    setor_id: int
    setor: SetorResumo
    cidadao_id: int
    cidadao: CidadaoAgendamentoResumo
    data_hora: datetime
    assunto: str
    descricao: str | None
    status: StatusAgendamento

    model_config = ConfigDict(from_attributes=True)
