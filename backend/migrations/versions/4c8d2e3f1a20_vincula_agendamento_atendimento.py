"""vincula agendamento ao atendimento

Revision ID: 4c8d2e3f1a20
Revises: 3b7f1c2d9a10
Create Date: 2026-08-28
"""

from alembic import op
import sqlalchemy as sa


revision = "4c8d2e3f1a20"
down_revision = "3b7f1c2d9a10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("atendimentos", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("agendamento_id", sa.Integer(), nullable=True)
        )
        batch_op.create_index(
            "ix_atendimentos_agendamento_id",
            ["agendamento_id"],
            unique=True,
        )
        batch_op.create_foreign_key(
            "fk_atendimentos_agendamento_id",
            "agendamentos",
            ["agendamento_id"],
            ["id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("atendimentos", schema=None) as batch_op:
        batch_op.drop_constraint(
            "fk_atendimentos_agendamento_id",
            type_="foreignkey",
        )
        batch_op.drop_index("ix_atendimentos_agendamento_id")
        batch_op.drop_column("agendamento_id")
