from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.atendimento import Atendimento, StatusAtendimento



class AtendimentoRepository:

    def __init__(self, db: Session):
        self.db = db

    def criar(
    self,
    atendimento: Atendimento,
) -> Atendimento:
        self.db.add(atendimento)
        self.db.commit()
        self.db.refresh(atendimento)

        return atendimento

    def buscar_por_id(self, atendimento_id: int) -> Atendimento | None:
        return self.db.get(Atendimento, atendimento_id)

    def listar_todos(self) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .order_by(Atendimento.data_solicitacao.desc())
        )

        return list(
            self.db.scalars(comando).all()
        )

    def listar_fila(
        self,
        setor_id: int,
    ) -> list[Atendimento]:

    
        comando = (
            select(Atendimento)
            .where(
                Atendimento.setor_id == setor_id,
                Atendimento.status.in_(
                    [
                        StatusAtendimento.AGUARDANDO.value,
                        StatusAtendimento.CONVOCADO.value,
                    ]
                ),
            )
            .order_by(
                Atendimento.prioridade.desc(),
                Atendimento.data_solicitacao.asc(),
            )
        )

        return list(
            self.db.scalars(comando).all()
        )

    def listar_aguardando(
        self,
        setor_id: int,
    ) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
                Atendimento.status
                == StatusAtendimento.AGUARDANDO.value,
                Atendimento.setor_id == setor_id,
            )
            .order_by(
                Atendimento.data_solicitacao
            )
        )

        return list(
            self.db.scalars(comando).all()
        )

    def listar_em_atendimento(
    self,
    setor_id: int,
) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
                Atendimento.setor_id == setor_id,
                Atendimento.status.in_(
                    [
                        StatusAtendimento.CONVOCADO.value,
                        StatusAtendimento.EM_ATENDIMENTO.value,
                    ]
                ),
            )
            .order_by(
                Atendimento.data_convocacao.asc()
            )
        )

        return list(
            self.db.scalars(comando).all()
        )

    def listar_finalizados(
    self,
    setor_id: int,
    ) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
                Atendimento.setor_id == setor_id,
                Atendimento.status
                == StatusAtendimento.FINALIZADO.value,
            )
            .order_by(
                Atendimento.data_finalizacao.desc()
            )
        )

        return list(
            self.db.scalars(comando).all()
        )

    def listar_chamadas_recentes(self, limite: int = 8) -> list[Atendimento]:
        """Para a tela de chamada da TV: os atendimentos convocados ou em
        andamento mais recentes, do mais novo pro mais antigo."""
        comando = (
            select(Atendimento)
            .where(
                Atendimento.status.in_(
                    [
                        StatusAtendimento.CONVOCADO.value,
                        StatusAtendimento.EM_ATENDIMENTO.value,
                    ]
                )
            )
            .order_by(Atendimento.data_convocacao.desc())
            .limit(limite)
        )

        return list(
            self.db.scalars(comando).all()
        )

    def salvar(self, atendimento: Atendimento) -> Atendimento:
        self.db.add(atendimento)
        self.db.commit()
        self.db.refresh(atendimento)

        return atendimento