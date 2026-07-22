from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.setor import Setor


class SetorRepository:

    def __init__(self, db: Session):
        self.db = db

    def criar(self, setor: Setor) -> Setor:
        self.db.add(setor)
        self.db.commit()
        self.db.refresh(setor)

        return setor

    def listar(self) -> list[Setor]:
        comando = (
            select(Setor)
            .order_by(Setor.nome)
        )

        return list(
            self.db.scalars(comando).all()
        )

    def listar_ativos(self) -> list[Setor]:
        comando = (
            select(Setor)
            .where(Setor.ativo.is_(True))
            .order_by(Setor.nome)
        )

        return list(
            self.db.scalars(comando).all()
        )

    def buscar_por_id(
        self,
        setor_id: int,
    ) -> Setor | None:
        return self.db.get(Setor, setor_id)

    def buscar_por_nome(
        self,
        nome: str,
    ) -> Setor | None:
        comando = select(Setor).where(
            Setor.nome == nome
        )

        return self.db.scalar(comando)

    def buscar_por_sigla(
        self,
        sigla: str,
    ) -> Setor | None:
        comando = select(Setor).where(
            Setor.sigla == sigla
        )

        return self.db.scalar(comando)

    def atualizar(self, setor: Setor) -> Setor:
        self.db.commit()
        self.db.refresh(setor)

        return setor