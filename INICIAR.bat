@echo off
setlocal
cd /d "%~dp0"

echo.
echo ==========================================
echo    PAINEL DE ATENDIMENTOS
echo ==========================================
echo.

if not exist "backend\venv\Scripts\python.exe" (
    echo [ERRO] Ambiente Python nao configurado.
    echo Execute CONFIGURAR.bat primeiro.
    pause
    exit /b 1
)

if not exist "frontend\dist\index.html" (
    echo [ERRO] Frontend ainda nao foi compilado.
    echo Execute CONFIGURAR.bat primeiro.
    pause
    exit /b 1
)

echo Iniciando o servidor...
cd /d "%~dp0backend"
start "Painel de Atendimentos - servidor" /min cmd /c "venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo Aguardando o sistema ficar pronto...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($i=0;$i -lt 30;$i++){ try { $r=Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 1; if($r.StatusCode -eq 200){$ok=$true;break} } catch {}; Start-Sleep -Milliseconds 300 }; if(-not $ok){exit 1}"

if errorlevel 1 (
    echo.
    echo [ERRO] O servidor nao respondeu.
    echo Verifique a janela do servidor para ver o erro.
    pause
    exit /b 1
)

echo.
echo Sistema pronto!
echo URL local: http://localhost:8000
echo.
start "" "http://localhost:8000"
exit /b 0
