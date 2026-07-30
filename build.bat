@echo off
title Construindo Painel de Atendimentos

echo.
echo ============================================
echo   Construindo o Painel de Atendimentos
echo ============================================
echo.

cd /d "%~dp0"

echo [1/2] Instalando dependencias do frontend...
call npm --prefix frontend install

if errorlevel 1 (
    echo.
    echo Erro ao instalar as dependencias do frontend.
    pause
    exit /b 1
)

echo.
echo [2/2] Gerando a versao final do frontend...
call npm --prefix frontend run build

if errorlevel 1 (
    echo.
    echo Erro ao construir o frontend.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Sistema construido com sucesso!
echo ============================================
echo.

pause