from app.models.cidadao import Cidadao
from app.repositories.cidadao_repository import CidadaoRepository
from app.schemas.cidadao import CidadaoCreate


class CidadaoService:

    def __init__(self, repository: CidadaoRepository):
        self.repository = repository

    def criar(self, dados: CidadaoCreate) -> Cidadao:

        # Verifica se já existe um cidadão com o mesmo CPF
        if self.repository.buscar_por_cpf(dados.cpf):
            raise ValueError("Já existe um cidadão cadastrado com este CPF.")

        cidadao = Cidadao(
            nome=dados.nome,
            cpf=dados.cpf,
            telefone=dados.telefone,
            email=dados.email,
            masp=dados.masp
        )

        return self.repository.criar(cidadao)

    def listar(self):
        return self.repository.listar()

    def buscar_por_id(self, cidadao_id: int):
        cidadao = self.repository.buscar_por_id(cidadao_id)

        if not cidadao:
            raise ValueError("Cidadão não encontrado.")

        return cidadao

    def excluir(self, cidadao_id: int):
        cidadao = self.buscar_por_id(cidadao_id)
        self.repository.excluir(cidadao)