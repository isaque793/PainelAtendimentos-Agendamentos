from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.utils.formatacao import formatar_cpf, formatar_masp

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

    @computed_field
    @property
    def cpf_formatado(self) -> str | None:
        """CPF já com máscara (000.000.000-00) para o front só exibir."""
        return formatar_cpf(self.cpf)

    @computed_field
    @property
    def masp_formatado(self) -> str | None:
        """MASP no formato oficial (1234567-8) para exibição."""
        return formatar_masp(self.masp)


class SetorResumo(BaseModel):
    id: int
    nome: str
    sigla: str
    numero_sala: str

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


class AtendimentoResponse(BaseModel):
    id: int
    cidadao_id: int
    cidadao: CidadaoResumo

    setor_id: int
    setor: SetorResumo

    numero_senha: str | None

    assunto: str
    descricao: str | None
    prioridade: PrioridadeAtendimento
    status: StatusAtendimento

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
    """
    Vazio de propósito: quem está convocando (servidor_nome,
    servidor_masp) e de qual setor (setor_id) vêm do token de acesso
    autenticado (ver app/core/auth.py), nunca do corpo da requisição —
    do contrário, qualquer cliente poderia se passar por outro servidor
    só preenchendo esses campos manualmente.
    """
    pass


class AtendimentoIniciar(BaseModel):
    """
    Nenhum dado adicional é necessário aqui: o servidor responsável já
    é registrado no passo de convocação (AtendimentoConvocar). Este
    schema existe só para manter o endpoint explícito e permitir a
    evolução futura sem quebrar o contrato da rota.
    """
    pass


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
    numero_senha: str | None = None
    numero_sala: str | None = None
    setor: str | None = None
    status: StatusAtendimento
    chamado_em: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
