import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Limitador simples baseado em memória (sem dependências externas nem
    banco), pensado para as rotas públicas e sem login do totem de
    solicitação (POST /cidadaos/ e POST /atendimentos/) — impede que um
    script fique criando centenas de registros por segundo.

    Não substitui um rate limiter de produção (ex.: no proxy/CDN), mas
    já cobre o caso de abuso mais óbvio sem exigir infraestrutura extra.
    Como o estado fica em memória, ele reseta se o processo reiniciar —
    aceitável para o volume de um totem de atendimento presencial.
    """

    def __init__(
        self,
        app,
        rotas_limitadas: dict[tuple[str, str], tuple[int, int]] | None = None,
    ):
        super().__init__(app)
        # Cada chave é (método, caminho) e o valor é (máximo de
        # requisições, janela em segundos).
        self.rotas_limitadas = rotas_limitadas or {
            ("POST", "/cidadaos/"): (10, 60),
            ("POST", "/atendimentos/"): (10, 60),
        }
        self.historico: dict[str, deque] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        chave_rota = (request.method, request.url.path)
        limite = self.rotas_limitadas.get(chave_rota)

        if limite is not None:
            maximo, janela_segundos = limite
            ip_cliente = request.client.host if request.client else "desconhecido"
            chave = f"{ip_cliente}:{request.method}:{request.url.path}"

            agora = time.monotonic()
            fila = self.historico[chave]

            while fila and agora - fila[0] > janela_segundos:
                fila.popleft()

            if len(fila) >= maximo:
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": (
                            "Muitas solicitações em pouco tempo. "
                            "Aguarde um instante e tente novamente."
                        )
                    },
                )

            fila.append(agora)

        return await call_next(request)
