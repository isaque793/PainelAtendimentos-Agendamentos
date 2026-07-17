from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.atendimento import (
    PrioridadeAtendimento,
    StatusAtendimento,
)


class AtendimentoCreate(BaseModel):
    cidadao_id: int
    assunto: str = Field(
        min_length=3,
        max_length=150,
    )
    descricao: str | None = None
    prioridade: PrioridadeAtendimento = PrioridadeAtendimento.NORMAL


class AtendimentoResponse(BaseModel):
    id: int
    cidadao_id: int
    assunto: str
    descricao: str | None
    prioridade: PrioridadeAtendimento
    status: StatusAtendimento

    data_solicitacao: datetime
    data_convocacao: datetime | None
    data_inicio: datetime | None
    data_finalizacao: datetime | None

    servidor_responsavel: str | None
    observacoes: str | None
    resultado: str | None

    model_config = ConfigDict(from_attributes=True)


class AtendimentoConvocar(BaseModel):
    servidor_responsavel: str = Field(
        min_length=3,
        max_length=150,
    )


class AtendimentoIniciar(BaseModel):
    servidor_responsavel: str = Field(
        min_length=3,
        max_length=150,
    )


class AtendimentoFinalizar(BaseModel):
    resultado: str = Field(
        min_length=3,
    )
    observacoes: str | None = None


class AtendimentoCancelar(BaseModel):
    observacoes: str = Field(
        min_length=3,
    )