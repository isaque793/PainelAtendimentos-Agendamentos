from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.atendimento import (
    PrioridadeAtendimento,
    StatusAtendimento,
)

class CidadaoResumo(BaseModel):
    id: int
    nome: str
    cpf: str | None
    masp: str | None

    model_config = ConfigDict(from_attributes=True)

class AtendimentoCreate(BaseModel):
    cidadao_id: int
    setor_id: int

    assunto: str = Field(
        min_length=3,
        max_length=150,
    )

    descricao: str | None = None

    prioridade: PrioridadeAtendimento = (
        PrioridadeAtendimento.NORMAL
    )


class AtendimentoCreate(BaseModel):
    cidadao_id: int
    setor_id: int

    assunto: str = Field(
        min_length=3,
        max_length=150,
    )

    descricao: str | None = None

    prioridade: PrioridadeAtendimento = (
        PrioridadeAtendimento.NORMAL
    )


class AtendimentoResponse(BaseModel):
    id: int
    cidadao_id: int
    setor_id: int

    assunto: str
    descricao: str | None
    prioridade: str
    status: str

    servidor_nome: str | None
    servidor_masp: str | None
    numero_sala: str | None

    data_solicitacao: datetime
    data_convocacao: datetime | None
    data_inicio: datetime | None
    data_finalizacao: datetime | None

    observacoes: str | None
    resultado: str | None

    model_config = ConfigDict(
        from_attributes=True
    )


class AtendimentoConvocar(BaseModel):
    servidor_nome: str = Field(
        min_length=3,
        max_length=150,
    )

    servidor_masp: str = Field(
        min_length=3,
        max_length=30,
    )

    setor_id: int


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


class ChamadaPublica(BaseModel):
    """
    Schema mínimo para a tela de chamada exibida na TV da sala de espera.

    Propositalmente NÃO inclui CPF, MASP, telefone, e-mail ou qualquer outro
    dado pessoal além do nome — que é o mínimo necessário para a pessoa se
    reconhecer sendo chamada, conforme o princípio de minimização da LGPD.
    """
    id: int
    nome: str
    guiche: str | None = None
    status: StatusAtendimento
    chamado_em: datetime | None = None

    model_config = ConfigDict(from_attributes=True)