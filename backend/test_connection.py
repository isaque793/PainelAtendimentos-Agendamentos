from sqlalchemy import create_engine, text
import traceback
DATABASE_URL = "postgresql+psycopg2://postgres:adminsee@localhost:5432/postgres"

try:
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        resultado = conn.execute(text("SELECT version();"))

        print("=" * 50)
        print("✅ Conectado ao PostgreSQL!")
        print(resultado.fetchone())
        print("=" * 50)



except Exception:
    print("===== ERRO COMPLETO =====")
    traceback.print_exc()