from pydantic import BaseModel, ConfigDict, EmailStr


class CidadaoCreate(BaseModel):
    nome: str
    cpf: str
    telefone: str | None = None
    email: EmailStr | None = None
    masp: str | None = None


class CidadaoResponse(CidadaoCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)