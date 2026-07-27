import re

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    computed_field,
    field_validator,
)

from app.utils.formatacao import (
    apenas_digitos,
    formatar_cpf,
    formatar_masp,
)


def _validar_cpf(cpf: str) -> str:
    """Valida um CPF pelo algoritmo oficial dos dígitos verificadores.
    Aceita o valor com ou sem pontuação (000.000.000-00 ou 00000000000)
    e sempre retorna só os 11 dígitos, sem formatação."""
    digitos = re.sub(r"\D", "", cpf)

    if len(digitos) != 11:
        raise ValueError("O CPF deve ter 11 dígitos.")

    # CPFs com todos os dígitos iguais (ex.: 111.111.111-11) passam no
    # cálculo do dígito verificador mas nunca são válidos na prática.
    if digitos == digitos[0] * 11:
        raise ValueError("CPF inválido.")

    def _digito_verificador(parcial: str) -> str:
        peso_inicial = len(parcial) + 1
        soma = sum(
            int(digito) * peso
            for digito, peso in zip(
                parcial, range(peso_inicial, 1, -1)
            )
        )
        resto = (soma * 10) % 11
        return "0" if resto == 10 else str(resto)

    primeiro_digito = _digito_verificador(digitos[:9])
    segundo_digito = _digito_verificador(digitos[:9] + primeiro_digito)

    if digitos[9:] != primeiro_digito + segundo_digito:
        raise ValueError("CPF inválido.")

    return digitos


def _normalizar_cpf(valor: str | None) -> str | None:
    if valor is None or valor.strip() == "":
        return None

    return _validar_cpf(valor)


def _normalizar_masp(valor: str | None) -> str | None:
    """Guarda o MASP só com os dígitos — a máscara 1234567-8 é aplicada
    na exibição. Assim '1234567-8' e '12345678' são o mesmo registro."""
    if valor is None or valor.strip() == "":
        return None

    return apenas_digitos(valor)


class CidadaoCreate(BaseModel):
    nome: str
    cpf: str | None = None
    telefone: str | None = None
    email: EmailStr | None = None
    masp: str | None = None

    @field_validator("cpf")
    @classmethod
    def validar_cpf(cls, valor: str | None) -> str | None:
        return _normalizar_cpf(valor)

    @field_validator("masp")
    @classmethod
    def validar_masp(cls, valor: str | None) -> str | None:
        return _normalizar_masp(valor)

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, valor: str) -> str:
        valor = valor.strip()
        if len(valor) < 3:
            raise ValueError("Informe o nome completo.")
        return valor


class CidadaoResponse(CidadaoCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def cpf_formatado(self) -> str | None:
        """CPF pronto para exibição (000.000.000-00). O campo `cpf`
        continua vindo só com dígitos, para buscas e comparações."""
        return formatar_cpf(self.cpf)

    @computed_field
    @property
    def masp_formatado(self) -> str | None:
        """MASP pronto para exibição, no formato oficial (1234567-8)."""
        return formatar_masp(self.masp)


class CidadaoUpdate(BaseModel):
    nome: str | None = None
    cpf: str | None = None
    telefone: str | None = None
    email: EmailStr | None = None
    masp: str | None = None

    @field_validator("cpf")
    @classmethod
    def validar_cpf(cls, valor: str | None) -> str | None:
        return _normalizar_cpf(valor)

    @field_validator("masp")
    @classmethod
    def validar_masp(cls, valor: str | None) -> str | None:
        return _normalizar_masp(valor)


class CidadaoIdentificar(BaseModel):
    """
    Entrada do "login do cidadão" no totem: quem já tem cadastro informa
    CPF, MASP ou nome e o sistema recupera o registro existente, em vez
    de tentar cadastrar de novo (o que esbarraria no CPF único).
    """
    termo: str

    @field_validator("termo")
    @classmethod
    def validar_termo(cls, valor: str) -> str:
        valor = valor.strip()

        if len(valor) < 3:
            raise ValueError(
                "Informe pelo menos 3 caracteres do CPF, MASP ou nome."
            )

        return valor
