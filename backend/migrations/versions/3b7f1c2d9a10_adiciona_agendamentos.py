"""adiciona tabela de agendamentos

Revision ID: 3b7f1c2d9a10
Revises: 2a9837209702
Create Date: 2026-08-28
"""

from alembic import op
import sqlalchemy as sa


revision = "3b7f1c2d9a10"
down_revision = "2a9837209702"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "agendamentos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("protocolo", sa.String(length=30), nullable=False),
        sa.Column("setor_id", sa.Integer(), nullable=False),
        sa.Column("cidadao_id", sa.Integer(), nullable=False),
        sa.Column("data_hora", sa.DateTime(), nullable=False),
        sa.Column("assunto", sa.String(length=150), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(["cidadao_id"], ["cidadaos.id"]),
        sa.ForeignKeyConstraint(["setor_id"], ["setores.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("protocolo"),
    )
    op.create_index(
        "ix_agendamentos_protocolo",
        "agendamentos",
        ["protocolo"],
        unique=True,
    )
    op.create_index(
        "ix_agendamentos_setor_id",
        "agendamentos",
        ["setor_id"],
        unique=False,
    )
    op.create_index(
        "ix_agendamentos_cidadao_id",
        "agendamentos",
        ["cidadao_id"],
        unique=False,
    )
    op.create_index(
        "ix_agendamentos_data_hora",
        "agendamentos",
        ["data_hora"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_agendamentos_data_hora", table_name="agendamentos")
    op.drop_index("ix_agendamentos_cidadao_id", table_name="agendamentos")
    op.drop_index("ix_agendamentos_setor_id", table_name="agendamentos")
    op.drop_index("ix_agendamentos_protocolo", table_name="agendamentos")
    op.drop_table("agendamentos")
