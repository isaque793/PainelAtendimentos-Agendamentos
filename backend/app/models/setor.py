from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.models.perfil_setor import PerfilSetor


class Setor(BaseModel):
    __tablename__ = "setores"

    nome: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True,
        index=True,
    )

    sigla: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
        index=True,
    )

    numero_sala: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    senha_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    ativo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # "OPERADOR" (padrão): enxerga e opera só o próprio setor.
    # "DIRECAO": enxerga todos os setores e pode gerar relatórios
    # consolidados (todos juntos) ou de um setor específico.
    perfil: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=PerfilSetor.OPERADOR.value,
        server_default=PerfilSetor.OPERADOR.value,
    )

    atendimentos = relationship(
        "Atendimento",
        back_populates="setor",
    )