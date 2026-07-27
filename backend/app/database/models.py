# Importaremos aqui todos os modelos do sistema.
#
# Observação: o registro efetivo dos modelos no metadata do SQLAlchemy
# (para o Base.metadata.create_all() em main.py) acontece via
# app/models/__init__.py. Este módulo é mantido apenas por
# compatibilidade/organização e espelha a mesma lista.

from app.models.atendimento import Atendimento
from app.models.cidadao import Cidadao
from app.models.log_auditoria import LogAuditoria
from app.models.setor import Setor

__all__ = [
    "Atendimento",
    "Cidadao",
    "LogAuditoria",
    "Setor",
]
