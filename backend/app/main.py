from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.atendimento_router import router as atendimento_router
from app.database.base import Base
from app.database.connection import engine
from app.routers.cidadao_router import router as cidadao_router
from app.models import Atendimento, Cidadao
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Painel de Atendimentos e Agendamentos"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cidadao_router)
app.include_router(atendimento_router)

@app.get("/")
def inicio():
    return {
        "mensagem": "API do Painel de Atendimentos funcionando"
    }