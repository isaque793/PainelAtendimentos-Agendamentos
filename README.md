# Painel de Atendimentos

Sistema de gestão de fila de atendimento presencial, com solicitação
pública, painel de chamada para TV, histórico por cidadão, relatório
em Excel (mensal ou semanal) e operação por setor (departamento), usado
pela SRE/SEE-MG. Conta com dois perfis de acesso: **Operador** (vê e
opera só o próprio setor) e **Direção** (vê todos os setores e emite
relatórios consolidados).

## Arquitetura

- **Backend**: Python 3.12+ / FastAPI / SQLAlchemy 2.x / JWT
- **Frontend**: React 19 / Vite / MUI (Material UI)
- **Banco de dados**: PostgreSQL (produção) ou SQLite (padrão local, zero configuração)
- **Migrações**: Alembic

## Pré-requisitos

- Python 3.12 ou superior
- Node.js 18 ou superior
- (Opcional) PostgreSQL 14+ — se não configurado, o backend usa SQLite automaticamente

## Rodando pelo VS Code, sem digitar comando nenhum (recomendado)

O projeto já vem com tarefas prontas do VS Code (pasta `.vscode/`).
Depois de abrir a pasta do projeto no VS Code:

1. **Primeira vez only**: `Ctrl+Shift+P` → digite `Tasks: Run Task` → escolha
   **"🚀 Configurar tudo (primeira vez)"**. Isso cria o ambiente virtual do
   backend, instala as dependências de Python e do Node, e cria os
   arquivos `.env` a partir dos `.env.example` (se ainda não existirem).
2. **Toda vez que for trabalhar**: `Ctrl+Shift+P` → `Tasks: Run Task` →
   **"▶️ Rodar tudo (backend + frontend)"**. Isso sobe o backend
   (`http://localhost:8000`) e o frontend (`http://localhost:5173`) ao
   mesmo tempo, cada um no seu próprio painel de terminal.
3. Pra depurar o backend com breakpoints, aperte `F5` (ou vá em
   **Run and Debug** na barra lateral) — já vem configurado pra rodar o
   FastAPI com o depurador ligado.

As configurações em `.vscode/settings.json` também já excluem `venv`,
`node_modules` e `__pycache__` da indexação/monitoramento do VS Code —
é a causa mais comum do editor ficar lento nesse tipo de projeto.

Se preferir rodar manualmente pelo terminal, os passos são os de baixo.

## Rodando o backend (manualmente, pelo terminal)

```bash
cd backend

# 1. Crie e ative um ambiente virtual
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Configure as variáveis de ambiente
cp .env.example .env
# - DATABASE_URL: se deixar vazio, usa SQLite automaticamente.
# - JWT_SECRET_KEY: TROQUE pelo valor gerado com:
#     python3 -c "import secrets; print(secrets.token_hex(32))"

# 4. Suba o servidor
uvicorn app.main:app --reload --port 8000
```

A API sobe em `http://localhost:8000`. Documentação interativa (Swagger)
em `http://localhost:8000/docs`.

Na primeira vez que o backend sobe (com o banco vazio), quatro setores de
exemplo são criados automaticamente — **A**, **B**, **C** e **D**, perfil
Operador, todos com senha `1234` — só para facilitar os primeiros testes.
Um quinto setor, **Direção** (perfil DIRECAO, senha `1234`), também é
criado automaticamente — inclusive em bancos que já existiam antes desta
funcionalidade, então não precisa apagar nada para ganhar o acesso da
Direção. Cadastre os setores reais e troque as senhas de exemplo depois
(a gestão de setores, incluindo trocar senha e conceder o perfil Direção,
é feita autenticado como Direção em `PUT /setores/{id}`).

> **Atualizando um banco já existente desta revisão para trás:** se o
> seu `painel.db` já existia antes do perfil Direção ser introduzido, o
> `Base.metadata.create_all()` do SQLite não adiciona a coluna nova
> sozinho. Rode a migração do Alembic (veja abaixo) ou, em
> desenvolvimento, simplesmente apague `backend/painel.db` e suba o
> backend de novo — ele recria tudo do zero, já com o setor Direção.

### Rodando os testes automatizados

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

Os testes usam um banco SQLite temporário isolado (não mexem no seu
`painel.db` de desenvolvimento) e cobrem: validação de CPF, login e
emissão de token, proteção das rotas por autenticação, fluxo completo de
atendimento (criar → convocar → iniciar → finalizar), identificação de
cidadão já cadastrado, exclusão de cadastro com o histórico junto, a
geração do relatório em Excel (mensal e semanal, por setor e
consolidado), e o isolamento entre setores — inclusive o acesso
agregado exclusivo do perfil Direção.

### Migrações de banco (Alembic)

O projeto já vem com uma migração inicial (`migrations/versions/0001_schema_inicial.py`)
que reflete o schema atual. A partir de agora, qualquer mudança nos
modelos deve virar uma nova migração, em vez de depender só do
`create_all()`:

```bash
cd backend
alembic upgrade head                                   # aplica migrações pendentes
alembic revision --autogenerate -m "descrição da mudança"  # gera uma nova, após mudar um modelo
```

## Rodando o frontend (manualmente, pelo terminal)

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL já vem apontando para http://localhost:8000 por padrão.
npm run dev
```

O frontend sobe em `http://localhost:5173`.

## Rotas principais do frontend

| Rota                        | Descrição                                                          |
|------------------------------|---------------------------------------------------------------------|
| `/`                          | Tela pública de solicitação de atendimento (totem/tablet)            |
| `/chamada`                   | Painel de chamada para TV da sala de espera (com voz)                |
| `/direcao/acesso`            | Login do servidor (nome, MASP, setor e senha do setor)               |
| `/direcao`                   | Dashboard — visão geral; Operador vê o próprio setor, Direção vê todos (requer login) |
| `/direcao/pessoa/:cidadaoId` | Histórico de atendimentos de uma pessoa (requer login)               |
| `/direcao/atendimentos`      | Painel de operação do servidor — fila, atendimento atual, histórico (requer login; não aparece para a Direção) |
| `/direcao/relatorios`        | Geração do relatório em Excel — mensal/semanal, setor único ou (só Direção) consolidado (requer login) |

Todas as rotas em `/direcao/*`, exceto `/direcao/acesso`, exigem sessão
válida — quem tentar acessar sem login é redirecionado para a tela de
acesso e volta automaticamente para onde tentou ir, assim que loga.

## Perfis de acesso

Cada setor tem um **perfil**:

- **Operador** (padrão): enxerga e opera só a fila do próprio setor.
  Histórico de um cidadão, relatórios e auditoria também ficam
  restritos ao que aconteceu no próprio setor.
- **Direção**: perfil especial, sem fila própria. Enxerga os dados de
  **todos os setores** juntos (fila, histórico, auditoria) e pode
  escolher, na tela de Relatórios, entre um setor específico ou todos
  consolidados.

O perfil vem embutido no token JWT emitido no login — o backend nunca
confia num `setor_id` vindo da requisição para decidir o que mostrar; um
operador que tente forçar outro setor pela URL continua vendo só o
próprio (ver `_setor_efetivo()` em `atendimento_router.py`). Só um token
de Direção pode criar ou editar setores (`POST`/`PUT /setores/`),
incluindo conceder o perfil Direção a outro setor.

## Segurança

- O login do servidor (`POST /setores/acesso`) emite um **token JWT**
  (válido por 8h) que precisa ser enviado em `Authorization: Bearer
  <token>` em toda ação sensível — convocar, iniciar, finalizar,
  cancelar, excluir um cadastro, emitir relatórios, consultar filas,
  histórico e auditoria. O frontend já faz isso automaticamente
  (`src/api/api.js`).
- A identidade de quem faz cada ação (nome, MASP, setor, perfil) vem
  **sempre** do token, nunca do corpo da requisição — evita que alguém
  se passe por outro servidor ou por Direção.
- CPF é validado pelo algoritmo oficial dos dígitos verificadores.
- Rotas públicas (`POST /cidadaos/`, `POST /atendimentos/`) têm limite
  de requisições por IP.
- Toda ação sobre um atendimento fica registrada em log de auditoria
  (`GET /atendimentos/auditoria`, autenticado — Operador vê o próprio
  setor, Direção vê todos).
- **Em produção**, troque `JWT_SECRET_KEY` no `.env` — nunca use o valor
  padrão de desenvolvimento — e troque a senha `1234` de todos os
  setores de exemplo, incluindo o setor Direção.

## Estrutura do projeto

```
backend/
  app/
    core/          # segurança, autenticação (JWT), rate limiting
    database/      # conexão e base do SQLAlchemy
    models/        # entidades (Cidadao, Atendimento, Setor, LogAuditoria, PerfilSetor)
    schemas/       # contratos Pydantic de entrada/saída da API
    repositories/  # acesso a dados
    services/      # regras de negócio (inclui a geração do Excel)
    utils/         # formatação de CPF e MASP
    routers/       # endpoints FastAPI
  migrations/      # migrações Alembic
  tests/           # testes automatizados (pytest)
frontend/
  src/
    api/           # cliente HTTP base (anexa o token automaticamente)
    services/      # chamadas à API por domínio
    pages/         # telas (inclui Relatorios/)
    components/    # componentes reutilizáveis (inclui RotaProtegida)
    layouts/       # layout interno (sidebar + header)
    utils/         # máscaras/formatação de documentos e leitura da sessão
    theme.js       # tema único do MUI (cores, tipografia, cantos)
```

## Formatação de documentos

CPF e MASP são **guardados no banco só com os dígitos** e formatados
apenas na exibição (`app/utils/formatacao.py` no backend,
`src/utils/formatacao.js` no frontend). É isso que impede o mesmo CPF de
entrar duas vezes — uma com máscara e outra sem — e o que faz a busca
funcionar tanto com `144.146.336-48` quanto com `14414633648`.

- CPF: `000.000.000-00`
- MASP: `1234567-8` (7 dígitos de matrícula + dígito verificador)

As respostas da API trazem os dois formatos: `cpf`/`masp` (só dígitos,
para comparação) e `cpf_formatado`/`masp_formatado` (prontos para a tela).

## Relatório em Excel (mensal ou semanal)

`GET /atendimentos/relatorio.xlsx` (autenticado) gera uma planilha com
duas abas:

- **Resumo** — total de atendimentos, concluídos, cancelados, em
  aberto, prioritários, tempo médio de espera e de atendimento, mais a
  quebra por assunto, por servidor e por situação. Quando o relatório
  junta vários setores (Direção), ganha também a quebra por setor.
- **Atendimentos** — uma linha por atendimento, com cidadão, documentos,
  assunto, relato, horários de cada etapa, quem atendeu, sala, resultado
  e observações. Ganha a coluna "Setor" quando o relatório é consolidado.

Parâmetros da rota:

| Parâmetro         | Uso                                                                 |
|--------------------|----------------------------------------------------------------------|
| `tipo`             | `mensal` (padrão) ou `semanal`                                       |
| `ano`, `mes`       | Só para `tipo=mensal`. Padrão: mês atual.                             |
| `data_referencia`  | Só para `tipo=semanal`, formato `AAAA-MM-DD` — qualquer dia da semana desejada (o relatório traz de segunda a domingo). Padrão: hoje. |
| `setor_id`         | Só tem efeito para quem está logado como Direção. Omitido → todos os setores juntos. Para qualquer outro perfil, é ignorado: o relatório é sempre do próprio setor. |

Na interface, a tela fica em `/direcao/relatorios`: seletor de tipo
(mensal/semanal) para todo mundo, e seletor de abrangência (setor
específico ou todos) só para quem está logado como Direção.

## O que ainda pode evoluir

Alguns pontos ficam como possível próxima etapa:

- Contas individuais por servidor (hoje a senha é por setor, compartilhada
  entre todos os servidores daquele setor — inclusive entre diretores).
- Tela dedicada para a Direção gerenciar setores (criar, editar, trocar
  senha, conceder o perfil Direção) — hoje isso só existe via API
  (`PUT /setores/{id}`, autenticado como Direção), sem interface própria.
- Impressão física da senha/ficha.
- Notificação por SMS/e-mail quando o cidadão é chamado.
- Testes automatizados no frontend (o backend já tem; o frontend ainda não).
- Deploy containerizado (Docker) para produção.
