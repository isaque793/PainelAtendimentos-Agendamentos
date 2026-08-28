from datetime import datetime

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.agendamento import Agendamento, StatusAgendamento


class AgendamentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def criar(self, agendamento: Agendamento) -> Agendamento:
        self.db.add(agendamento)
        self.db.commit()
        self.db.refresh(agendamento)
        return agendamento

    def horario_ocupado(self, setor_id: int, data_hora: datetime) -> bool:
        comando = select(Agendamento.id).where(
            and_(
                Agendamento.setor_id == setor_id,
                Agendamento.data_hora == data_hora,
                Agendamento.status == StatusAgendamento.AGENDADO.value,
            )
        )
        return self.db.scalar(comando) is not None

    def gerar_protocolo(self) -> str:
        agora = datetime.now().strftime("%Y%m%d%H%M%S")
        ultimo = self.db.query(Agendamento).order_by(Agendamento.id.desc()).first()
        proximo = (ultimo.id + 1) if ultimo else 1
        return f"SRE-{agora}-{proximo:04d}"

    def listar_por_mes(
        self,
        inicio: datetime,
        fim: datetime,
        setor_id: int | None = None,
    ) -> list[Agendamento]:
        comando = select(Agendamento).where(
            Agendamento.data_hora >= inicio,
            Agendamento.data_hora < fim,
        )

        if setor_id is not None:
            comando = comando.where(Agendamento.setor_id == setor_id)

        comando = comando.order_by(Agendamento.data_hora.asc())
        return list(self.db.scalars(comando).all())

    def buscar_por_protocolo(self, protocolo: str) -> Agendamento | None:
        return self.db.query(Agendamento).filter(
            Agendamento.protocolo == protocolo
        ).first()
