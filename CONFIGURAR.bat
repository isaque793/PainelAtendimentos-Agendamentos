@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==========================================
echo    CONFIGURACAO DO PAINEL DE ATENDIMENTOS
echo ==========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado.
    echo Instale Python 3.12 ou superior e tente novamente.
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado.
    echo Instale Node.js 18 ou superior e tente novamente.
    pause
    exit /b 1
)

echo [1/4] Criando ambiente Python...
if not exist "backend\venv\Scripts\python.exe" (
    python -m venv backend\venv
    if errorlevel 1 goto :erro
)

echo [2/4] Instalando dependencias do backend...
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if errorlevel 1 goto :erro

if not exist "backend\.env" (
    echo [INFO] Criando configuracao local SQLite...
    (
        echo DATABASE_URL=sqlite:///./painel.db
        echo JWT_SECRET_KEY=chave-local-do-painel-troque-em-producao
    ) > "backend\.env"
)

echo [3/4] Instalando dependencias do frontend...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 goto :erro

echo [4/4] Compilando o frontend...
call npm run build
if errorlevel 1 goto :erro

cd /d "%~dp0"
echo.
echo ==========================================
echo CONFIGURACAO CONCLUIDA!
echo ==========================================
echo.
echo Agora execute INICIAR.bat.
echo.
pause
exit /b 0

:erro
echo.
echo [ERRO] A configuracao nao foi concluida.
echo Veja a mensagem acima para identificar o problema.
pause
exit /b 1
