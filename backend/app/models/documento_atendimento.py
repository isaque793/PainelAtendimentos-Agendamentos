from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel


class DocumentoAtendimento(BaseModel):
    __tablename__ = "documentos_atendimento"

    atendimento_id: Mapped[int] = mapped_column(
        ForeignKey("atendimentos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    documento_origem_id: Mapped[int | None] = mapped_column(
        ForeignKey("documentos_atendimento.id"),
        nullable=True,
        index=True,
    )

    nome_arquivo: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    tipo_conteudo: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        default="application/octet-stream",
    )

    tamanho_bytes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    conteudo: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False,
    )

    enviado_por_nome: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    enviado_por_masp: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    criado_em: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )

    atendimento = relationship(
        "Atendimento",
        back_populates="documentos",
    )

    documento_origem = relationship(
        "DocumentoAtendimento",
        remote_side="DocumentoAtendimento.id",
        foreign_keys=[documento_origem_id],
    )
