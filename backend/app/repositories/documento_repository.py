from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.documento_atendimento import DocumentoAtendimento


class DocumentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def criar(self, documento: DocumentoAtendimento) -> DocumentoAtendimento:
        self.db.add(documento)
        self.db.commit()
        self.db.refresh(documento)
        return documento

    def listar_por_atendimento(
        self,
        atendimento_id: int,
    ) -> list[DocumentoAtendimento]:
        comando = (
            select(DocumentoAtendimento)
            .where(DocumentoAtendimento.atendimento_id == atendimento_id)
            .order_by(DocumentoAtendimento.criado_em.asc())
        )
        return list(self.db.scalars(comando).all())

    def buscar_por_id(
        self,
        documento_id: int,
    ) -> DocumentoAtendimento | None:
        return self.db.get(DocumentoAtendimento, documento_id)
