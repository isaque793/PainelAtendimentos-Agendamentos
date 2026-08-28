from datetime import datetime

from app.core.auth import ServidorAutenticado
from app.repositories.atendimento_repository import AtendimentoRepository
from app.repositories.auditoria_repository import AuditoriaRepository
from app.repositories.cidadao_repository import CidadaoRepository
from app.repositories.documento_repository import DocumentoRepository
from app.repositories.setor_repository import SetorRepository
from app.schemas.atendimento import (
    AtendimentoCancelar,
    AtendimentoConvocar,
    AtendimentoCreate,
    AtendimentoFinalizar,
    AtendimentoIniciar,
    AtendimentoEncaminhar,
)
from app.models.atendimento import (
    Atendimento,
    StatusAtendimento,
    TipoFinalizacao,
)
from app.models.documento_atendimento import DocumentoAtendimento



class AtendimentoService:

    def __init__(
        self,
        repository: AtendimentoRepository,
        cidadao_repository: CidadaoRepository,
        setor_repository: SetorRepository,
        auditoria_repository: AuditoriaRepository | None = None,
        documento_repository: DocumentoRepository | None = None,
    ):
        self.repository = repository
        self.cidadao_repository = cidadao_repository
        self.setor_repository = setor_repository
        self.auditoria_repository = auditoria_repository
        self.documento_repository = documento_repository

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

    def _registrar_log(
        self,
        atendimento: Atendimento,
        acao: str,
        servidor: ServidorAutenticado,
    ) -> None:
        if self.auditoria_repository is None:
            return

        self.auditoria_repository.registrar(
            atendimento_id=atendimento.id,
            acao=acao,
            setor_id=servidor.setor_id,
            servidor_nome=servidor.servidor_nome,
            servidor_masp=servidor.servidor_masp,
        )

    def _verificar_mesmo_setor(
        self,
        atendimento: Atendimento,
        servidor: ServidorAutenticado,
    ) -> None:
        """Impede que um servidor autenticado num setor mexa em
        atendimentos de outro setor, mesmo sabendo o ID do atendimento."""
        if atendimento.setor_id != servidor.setor_id:
            raise ValueError(
                "Este atendimento pertence a outro setor."
            )

    

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

        numero_do_dia = (
            self.repository.contar_hoje_por_setor(setor.id) + 1
        )
        numero_senha = f"{setor.sigla}-{numero_do_dia:03d}"

        atendimento = Atendimento(
            cidadao_id=dados.cidadao_id,
            setor_id=setor.id,
            numero_senha=numero_senha,
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
        cidadao_id: int | None = None,
        setor_id: int | None = None,
        limite: int = 100,
        offset: int = 0,
    ) -> list[Atendimento]:
        """
        ``setor_id=None`` traz o histórico completo do cidadão, de
        todos os setores — é o que a Direção recebe. Para um operador
        comum, o router preenche o próprio setor aqui, então ele só
        enxerga a parte do histórico atendida no setor dele.
        """
        return self.repository.listar_todos(
            cidadao_id=cidadao_id,
            setor_id=setor_id,
            limite=limite,
            offset=offset,
        )

    def listar_fila(
        self,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        if setor_id is not None:
            self._buscar_setor_ativo(setor_id)

        return self.repository.listar_fila(
            setor_id
        )

    def listar_aguardando(
        self,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        if setor_id is not None:
            self._buscar_setor_ativo(setor_id)

        return self.repository.listar_aguardando(
            setor_id
        )

    def listar_em_atendimento(
        self,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        if setor_id is not None:
            self._buscar_setor_ativo(setor_id)

        return self.repository.listar_em_atendimento(
            setor_id
        )

    def listar_finalizados(
        self,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        if setor_id is not None:
            self._buscar_setor_ativo(setor_id)

        return self.repository.listar_finalizados(
            setor_id
        )

    def listar_por_periodo(
        self,
        inicio: datetime,
        fim: datetime,
        setor_id: int | None = None,
    ) -> list[Atendimento]:
        """
        Atendimentos dentro de um período (usado pelo relatório em
        Excel, mensal ou semanal). ``setor_id=None`` agrega TODOS os
        setores — uso exclusivo da Direção; para um operador comum, o
        router sempre preenche o próprio setor antes de chegar aqui.
        """
        if setor_id is not None:
            self._buscar_setor_ativo(setor_id)

        return self.repository.listar_por_periodo(
            setor_id=setor_id,
            inicio=inicio,
            fim=fim,
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
                "numero_senha": atendimento.numero_senha,
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
        dados: AtendimentoConvocar,  # noqa: ARG002 (mantido por compat. de assinatura)
        servidor: ServidorAutenticado,
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

        self._verificar_mesmo_setor(atendimento, servidor)

        setor = self._buscar_setor_ativo(
            servidor.setor_id
        )

        atendimento.servidor_nome = servidor.servidor_nome
        atendimento.servidor_masp = servidor.servidor_masp

        atendimento.numero_sala = (
            setor.numero_sala
        )

        atendimento.status = (
            StatusAtendimento.CONVOCADO.value
        )

        atendimento.data_convocacao = (
            datetime.now()
        )

        atendimento = self.repository.salvar(
            atendimento
        )

        self._registrar_log(atendimento, "CONVOCAR", servidor)

        return atendimento

    def iniciar(
        self,
        atendimento_id: int,
        dados: AtendimentoIniciar,  # noqa: ARG002
        servidor: ServidorAutenticado,
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

        self._verificar_mesmo_setor(atendimento, servidor)

        atendimento.status = (
            StatusAtendimento.EM_ATENDIMENTO.value
        )

        atendimento.data_inicio = datetime.now()

        if atendimento.data_convocacao is None:
            atendimento.data_convocacao = (
                datetime.now()
            )

        # Se por algum motivo o atendimento pulou direto de AGUARDANDO
        # para EM_ATENDIMENTO sem passar por "convocar", garante que o
        # servidor responsável fique registrado mesmo assim.
        if not atendimento.servidor_nome:
            atendimento.servidor_nome = servidor.servidor_nome
            atendimento.servidor_masp = servidor.servidor_masp

        atendimento = self.repository.salvar(
            atendimento
        )

        self._registrar_log(atendimento, "INICIAR", servidor)

        return atendimento

    def finalizar(
        self,
        atendimento_id: int,
        dados: AtendimentoFinalizar,
        servidor: ServidorAutenticado,
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

        self._verificar_mesmo_setor(atendimento, servidor)

        atendimento.status = (
    StatusAtendimento.FINALIZADO.value
)

        atendimento.tipo_finalizacao = (
            TipoFinalizacao.CONCLUIDO.value
        )

        atendimento.data_finalizacao = (
            datetime.now()
        )

        atendimento.resultado = dados.resultado
        atendimento.observacoes = dados.observacoes

        atendimento = self.repository.salvar(
            atendimento
        )

        self._registrar_log(atendimento, "FINALIZAR", servidor)

        return atendimento

    def cancelar(
        self,
        atendimento_id: int,
        dados: AtendimentoCancelar,
        servidor: ServidorAutenticado,
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

        self._verificar_mesmo_setor(atendimento, servidor)

        atendimento.status = (
            StatusAtendimento.CANCELADO.value
        )

        atendimento.observacoes = dados.observacoes
        atendimento.data_finalizacao = datetime.now()

        atendimento = self.repository.salvar(
            atendimento
        )

        self._registrar_log(atendimento, "CANCELAR", servidor)

        return atendimento

    
    def encaminhar(
    self,
    atendimento_id: int,
    dados: AtendimentoEncaminhar,
    servidor: ServidorAutenticado,
    documentos: list[dict] | None = None,
) -> Atendimento:
        atendimento = self.buscar_por_id(atendimento_id)

        if atendimento.status != StatusAtendimento.EM_ATENDIMENTO.value:
            raise ValueError(
                "Somente atendimentos em andamento podem ser encaminhados."
            )

        self._verificar_mesmo_setor(atendimento, servidor)

        if atendimento.setor_id == dados.setor_destino_id:
            raise ValueError(
                "Não é possível encaminhar o atendimento para o mesmo setor."
            )

        setor_destino = self._buscar_setor_ativo(
            dados.setor_destino_id
        )

        if atendimento.atendimento_encaminhado:
            raise ValueError(
                "Este atendimento já foi encaminhado."
            )

        agora = datetime.now()

        atendimento.status = StatusAtendimento.FINALIZADO.value
        atendimento.tipo_finalizacao = TipoFinalizacao.ENCAMINHADO.value
        atendimento.data_finalizacao = agora
        atendimento.resultado = (
            f"Encaminhado para {setor_destino.nome}"
        )
        atendimento.observacoes = dados.motivo

        atendimento = self.repository.salvar(
            atendimento
        )

        numero_do_dia = (
            self.repository.contar_hoje_por_setor(
                setor_destino.id
            ) + 1
        )

        numero_senha = (
            f"{setor_destino.sigla}-{numero_do_dia:03d}"
        )

        novo_atendimento = Atendimento(
            cidadao_id=atendimento.cidadao_id,
            setor_id=setor_destino.id,
            numero_senha=numero_senha,
            assunto=atendimento.assunto,
            descricao=(
                f"Encaminhado do setor {atendimento.setor.nome}. "
                f"Motivo: {dados.motivo}"
            ),
            prioridade=atendimento.prioridade,
            status=StatusAtendimento.AGUARDANDO.value,
            atendimento_origem_id=atendimento.id,
        )

        novo_atendimento = self.repository.criar(
            novo_atendimento
        )

        documentos_recebidos = list(documentos or [])

        # Propaga anexos já existentes e adiciona os novos enviados no modal.
        # O destino recebe cópias próprias, preservando a trilha de origem.
        if self.documento_repository is not None:
            documentos_para_destino = []

            for documento_origem in atendimento.documentos:
                documentos_para_destino.append(
                    {
                        "nome_arquivo": documento_origem.nome_arquivo,
                        "tipo_conteudo": documento_origem.tipo_conteudo,
                        "conteudo": documento_origem.conteudo,
                        "enviado_por_nome": documento_origem.enviado_por_nome,
                        "enviado_por_masp": documento_origem.enviado_por_masp,
                        "documento_origem_id": documento_origem.id,
                    }
                )

            documentos_para_destino.extend(documentos_recebidos)

            for dados_documento in documentos_para_destino:
                self.documento_repository.criar(
                    DocumentoAtendimento(
                        atendimento_id=novo_atendimento.id,
                        documento_origem_id=dados_documento.get(
                            "documento_origem_id"
                        ),
                        nome_arquivo=dados_documento["nome_arquivo"],
                        tipo_conteudo=dados_documento["tipo_conteudo"],
                        tamanho_bytes=len(dados_documento["conteudo"]),
                        conteudo=dados_documento["conteudo"],
                        enviado_por_nome=dados_documento["enviado_por_nome"],
                        enviado_por_masp=dados_documento["enviado_por_masp"],
                    )
                )

        quantidade_documentos = len(documentos_recebidos)
        self._registrar_log(
            atendimento,
            f"ENCAMINHAR:{setor_destino.id}:DOCS:{quantidade_documentos}",
            servidor,
        )

        return self.repository.buscar_por_id(novo_atendimento.id)
