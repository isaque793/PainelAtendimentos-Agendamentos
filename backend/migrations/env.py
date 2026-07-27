from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Reaproveita a mesma configuração de banco e os mesmos modelos do
# resto da aplicação — assim a migração nunca fica dessincronizada do
# que está de fato definido em app/models/.
from app.database.base import Base
from app.database.connection import DATABASE_URL
from app import models  # noqa: F401  (garante que os modelos sejam importados)

config = context.config
config.set_main_option("sqlalchemy.url", DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
