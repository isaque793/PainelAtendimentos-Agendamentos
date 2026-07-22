from pydantic import BaseModel, ConfigDict, Field


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


class SetorResponse(SetorBase):
    id: int
    ativo: bool

    model_config = ConfigDict(from_attributes=True)


class SetorPublico(BaseModel):
    id: int
    nome: str
    sigla: str

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