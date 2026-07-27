"""remove a tabela de agendamentos

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-27

O módulo de agendamentos foi retirado do sistema: na prática o
atendimento na SRE é por ordem de chegada, e a aba nunca chegou a ser
usada. Esta revisão apaga a tabela que ficou órfã.
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index("ix_agendamentos_status", table_name="agendamentos")
    op.drop_index("ix_agendamentos_data_hora", table_name="agendamentos")
    op.drop_index("ix_agendamentos_setor_id", table_name="agendamentos")
    op.drop_index("ix_agendamentos_cidadao_id", table_name="agendamentos")
    op.drop_table("agendamentos")


def downgrade() -> None:
    op.create_table(
        "agendamentos",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("cidadao_id", sa.Integer(), sa.ForeignKey("cidadaos.id"), nullable=False),
        sa.Column("setor_id", sa.Integer(), sa.ForeignKey("setores.id"), nullable=False),
        sa.Column("data_hora", sa.DateTime(), nullable=False),
        sa.Column("assunto", sa.String(length=150), nullable=False),
        sa.Column("observacoes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False),
    )
    op.create_index("ix_agendamentos_cidadao_id", "agendamentos", ["cidadao_id"])
    op.create_index("ix_agendamentos_setor_id", "agendamentos", ["setor_id"])
    op.create_index("ix_agendamentos_data_hora", "agendamentos", ["data_hora"])
    op.create_index("ix_agendamentos_status", "agendamentos", ["status"])
