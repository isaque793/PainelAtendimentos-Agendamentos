from pydantic import BaseModel, ConfigDict, EmailStr


class CidadaoCreate(BaseModel):
    nome: str
    cpf: str | None = None
    telefone: str | None = None
    email: EmailStr | None = None
    masp: str | None = None


class CidadaoResponse(CidadaoCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

class CidadaoUpdate(BaseModel):
    nome: str | None = None
    cpf: str | None = None
    telefone: str | None = None
    email: EmailStr | None = None
    masp: str | None = None