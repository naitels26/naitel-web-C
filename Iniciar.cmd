@echo off
setlocal
set "NAITEL_NODE="
for /f "delims=" %%N in ('where node.exe 2^>nul') do if not defined NAITEL_NODE set "NAITEL_NODE=%%N"
if not defined NAITEL_NODE if exist "%ProgramFiles%\nodejs\node.exe" set "NAITEL_NODE=%ProgramFiles%\nodejs\node.exe"
if not defined NAITEL_NODE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NAITEL_NODE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
rem Node bundled with Codex on the computer where Version C was prepared.
if not defined NAITEL_NODE if exist "C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt\dependencies\node\bin\node.exe" set "NAITEL_NODE=C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt\dependencies\node\bin\node.exe"
if not defined NAITEL_NODE (
  echo No se encontro Node.js. Instala Node.js o agrega node.exe al PATH.
  pause
  exit /b 1
)
echo Iniciando NAITEL con "%NAITEL_NODE%"
echo Abre en el navegador la direccion que aparece debajo. Para detener: Ctrl+C.
"%NAITEL_NODE%" "%~dp0server.mjs"
set "NAITEL_EXIT=%ERRORLEVEL%"
if not "%NAITEL_EXIT%"=="0" pause
exit /b %NAITEL_EXIT%
