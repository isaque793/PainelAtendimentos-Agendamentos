from fastapi import FastAPI

from app import models
from fastapi.middleware.cors import CORSMiddleware
from app.routers import atendimento_router
from app.routers import cidadao_router


from app.database.connection import engine
from app.database.base import Base
from app.routers.setor_router import (
    router as setor_router,
)


Base.metadata.create_all(bind=engine)

app = FastAPI()



app = FastAPI(
    title="Painel de Atendimentos"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cidadao_router.router)
app.include_router(atendimento_router.router)
app.include_router(setor_router)



@app.get("/")
def verificar_api():
    return {
        "mensagem": "API do Painel de Atendimentos funcionando"
    }