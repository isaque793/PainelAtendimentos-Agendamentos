from app.models.cidadao import Cidadao
from app.repositories.cidadao_repository import CidadaoRepository
from app.schemas.cidadao import CidadaoCreate, CidadaoUpdate


class CidadaoService:

    def __init__(self, repository: CidadaoRepository):
        self.repository = repository

    def criar(self, dados: CidadaoCreate) -> Cidadao:
        if not dados.cpf and not dados.masp:
            raise ValueError("Informe um CPF ou um MASP.")

        # Verifica duplicidade só quando o documento foi de fato
        # informado — antes, isso bloqueava erroneamente o segundo
        # cidadão cadastrado apenas com MASP, sem CPF.
        if dados.cpf and self.repository.buscar_por_cpf(dados.cpf):
            raise ValueError(
                "Já existe um cidadão cadastrado com este CPF. "
                "Use a opção \"Já tenho cadastro\" para solicitar um "
                "novo atendimento."
            )

        if dados.masp and self.repository.buscar_por_masp(dados.masp):
            raise ValueError(
                "Já existe um cidadão cadastrado com este MASP. "
                "Use a opção \"Já tenho cadastro\" para solicitar um "
                "novo atendimento."
            )

        cidadao = Cidadao(
            nome=dados.nome,
            cpf=dados.cpf,
            telefone=dados.telefone,
            email=dados.email,
            masp=dados.masp,
        )

        return self.repository.criar(cidadao)

    def listar(self, limite: int = 500, offset: int = 0):
        return self.repository.listar(limite=limite, offset=offset)

    def buscar_por_id(self, cidadao_id: int) -> Cidadao:
        cidadao = self.repository.buscar_por_id(cidadao_id)

        if not cidadao:
            raise ValueError("Cidadão não encontrado.")

        return cidadao

    def excluir(self, cidadao_id: int) -> int:
        """
        Remove o cidadão e o histórico de atendimentos dele. Devolve
        quantos atendimentos foram apagados junto, para a tela poder
        avisar o servidor do que exatamente foi removido.
        """
        cidadao = self.buscar_por_id(cidadao_id)

        total_atendimentos = self.repository.contar_atendimentos(
            cidadao_id
        )

        self.repository.excluir(cidadao)

        return total_atendimentos

    def atualizar(
        self,
        cidadao_id: int,
        dados: CidadaoUpdate,
    ) -> Cidadao:
        cidadao = self.buscar_por_id(cidadao_id)

        campos_enviados = dados.model_dump(exclude_unset=True)

        cpf_final = campos_enviados.get("cpf", cidadao.cpf)
        masp_final = campos_enviados.get("masp", cidadao.masp)

        if not cpf_final and not masp_final:
            raise ValueError("O cidadão deve possuir CPF ou MASP.")

        return self.repository.atualizar(cidadao, dados)

    def buscar(self, termo: str) -> list[Cidadao]:
        return self.repository.buscar(termo)

    def identificar(self, termo: str) -> Cidadao:
        """
        "Login" do cidadão no totem: recebe CPF, MASP ou nome e devolve o
        cadastro correspondente para que ele possa entrar na fila de novo
        sem refazer o cadastro. Só aceita quando a identificação é única —
        com vários homônimos, pede um documento para não colocar a
        solicitação no histórico da pessoa errada.
        """
        encontrados = self.repository.buscar(termo)

        if not encontrados:
            raise ValueError(
                "Nenhum cadastro encontrado com esses dados. "
                "Faça o primeiro cadastro."
            )

        if len(encontrados) > 1:
            raise ValueError(
                "Mais de um cadastro encontrado com esse nome. "
                "Informe o CPF ou o MASP para identificar você."
            )

        return encontrados[0]
