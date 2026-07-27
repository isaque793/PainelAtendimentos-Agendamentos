"""schema inicial

Revision ID: 0001
Revises:
Create Date: 2026-07-24

Migração inicial, escrita à mão para refletir exatamente o que
Base.metadata.create_all() já criava nas instalações existentes — a
partir daqui, toda mudança de modelo deve virar uma nova revisão
(``alembic revision --autogenerate -m "descrição"``) em vez de depender
do create_all().
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cidadaos",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("nome", sa.String(length=150), nullable=False),
        sa.Column("cpf", sa.String(length=11), nullable=True),
        sa.Column("telefone", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=150), nullable=True),
        sa.Column("masp", sa.String(length=20), nullable=True),
        sa.UniqueConstraint("cpf"),
        sa.UniqueConstraint("masp"),
    )

    op.create_table(
        "setores",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("nome", sa.String(length=150), nullable=False),
        sa.Column("sigla", sa.String(length=20), nullable=False),
        sa.Column("numero_sala", sa.String(length=30), nullable=False),
        sa.Column("senha_hash", sa.String(length=255), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.UniqueConstraint("nome"),
        sa.UniqueConstraint("sigla"),
    )
    op.create_index("ix_setores_nome", "setores", ["nome"])
    op.create_index("ix_setores_sigla", "setores", ["sigla"])

    op.create_table(
        "atendimentos",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("cidadao_id", sa.Integer(), sa.ForeignKey("cidadaos.id"), nullable=False),
        sa.Column("numero_senha", sa.String(length=20), nullable=True),
        sa.Column("servidor_nome", sa.String(length=150), nullable=True),
        sa.Column("servidor_masp", sa.String(length=30), nullable=True),
        sa.Column("numero_sala", sa.String(length=50), nullable=True),
        sa.Column("assunto", sa.String(length=150), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("prioridade", sa.String(length=20), nullable=False, server_default="NORMAL"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="AGUARDANDO"),
        sa.Column("data_solicitacao", sa.DateTime(), nullable=False),
        sa.Column("data_convocacao", sa.DateTime(), nullable=True),
        sa.Column("data_inicio", sa.DateTime(), nullable=True),
        sa.Column("data_finalizacao", sa.DateTime(), nullable=True),
        sa.Column("observacoes", sa.Text(), nullable=True),
        sa.Column("resultado", sa.Text(), nullable=True),
        sa.Column("setor_id", sa.Integer(), sa.ForeignKey("setores.id"), nullable=False),
    )
    op.create_index("ix_atendimentos_cidadao_id", "atendimentos", ["cidadao_id"])
    op.create_index("ix_atendimentos_numero_senha", "atendimentos", ["numero_senha"])
    op.create_index("ix_atendimentos_status", "atendimentos", ["status"])
    op.create_index("ix_atendimentos_setor_id", "atendimentos", ["setor_id"])

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
        sa.Column("status", sa.String(length=20), nullable=False, server_default="AGENDADO"),
    )
    op.create_index("ix_agendamentos_cidadao_id", "agendamentos", ["cidadao_id"])
    op.create_index("ix_agendamentos_setor_id", "agendamentos", ["setor_id"])
    op.create_index("ix_agendamentos_data_hora", "agendamentos", ["data_hora"])
    op.create_index("ix_agendamentos_status", "agendamentos", ["status"])

    op.create_table(
        "logs_auditoria",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("atendimento_id", sa.Integer(), sa.ForeignKey("atendimentos.id"), nullable=False),
        sa.Column("acao", sa.String(length=30), nullable=False),
        sa.Column("setor_id", sa.Integer(), nullable=False),
        sa.Column("servidor_nome", sa.String(length=150), nullable=False),
        sa.Column("servidor_masp", sa.String(length=30), nullable=False),
    )
    op.create_index("ix_logs_auditoria_atendimento_id", "logs_auditoria", ["atendimento_id"])
    op.create_index("ix_logs_auditoria_acao", "logs_auditoria", ["acao"])
    op.create_index("ix_logs_auditoria_setor_id", "logs_auditoria", ["setor_id"])


def downgrade() -> None:
    op.drop_table("logs_auditoria")
    op.drop_table("agendamentos")
    op.drop_table("atendimentos")
    op.drop_index("ix_setores_sigla", table_name="setores")
    op.drop_index("ix_setores_nome", table_name="setores")
    op.drop_table("setores")
    op.drop_table("cidadaos")
