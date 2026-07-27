from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.log_auditoria import LogAuditoria


class AuditoriaRepository:

    def __init__(self, db: Session):
        self.db = db

    def registrar(
        self,
        atendimento_id: int,
        acao: str,
        setor_id: int,
        servidor_nome: str,
        servidor_masp: str,
    ) -> LogAuditoria:
        log = LogAuditoria(
            atendimento_id=atendimento_id,
            acao=acao,
            setor_id=setor_id,
            servidor_nome=servidor_nome,
            servidor_masp=servidor_masp,
        )

        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)

        return log

    def listar_por_setor(
        self,
        setor_id: int,
        limite: int = 200,
    ) -> list[LogAuditoria]:
        comando = (
            select(LogAuditoria)
            .where(LogAuditoria.setor_id == setor_id)
            .order_by(LogAuditoria.created_at.desc())
            .limit(limite)
        )

        return list(self.db.scalars(comando).all())

    def listar_todos(
        self,
        limite: int = 200,
    ) -> list[LogAuditoria]:
        """Auditoria de todos os setores juntos — uso exclusivo da
        Direção."""
        comando = (
            select(LogAuditoria)
            .order_by(LogAuditoria.created_at.desc())
            .limit(limite)
        )

        return list(self.db.scalars(comando).all())

    def listar_por_atendimento(
        self,
        atendimento_id: int,
    ) -> list[LogAuditoria]:
        comando = (
            select(LogAuditoria)
            .where(LogAuditoria.atendimento_id == atendimento_id)
            .order_by(LogAuditoria.created_at.asc())
        )

        return list(self.db.scalars(comando).all())
