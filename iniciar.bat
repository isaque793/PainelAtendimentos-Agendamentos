@echo off
title Painel de Atendimentos

cd /d "%~dp0"

echo.
echo ============================================
echo   Iniciando Painel de Atendimentos
echo ============================================
echo.

if not exist "backend\venv\Scripts\python.exe" (
    echo O ambiente virtual do backend nao foi encontrado.
    echo Execute primeiro o arquivo configurar.bat.
    echo.
    pause
    exit /b 1
)

if not exist "frontend\dist\index.html" (
    echo A versao final do frontend nao foi encontrada.
    echo Execute primeiro o arquivo configurar.bat.
    echo.
    pause
    exit /b 1
)

echo Iniciando o servidor...
echo O sistema sera aberto em http://localhost:8000
echo.

start "" http://localhost:8000

cd backend
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000

pause