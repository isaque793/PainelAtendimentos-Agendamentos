from datetime import datetime

from app.models.atendimento import Atendimento, StatusAtendimento
from app.repositories.atendimento_repository import AtendimentoRepository
from app.repositories.cidadao_repository import CidadaoRepository
from app.schemas.atendimento import (
    AtendimentoCancelar,
    AtendimentoConvocar,
    AtendimentoCreate,
    AtendimentoFinalizar,
    AtendimentoIniciar,
)


class AtendimentoService:

    def __init__(
        self,
        repository: AtendimentoRepository,
        cidadao_repository: CidadaoRepository,
    ):
        self.repository = repository
        self.cidadao_repository = cidadao_repository

    def criar(self, dados: AtendimentoCreate) -> Atendimento:
        cidadao = self.cidadao_repository.buscar_por_id(
            dados.cidadao_id
        )

        if not cidadao:
            raise ValueError("Cidadão não encontrado.")

        return self.repository.criar(dados)

    def listar_todos(self) -> list[Atendimento]:
        return self.repository.listar_todos()

    def listar_fila(self) -> list[Atendimento]:
        return self.repository.listar_fila()

    def listar_aguardando(self) -> list[Atendimento]:
        return self.repository.listar_aguardando()

    def listar_em_atendimento(self) -> list[Atendimento]:
        return self.repository.listar_em_atendimento()

    def listar_finalizados(self) -> list[Atendimento]:
        return self.repository.listar_finalizados()

    def listar_chamada_publica(self) -> list[dict]:
        """Monta manualmente um dicionário mínimo para a tela pública da
        TV — só nome, guichê e status. Nunca inclui CPF, MASP, telefone
        ou e-mail, mesmo que esses campos existam no cidadão associado."""
        atendimentos = self.repository.listar_chamadas_recentes()
        return [
            {
                "id": atendimento.id,
                "nome": atendimento.cidadao.nome,
                "guiche": atendimento.servidor_responsavel,
                "status": atendimento.status,
                "chamado_em": atendimento.data_convocacao,
            }
            for atendimento in atendimentos
        ]

    def buscar_por_id(self, atendimento_id: int) -> Atendimento:
        atendimento = self.repository.buscar_por_id(atendimento_id)

        if not atendimento:
            raise ValueError("Atendimento não encontrado.")

        return atendimento

    def convocar(
        self,
        atendimento_id: int,
        dados: AtendimentoConvocar,
    ) -> Atendimento:
        atendimento = self.buscar_por_id(atendimento_id)

        if atendimento.status != StatusAtendimento.AGUARDANDO.value:
            raise ValueError(
                "Somente atendimentos aguardando podem ser convocados."
            )

        atendimento.status = StatusAtendimento.CONVOCADO.value
        atendimento.data_convocacao = datetime.now()
        atendimento.servidor_responsavel = (
            dados.servidor_responsavel
        )

        return self.repository.salvar(atendimento)

    def iniciar(
        self,
        atendimento_id: int,
        dados: AtendimentoIniciar,
    ) -> Atendimento:
        atendimento = self.buscar_por_id(atendimento_id)

        if atendimento.status not in [
            StatusAtendimento.AGUARDANDO.value,
            StatusAtendimento.CONVOCADO.value,
        ]:
            raise ValueError(
                "Este atendimento não pode ser iniciado."
            )

        atendimento.status = StatusAtendimento.EM_ATENDIMENTO.value
        atendimento.data_inicio = datetime.now()
        atendimento.servidor_responsavel = (
            dados.servidor_responsavel
        )

        if atendimento.data_convocacao is None:
            atendimento.data_convocacao = datetime.now()

        return self.repository.salvar(atendimento)

    def finalizar(
        self,
        atendimento_id: int,
        dados: AtendimentoFinalizar,
    ) -> Atendimento:
        atendimento = self.buscar_por_id(atendimento_id)

        if (
            atendimento.status
            != StatusAtendimento.EM_ATENDIMENTO.value
        ):
            raise ValueError(
                "Somente atendimentos em andamento podem ser finalizados."
            )

        atendimento.status = StatusAtendimento.FINALIZADO.value
        atendimento.data_finalizacao = datetime.now()
        atendimento.resultado = dados.resultado
        atendimento.observacoes = dados.observacoes

        return self.repository.salvar(atendimento)

    def cancelar(
        self,
        atendimento_id: int,
        dados: AtendimentoCancelar,
    ) -> Atendimento:
        atendimento = self.buscar_por_id(atendimento_id)

        if atendimento.status in [
            StatusAtendimento.FINALIZADO.value,
            StatusAtendimento.CANCELADO.value,
        ]:
            raise ValueError(
                "Este atendimento não pode ser cancelado."
            )

        atendimento.status = StatusAtendimento.CANCELADO.value
        atendimento.observacoes = dados.observacoes
        atendimento.data_finalizacao = datetime.now()

        return self.repository.salvar(atendimento)