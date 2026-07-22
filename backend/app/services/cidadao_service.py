from app.models.cidadao import Cidadao
from app.repositories.cidadao_repository import CidadaoRepository
from app.schemas.cidadao import CidadaoCreate, CidadaoUpdate


class CidadaoService:

    def __init__(self, repository: CidadaoRepository):
        self.repository = repository

    def criar(self, dados: CidadaoCreate) -> Cidadao:

        if not dados.cpf and not dados.masp:
            raise ValueError(
                "Informe um CPF ou um MASP"
            )

        # Verifica se já existe um cidadão com o mesmo CPF (só quando um CPF
        # foi de fato informado — antes, isso bloqueava erroneamente o
        # segundo cidadão cadastrado só com MASP, sem CPF).
        if dados.cpf and self.repository.buscar_por_cpf(dados.cpf):
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

    def atualizar(
       self,
       cidadao_id: int,
       dados: CidadaoUpdate
) -> Cidadao:
       cidadao = self.buscar_por_id(cidadao_id)

       cpf_final = (
        dados.cpf
        if dados.cpf is not None
        else cidadao.cpf
    )

       masp_final = (
           dados.masp
           if dados.masp is not None
           else cidadao.masp
    )

       if not cpf_final and not masp_final:
        raise ValueError(
            "O cidadão deve possuir CPF ou MASP."
        )

       return self.repository.atualizar(cidadao, dados)