"""
Formatação de documentos.

Regra do projeto: no banco, CPF e MASP ficam SEMPRE guardados só com os
dígitos (sem ponto, traço ou espaço). A formatação é aplicada apenas na
hora de mostrar o dado — em tela ou no relatório. Isso evita o problema
clássico de o mesmo CPF entrar duas vezes, uma com máscara e outra sem,
e passar pela verificação de duplicidade.
"""

import re


def apenas_digitos(valor: str | None) -> str | None:
    """Remove tudo que não é número. Devolve None quando sobra nada."""
    if valor is None:
        return None

    digitos = re.sub(r"\D", "", valor)

    return digitos or None


def formatar_cpf(cpf: str | None) -> str | None:
    """000.000.000-00 — devolve o valor original se não tiver 11 dígitos."""
    digitos = apenas_digitos(cpf)

    if not digitos:
        return None

    if len(digitos) != 11:
        return cpf

    return (
        f"{digitos[:3]}.{digitos[3:6]}.{digitos[6:9]}-{digitos[9:]}"
    )


def formatar_masp(masp: str | None) -> str | None:
    """
    Formato oficial do MASP (Minas Gerais): 7 dígitos de matrícula mais
    1 dígito verificador, separados por hífen — ex.: 1234567-8.

    MASPs com quantidade diferente de dígitos são devolvidos como estão,
    para não desfigurar matrículas antigas ou provisórias.
    """
    digitos = apenas_digitos(masp)

    if not digitos:
        return None

    if len(digitos) != 8:
        return masp

    return f"{digitos[:7]}-{digitos[7:]}"
