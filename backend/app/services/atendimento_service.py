from datetime import datetime

from app.models.atendimento import Atendimento, StatusAtendimento
from app.repositories.atendimento_repository import AtendimentoRepository
from app.repositories.cidadao_repository import CidadaoRepository
from app.repositories.setor_repository import SetorRepository
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
        setor_repository: SetorRepository,
    ):
        self.repository = repository
        self.cidadao_repository = cidadao_repository
        self.setor_repository = setor_repository

    def _buscar_setor_ativo(
        self,
        setor_id: int,
    ):
        setor = self.setor_repository.buscar_por_id(
            setor_id
        )

        if not setor:
            raise ValueError(
                "Setor não encontrado."
            )

        if not setor.ativo:
            raise ValueError(
                "O setor selecionado está desativado."
            )

        return setor

    def criar(
        self,
        dados: AtendimentoCreate,
    ) -> Atendimento:
        cidadao = self.cidadao_repository.buscar_por_id(
            dados.cidadao_id
        )

        if not cidadao:
            raise ValueError(
                "Cidadão não encontrado."
            )

        setor = self._buscar_setor_ativo(
            dados.setor_id
        )

        atendimento = Atendimento(
            cidadao_id=dados.cidadao_id,
            setor_id=setor.id,
            assunto=dados.assunto.strip(),
            descricao=(
                dados.descricao.strip()
                if dados.descricao
                else None
            ),
            prioridade=dados.prioridade.value,
            status=StatusAtendimento.AGUARDANDO.value,
        )

        return self.repository.criar(
            atendimento
        )

    def listar_todos(
        self,
    ) -> list[Atendimento]:
        return self.repository.listar_todos()

    def listar_fila(
        self,
        setor_id: int,
    ) -> list[Atendimento]:
        self._buscar_setor_ativo(setor_id)

        return self.repository.listar_fila(
            setor_id
        )

    def listar_aguardando(
        self,
        setor_id: int,
    ) -> list[Atendimento]:
        self._buscar_setor_ativo(setor_id)

        return self.repository.listar_aguardando(
            setor_id
        )

    def listar_em_atendimento(
        self,
        setor_id: int,
    ) -> list[Atendimento]:
        self._buscar_setor_ativo(setor_id)

        return self.repository.listar_em_atendimento(
            setor_id
        )

    def listar_finalizados(
        self,
        setor_id: int,
    ) -> list[Atendimento]:
        self._buscar_setor_ativo(setor_id)

        return self.repository.listar_finalizados(
            setor_id
        )

    def listar_chamada_publica(
        self,
    ) -> list[dict]:
        """
        Retorna apenas os dados necessários para a
        tela pública de chamadas.
        """
        atendimentos = (
            self.repository.listar_chamadas_recentes()
        )

        return [
            {
                "id": atendimento.id,
                "nome": atendimento.cidadao.nome,
                "numero_sala": atendimento.numero_sala,
                "setor": atendimento.setor.nome,
                "status": atendimento.status,
                "chamado_em": atendimento.data_convocacao,
            }
            for atendimento in atendimentos
        ]

    def buscar_por_id(
        self,
        atendimento_id: int,
    ) -> Atendimento:
        atendimento = self.repository.buscar_por_id(
            atendimento_id
        )

        if not atendimento:
            raise ValueError(
                "Atendimento não encontrado."
            )

        return atendimento

    def convocar(
        self,
        atendimento_id: int,
        dados: AtendimentoConvocar,
    ) -> Atendimento:
        atendimento = self.buscar_por_id(
            atendimento_id
        )

        if (
            atendimento.status
            != StatusAtendimento.AGUARDANDO.value
        ):
            raise ValueError(
                "Somente atendimentos aguardando "
                "podem ser convocados."
            )

        if atendimento.setor_id != dados.setor_id:
            raise ValueError(
                "Este atendimento pertence a outro setor."
            )

        setor = self._buscar_setor_ativo(
            dados.setor_id
        )

        atendimento.servidor_nome = (
            dados.servidor_nome.strip()
        )

        atendimento.servidor_masp = (
            dados.servidor_masp.strip()
        )

        atendimento.numero_sala = (
            setor.numero_sala
        )

        atendimento.status = (
            StatusAtendimento.CONVOCADO.value
        )

        atendimento.data_convocacao = (
            datetime.now()
        )

        return self.repository.salvar(
            atendimento
        )

    def iniciar(
        self,
        atendimento_id: int,
        dados: AtendimentoIniciar,
    ) -> Atendimento:
        atendimento = self.buscar_por_id(
            atendimento_id
        )

        if atendimento.status not in [
            StatusAtendimento.AGUARDANDO.value,
            StatusAtendimento.CONVOCADO.value,
        ]:
            raise ValueError(
                "Este atendimento não pode ser iniciado."
            )

        atendimento.status = (
            StatusAtendimento.EM_ATENDIMENTO.value
        )

        atendimento.data_inicio = datetime.now()

        if atendimento.data_convocacao is None:
            atendimento.data_convocacao = (
                datetime.now()
            )

        return self.repository.salvar(
            atendimento
        )

    def finalizar(
        self,
        atendimento_id: int,
        dados: AtendimentoFinalizar,
    ) -> Atendimento:
        atendimento = self.buscar_por_id(
            atendimento_id
        )

        if (
            atendimento.status
            != StatusAtendimento.EM_ATENDIMENTO.value
        ):
            raise ValueError(
                "Somente atendimentos em andamento "
                "podem ser finalizados."
            )

        atendimento.status = (
            StatusAtendimento.FINALIZADO.value
        )

        atendimento.data_finalizacao = (
            datetime.now()
        )

        atendimento.resultado = dados.resultado
        atendimento.observacoes = dados.observacoes

        return self.repository.salvar(
            atendimento
        )

    def cancelar(
        self,
        atendimento_id: int,
        dados: AtendimentoCancelar,
    ) -> Atendimento:
        atendimento = self.buscar_por_id(
            atendimento_id
        )

        if atendimento.status in [
            StatusAtendimento.FINALIZADO.value,
            StatusAtendimento.CANCELADO.value,
        ]:
            raise ValueError(
                "Este atendimento não pode ser cancelado."
            )

        atendimento.status = (
            StatusAtendimento.CANCELADO.value
        )

        atendimento.observacoes = dados.observacoes
        atendimento.data_finalizacao = datetime.now()

        return self.repository.salvar(
            atendimento
        )