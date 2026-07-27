from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel


class LogAuditoria(BaseModel):
    """
    Registro de quem fez o quê em cada atendimento. Criado sempre que um
    atendimento é convocado, iniciado, finalizado ou cancelado — assim,
    se algo for feito indevidamente, dá pra rastrear quem foi.
    """
    __tablename__ = "logs_auditoria"

    atendimento_id: Mapped[int] = mapped_column(
        ForeignKey("atendimentos.id"),
        nullable=False,
        index=True,
    )

    acao: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )

    setor_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    servidor_nome: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    servidor_masp: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )
