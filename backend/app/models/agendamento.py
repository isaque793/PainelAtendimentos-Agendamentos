from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel


class StatusAgendamento(str, Enum):
    AGENDADO = "AGENDADO"
    EM_ATENDIMENTO = "EM_ATENDIMENTO"
    CONCLUIDO = "CONCLUIDO"
    CANCELADO = "CANCELADO"


class Agendamento(BaseModel):
    __tablename__ = "agendamentos"

    protocolo: Mapped[str] = mapped_column(
        String(30), nullable=False, unique=True, index=True
    )

    setor_id: Mapped[int] = mapped_column(
        ForeignKey("setores.id"), nullable=False, index=True
    )

    cidadao_id: Mapped[int] = mapped_column(
        ForeignKey("cidadaos.id"), nullable=False, index=True
    )

    data_hora: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True
    )

    assunto: Mapped[str] = mapped_column(String(150), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=StatusAgendamento.AGENDADO.value
    )

    setor = relationship("Setor", lazy="joined")
    cidadao = relationship("Cidadao", lazy="joined")
