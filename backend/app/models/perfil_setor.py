from enum import Enum


class PerfilSetor(str, Enum):
    """
    OPERADOR: acesso normal — enxerga e opera só o próprio setor.
    DIRECAO: acesso da chefia — enxerga todos os setores e pode gerar
    relatórios consolidados (todos juntos) ou de um setor específico.
    """
    OPERADOR = "OPERADOR"
    DIRECAO = "DIRECAO"
