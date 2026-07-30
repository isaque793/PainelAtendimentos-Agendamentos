@echo off
title Painel de Atendimentos

cd /d "%~dp0"

echo.
echo ============================================
echo   Iniciando Painel de Atendimentos
echo ============================================
echo.

if not exist ".venv\Scripts\python.exe" (
    echo O ambiente virtual do backend nao foi encontrado.
    echo Execute primeiro a configuracao inicial do projeto.
    echo.
    pause
    exit /b 1
)

if not exist "frontend\dist\index.html" (
    echo A versao final do frontend nao foi encontrada.
    echo Executando a construcao do frontend...
    echo.

    call npm --prefix frontend install

    if errorlevel 1 (
        echo Nao foi possivel instalar as dependencias.
        pause
        exit /b 1
    )

    call npm --prefix frontend run build

    if errorlevel 1 (
        echo Nao foi possivel construir o frontend.
        pause
        exit /b 1
    )
)

echo Iniciando o servidor...
echo O sistema sera aberto em http://localhost:8000
echo.

start "" http://localhost:8000

cd backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000

pause