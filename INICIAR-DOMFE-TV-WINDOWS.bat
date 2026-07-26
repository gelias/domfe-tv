@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 iniciar_domfe_tv.py
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python iniciar_domfe_tv.py
  goto :end
)
echo.
echo Python 3 nao foi encontrado neste computador.
echo Instale o Python 3 para iniciar a Domfe TV.
echo.
pause
:end
endlocal
