from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.atendimento import Atendimento, StatusAtendimento
from app.schemas.atendimento import AtendimentoCreate


class AtendimentoRepository:

    def __init__(self, db: Session):
        self.db = db

    def criar(self, dados: AtendimentoCreate) -> Atendimento:
        atendimento = Atendimento(
            cidadao_id=dados.cidadao_id,
            assunto=dados.assunto,
            descricao=dados.descricao,
            prioridade=dados.prioridade.value,
            status=StatusAtendimento.AGUARDANDO.value,
        )

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

    def listar_fila(self) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
                Atendimento.status.in_(
                    [
                        StatusAtendimento.AGUARDANDO.value,
                        StatusAtendimento.CONVOCADO.value,
                    ]
                )
            )
            .order_by(
                Atendimento.prioridade.desc(),
                Atendimento.data_solicitacao.asc(),
            )
        )

        return list(
            self.db.scalars(comando).all()
        )

    def listar_aguardando(self) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
                Atendimento.status
                == StatusAtendimento.AGUARDANDO.value
            )
            .order_by(
                Atendimento.prioridade.desc(),
                Atendimento.data_solicitacao.asc(),
            )
        )

        return list(
            self.db.scalars(comando).all()
        )

    def listar_em_atendimento(self) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
                Atendimento.status
                == StatusAtendimento.EM_ATENDIMENTO.value
            )
            .order_by(Atendimento.data_inicio.asc())
        )

        return list(
            self.db.scalars(comando).all()
        )

    def listar_finalizados(self) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
                Atendimento.status
                == StatusAtendimento.FINALIZADO.value
            )
            .order_by(Atendimento.data_finalizacao.desc())
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