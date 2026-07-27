from pydantic import BaseModel, ConfigDict, Field

from app.models.perfil_setor import PerfilSetor


class SetorBase(BaseModel):
    nome: str = Field(
        min_length=3,
        max_length=150,
    )

    sigla: str = Field(
        min_length=2,
        max_length=20,
    )

    numero_sala: str = Field(
        min_length=1,
        max_length=30,
    )


class SetorCreate(SetorBase):
    senha: str = Field(
        min_length=4,
        max_length=100,
    )

    perfil: PerfilSetor = PerfilSetor.OPERADOR


class SetorUpdate(BaseModel):
    nome: str | None = Field(
        default=None,
        min_length=3,
        max_length=150,
    )

    sigla: str | None = Field(
        default=None,
        min_length=2,
        max_length=20,
    )

    numero_sala: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )

    senha: str | None = Field(
        default=None,
        min_length=4,
        max_length=100,
    )

    ativo: bool | None = None

    perfil: PerfilSetor | None = None


class SetorResponse(SetorBase):
    id: int
    ativo: bool
    perfil: PerfilSetor

    model_config = ConfigDict(from_attributes=True)


class SetorPublico(BaseModel):
    """
    Schema usado na lista de setores tanto do totem (solicitação de
    atendimento) quanto da tela de login do servidor. O campo `perfil`
    vai junto para que cada tela decida o que fazer com o setor de
    Direção: o totem o esconde (cidadão não solicita atendimento à
    Direção), a tela de login o mostra normalmente.
    """
    id: int
    nome: str
    sigla: str
    perfil: PerfilSetor

    model_config = ConfigDict(from_attributes=True)


class SetorAcesso(BaseModel):
    setor_id: int
    servidor_nome: str = Field(
        min_length=3,
        max_length=150,
    )

    servidor_masp: str = Field(
        min_length=3,
        max_length=30,
    )

    senha: str = Field(
        min_length=4,
        max_length=100,
    )


class SetorAcessoResponse(BaseModel):
    setor_id: int
    setor_nome: str
    setor_sigla: str
    numero_sala: str
    servidor_nome: str
    servidor_masp: str
    perfil: PerfilSetor
    access_token: str
    token_type: str = "bearer"
