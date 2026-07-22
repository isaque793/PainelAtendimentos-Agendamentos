from app.core.security import gerar_hash_senha, verificar_senha
from app.models.setor import Setor
from app.repositories.setor_repository import SetorRepository
from app.schemas.setor import (
    SetorAcesso,
    SetorAcessoResponse,
    SetorCreate,
    SetorUpdate,
)


class SetorService:

    def __init__(self, repository: SetorRepository):
        self.repository = repository

    def criar(self, dados: SetorCreate) -> Setor:
        nome = dados.nome.strip()
        sigla = dados.sigla.strip().upper()
        numero_sala = dados.numero_sala.strip()

        if self.repository.buscar_por_nome(nome):
            raise ValueError(
                "Já existe um setor cadastrado com esse nome."
            )

        if self.repository.buscar_por_sigla(sigla):
            raise ValueError(
                "Já existe um setor cadastrado com essa sigla."
            )

        setor = Setor(
            nome=nome,
            sigla=sigla,
            numero_sala=numero_sala,
            senha_hash=gerar_hash_senha(dados.senha),
            ativo=True,
        )

        return self.repository.criar(setor)

    def listar(self) -> list[Setor]:
        return self.repository.listar()

    def listar_ativos(self) -> list[Setor]:
        return self.repository.listar_ativos()

    def buscar_por_id(self, setor_id: int) -> Setor:
        setor = self.repository.buscar_por_id(setor_id)

        if not setor:
            raise ValueError("Setor não encontrado.")

        return setor

    def atualizar(
        self,
        setor_id: int,
        dados: SetorUpdate,
    ) -> Setor:
        setor = self.buscar_por_id(setor_id)

        alteracoes = dados.model_dump(
            exclude_unset=True
        )

        if "nome" in alteracoes:
            novo_nome = alteracoes["nome"].strip()

            setor_existente = (
                self.repository.buscar_por_nome(
                    novo_nome
                )
            )

            if (
                setor_existente
                and setor_existente.id != setor.id
            ):
                raise ValueError(
                    "Já existe outro setor com esse nome."
                )

            setor.nome = novo_nome

        if "sigla" in alteracoes:
            nova_sigla = (
                alteracoes["sigla"]
                .strip()
                .upper()
            )

            setor_existente = (
                self.repository.buscar_por_sigla(
                    nova_sigla
                )
            )

            if (
                setor_existente
                and setor_existente.id != setor.id
            ):
                raise ValueError(
                    "Já existe outro setor com essa sigla."
                )

            setor.sigla = nova_sigla

        if "numero_sala" in alteracoes:
            setor.numero_sala = (
                alteracoes["numero_sala"].strip()
            )

        if "ativo" in alteracoes:
            setor.ativo = alteracoes["ativo"]

        if "senha" in alteracoes:
            setor.senha_hash = gerar_hash_senha(
                alteracoes["senha"]
            )

        return self.repository.atualizar(setor)

    def validar_acesso(
        self,
        dados: SetorAcesso,
    ) -> SetorAcessoResponse:
        setor = self.buscar_por_id(
            dados.setor_id
        )

        if not setor.ativo:
            raise ValueError(
                "Este setor está desativado."
            )

        senha_valida = verificar_senha(
            dados.senha,
            setor.senha_hash,
        )

        if not senha_valida:
            raise ValueError(
                "Senha do setor incorreta."
            )

        servidor_nome = (
            dados.servidor_nome
            .strip()
        )

        servidor_masp = (
            dados.servidor_masp
            .strip()
        )

        return SetorAcessoResponse(
            setor_id=setor.id,
            setor_nome=setor.nome,
            setor_sigla=setor.sigla,
            numero_sala=setor.numero_sala,
            servidor_nome=servidor_nome,
            servidor_masp=servidor_masp,
        )