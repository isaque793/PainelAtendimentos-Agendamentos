"""adiciona o campo perfil ao setor (OPERADOR / DIRECAO)

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-27

Introduz o acesso da Direção: um setor especial que enxerga e relata
dados de todos os setores, em vez de só o próprio. Setores existentes
recebem o perfil OPERADOR (comportamento igual ao que já tinham).
"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "setores",
        sa.Column(
            "perfil",
            sa.String(length=20),
            nullable=False,
            server_default="OPERADOR",
        ),
    )


def downgrade() -> None:
    op.drop_column("setores", "perfil")
