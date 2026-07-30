@echo off
title Configurando Painel de Atendimentos

cd /d "%~dp0"

echo.
echo ============================================
echo   Configuracao inicial do sistema
echo ============================================
echo.

if not exist "backend\venv" (
    echo Criando ambiente virtual do Python...
    python -m venv backend\venv

    if errorlevel 1 (
        echo Nao foi possivel criar o ambiente virtual.
        echo Verifique se o Python esta instalado.
        pause
        exit /b 1
    )
)

echo.
echo Instalando dependencias do backend...
backend\venv\Scripts\python.exe -m pip install --upgrade pip
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt

if errorlevel 1 (
    echo Erro ao instalar as dependencias do backend.
    pause
    exit /b 1
)

echo.
echo Instalando dependencias do frontend...
call npm --prefix frontend install

if errorlevel 1 (
    echo Erro ao instalar as dependencias do frontend.
    pause
    exit /b 1
)

echo.
echo Gerando a versao final do frontend...
call npm --prefix frontend run build

if errorlevel 1 (
    echo Erro ao construir o frontend.
    pause
    exit /b 1
)

if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env"
    )
)

if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env"
    )
)

echo.
echo ============================================
echo   Configuracao concluida!
echo ============================================
echo.
echo Agora execute o arquivo iniciar.bat.
echo.

pause