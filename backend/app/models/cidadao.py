from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel


class Cidadao(BaseModel):
    __tablename__ = "cidadaos"

    nome: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    cpf: Mapped[str | None] = mapped_column(
        String(11),
        unique=True,
        nullable=True
    )

    telefone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    email: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    masp: Mapped[str | None] = mapped_column(
        String(20),
        unique=True,
        nullable=True
    )