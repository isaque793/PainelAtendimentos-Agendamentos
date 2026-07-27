from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.atendimento import Atendimento
from app.models.cidadao import Cidadao
from app.models.log_auditoria import LogAuditoria
from app.utils.formatacao import apenas_digitos


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
            .filter(Cidadao.cpf == apenas_digitos(cpf))
            .first()
        )

    def buscar_por_masp(self, masp: str) -> Cidadao | None:
        return (
            self.db.query(Cidadao)
            .filter(Cidadao.masp == apenas_digitos(masp))
            .first()
        )

    def buscar_por_id(self, cidadao_id: int) -> Cidadao | None:
        return (
            self.db.query(Cidadao)
            .filter(Cidadao.id == cidadao_id)
            .first()
        )

    def listar(self, limite: int = 500, offset: int = 0) -> list[Cidadao]:
        return (
            self.db.query(Cidadao)
            .order_by(Cidadao.nome.asc())
            .offset(offset)
            .limit(limite)
            .all()
        )

    def contar_atendimentos(self, cidadao_id: int) -> int:
        return (
            self.db.query(Atendimento)
            .filter(Atendimento.cidadao_id == cidadao_id)
            .count()
        )

    def excluir(self, cidadao: Cidadao) -> None:
        """
        Exclui o cidadão e todo o rastro dele. A ordem importa: os logs
        de auditoria apontam para os atendimentos, e os atendimentos
        apontam para o cidadão — apagar o cidadão direto quebraria as
        chaves estrangeiras e o banco recusaria a operação.
        """
        atendimentos = (
            self.db.query(Atendimento)
            .filter(Atendimento.cidadao_id == cidadao.id)
            .all()
        )

        ids_atendimentos = [atendimento.id for atendimento in atendimentos]

        if ids_atendimentos:
            (
                self.db.query(LogAuditoria)
                .filter(LogAuditoria.atendimento_id.in_(ids_atendimentos))
                .delete(synchronize_session=False)
            )

            (
                self.db.query(Atendimento)
                .filter(Atendimento.id.in_(ids_atendimentos))
                .delete(synchronize_session=False)
            )

        self.db.delete(cidadao)
        self.db.commit()

    def atualizar(self, cidadao: Cidadao, dados) -> Cidadao:
        # exclude_unset=True é essencial aqui: sem isso, um PUT parcial
        # (ex.: só {"telefone": "..."}) sobrescreveria nome/cpf/email/masp
        # com None, apagando dados que o cliente nem tentou alterar.
        for chave, valor in dados.model_dump(exclude_unset=True).items():
            setattr(cidadao, chave, valor)

        self.db.commit()
        self.db.refresh(cidadao)

        return cidadao

    def buscar(self, termo: str) -> list[Cidadao]:
        """
        Busca por nome (parcial, sem diferenciar maiúsculas/minúsculas),
        CPF ou MASP. Como o banco guarda os documentos só com dígitos, o
        termo é limpo antes de comparar — assim tanto "144.146.336-48"
        quanto "14414633648" encontram a mesma pessoa.
        """
        termo_normalizado = termo.strip()

        if not termo_normalizado:
            return []

        filtros = [Cidadao.nome.ilike(f"%{termo_normalizado}%")]

        digitos = apenas_digitos(termo_normalizado)

        if digitos:
            filtros.append(Cidadao.cpf == digitos)
            filtros.append(Cidadao.masp == digitos)

        return (
            self.db.query(Cidadao)
            .filter(or_(*filtros))
            .order_by(Cidadao.nome.asc())
            .all()
        )
