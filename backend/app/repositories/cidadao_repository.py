from sqlalchemy.orm import Session
from app.models.cidadao import Cidadao
from app.schemas.cidadao import CidadaoUpdate

class CidadaoRepository:

    def __init__(self, db: Session):
        self.db = db

    def criar(self, cidadao: Cidadao) -> Cidadao:
        self.db.add(cidadao)
        self.db.commit()
        self.db.refresh(cidadao)
        return cidadao

    def buscar_por_cpf(self, cpf: str) -> Cidadao | None:
        return (
            self.db.query(Cidadao)
            .filter(Cidadao.cpf == cpf)
            .first()
        )

    def buscar_por_id(self, cidadao_id: int) -> Cidadao | None:
        return (
            self.db.query(Cidadao)
            .filter(Cidadao.id == cidadao_id)
            .first()
        )

    def listar(self) -> list[Cidadao]:
        return self.db.query(Cidadao).all()

    def excluir(self, cidadao: Cidadao):
        self.db.delete(cidadao)
        self.db.commit()

    def atualizar(self, cidadao, dados):
        for chave, valor in dados.model_dump().items():
            setattr(cidadao,chave,valor)

        self.db.commit()
        self.db.refresh(cidadao)

        return cidadao