from fastapi import FastAPI

app = FastAPI(
    title="Painel de Atendimentos",
    description="API para gerenciamento de atendimentos e agendamentos.",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "status": "online",
        "mensagem": "Bem-vindo à API do Painel de Atendimentos!"
    }