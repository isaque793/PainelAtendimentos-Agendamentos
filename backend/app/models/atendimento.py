from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel


class StatusAtendimento(str, Enum):
    AGUARDANDO = "AGUARDANDO"
    CONVOCADO = "CONVOCADO"
    EM_ATENDIMENTO = "EM_ATENDIMENTO"
    FINALIZADO = "FINALIZADO"
    CANCELADO = "CANCELADO"


class PrioridadeAtendimento(str, Enum):
    NORMAL = "NORMAL"
    PRIORITARIO = "PRIORITARIO"


class Atendimento(BaseModel):
    __tablename__ = "atendimentos"

    cidadao_id: Mapped[int] = mapped_column(
        ForeignKey("cidadaos.id"),
        nullable=False,
        index=True,
    )

    servidor_nome: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
   )

    servidor_masp: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    numero_sala: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    assunto: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    descricao: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    prioridade: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=PrioridadeAtendimento.NORMAL.value,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=StatusAtendimento.AGUARDANDO.value,
        index=True,
    )

    data_solicitacao: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )

    data_convocacao: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    data_inicio: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    data_finalizacao: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    servidor_responsavel: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    observacoes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    resultado: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    cidadao = relationship(
        "Cidadao",
        lazy="joined",
    )

    setor_id: Mapped[int] = mapped_column(
    ForeignKey("setores.id"),
    nullable=False,
    index=True,
)

    setor = relationship(
        "Setor",
        back_populates="atendimentos",
        lazy="joined",
    )

