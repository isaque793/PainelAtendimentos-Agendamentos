from fastapi import FastAPI

from app.database.base import Base
from app.database.connection import engine
from app.database import models

from app.routers.cidadao_router import router as cidadao_router

app = FastAPI(
    title="Painel de Atendimentos",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

app.include_router(cidadao_router)


@app.get("/")
def home():
    return {
        "status": "online",
        "mensagem": "API do Painel de Atendimentos"
    }