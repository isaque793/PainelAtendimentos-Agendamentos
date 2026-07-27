from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.atendimento import Atendimento, StatusAtendimento


class AtendimentoRepository:

    def __init__(self, db: Session):
        self.db = db

    def contar_hoje_por_setor(self, setor_id: int) -> int:
        """Quantos atendimentos já foram criados hoje neste setor — usado
        para numerar a senha/ficha do próximo (ex.: 'A-004')."""
        inicio_do_dia = datetime.now().replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        comando = select(func.count(Atendimento.id)).where(
            Atendimento.setor_id == setor_id,
            Atendimento.data_solicitacao >= inicio_do_dia,
        )

        return self.db.scalar(comando) or 0

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

    def listar_todos(
        self,
        cidadao_id: int | None = None,
        setor_id: int | None = None,
        limite: int = 100,
        offset: int = 0,
    ) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .order_by(Atendimento.data_solicitacao.desc())
        )

        if cidadao_id is not None:
            comando = comando.where(
                Atendimento.cidadao_id == cidadao_id
            )

        if setor_id is not None:
            comando = comando.where(
                Atendimento.setor_id == setor_id
            )

        comando = comando.offset(offset).limit(limite)

        return list(
            self.db.scalars(comando).all()
        )

    def listar_fila(
        self,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
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

        if setor_id is not None:
            comando = comando.where(Atendimento.setor_id == setor_id)

        return list(
            self.db.scalars(comando).all()
        )

    def listar_aguardando(
        self,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
                Atendimento.status
                == StatusAtendimento.AGUARDANDO.value,
            )
            .order_by(
                Atendimento.prioridade.desc(),
                Atendimento.data_solicitacao.asc(),
            )
        )

        if setor_id is not None:
            comando = comando.where(Atendimento.setor_id == setor_id)

        return list(
            self.db.scalars(comando).all()
        )

    def listar_em_atendimento(
        self,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
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

        if setor_id is not None:
            comando = comando.where(Atendimento.setor_id == setor_id)

        return list(
            self.db.scalars(comando).all()
        )

    def listar_finalizados(
        self,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        comando = (
            select(Atendimento)
            .where(
                Atendimento.status
                == StatusAtendimento.FINALIZADO.value,
            )
            .order_by(
                Atendimento.data_finalizacao.desc()
            )
        )

        if setor_id is not None:
            comando = comando.where(Atendimento.setor_id == setor_id)

        return list(
            self.db.scalars(comando).all()
        )

    def listar_por_periodo(
        self,
        inicio: datetime,
        fim: datetime,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        """
        Atendimentos solicitados dentro do período — base do relatório
        em Excel (mensal ou semanal). Inclui os cancelados e os que
        ficaram em aberto, para o relatório refletir o período inteiro
        e não só o que deu certo.

        ``setor_id=None`` agrega TODOS os setores — é o que dá à
        Direção o relatório consolidado; um operador comum nunca chega
        aqui com setor_id=None (o router garante isso antes).
        """
        comando = (
            select(Atendimento)
            .where(
                Atendimento.data_solicitacao >= inicio,
                Atendimento.data_solicitacao <= fim,
            )
            .order_by(Atendimento.data_solicitacao.asc())
        )

        if setor_id is not None:
            comando = comando.where(Atendimento.setor_id == setor_id)

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
