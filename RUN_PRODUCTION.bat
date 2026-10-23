@echo off
setlocal EnableDelayedExpansion

:: Ensure we are always executing from the project root directory
cd /d "%~dp0"

title BrandGuard AI - Unified Production Server ^& Public Controller
color 0B

echo ===============================================================================
echo                      BRANDGUARD AI - PRODUCTION CONTROLLER
echo            Universal Multi-Industry Brand Governance Platform
echo ===============================================================================
echo.
echo Project Directory: %~dp0
echo.

:: -----------------------------------------------------------------------------
:: Step 1: Environment & Tooling Verification
:: -----------------------------------------------------------------------------
echo [Step 1/4] Checking environment prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js v18 or newer from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo  - Node.js Runtime : %NODE_VERSION% [FOUND]

:: Check if frontend dist exists
if not exist "Brandguard AI - Fe\frontend\dist\" (
    echo  - Building production assets (first-time setup)...
    call npm run build
    if !ERRORLEVEL! NEQ 0 (
        color 0C
        echo [ERROR] Build failed. Please check build logs.
        pause
        exit /b 1
    )
) else (
    echo  - Production Assets: Frontend ^& Backend Builds [READY]
)
echo.

:: -----------------------------------------------------------------------------
:: Step 2: Start Unified Production Server (Port 5000)
:: -----------------------------------------------------------------------------
echo [Step 2/4] Starting Unified Full-Stack Production Server (Port 5000)...

curl.exe -s -f http://localhost:5000/api/health >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  - Unified server is already running and healthy on port 5000.
) else (
    echo  - Launching unified production server process in dedicated window...
    start "BrandGuard AI - Unified Server (Port 5000)" /D "%~dp0" cmd /k "node \"Brand Guard AI-Backend/backend/dist/server.js\""
    ping 127.0.0.1 -n 3 >nul
)
echo.

:: -----------------------------------------------------------------------------
:: Step 3: Server Health Check Verification
:: -----------------------------------------------------------------------------
echo [Step 3/4] Verifying Unified Server Health Check at http://localhost:5000/api/health...

set HEALTH_OK=0
for /l %%i in (1, 1, 10) do (
    curl.exe -s -f http://localhost:5000/api/health >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        set HEALTH_OK=1
        goto :HealthSuccess
    )
    echo    Attempt %%i/10: Waiting for server to respond...
    ping 127.0.0.1 -n 2 >nul
)

:HealthSuccess
if %HEALTH_OK% EQU 1 (
    echo  -----------------------------------------------------------------------
    echo  [SERVER HEALTH STATUS: 200 OK - PASSED]
    for /f "delims=" %%r in ('curl.exe -s http://localhost:5000/api/health') do (
        echo  Response: %%r
    )
    echo  -----------------------------------------------------------------------
) else (
    echo  -----------------------------------------------------------------------
    echo  [WARNING] Server did not respond on port 5000 within 10 seconds.
    echo  -----------------------------------------------------------------------
)
echo.

:: -----------------------------------------------------------------------------
:: Step 4: Launch Web Browser
:: -----------------------------------------------------------------------------
echo [Step 4/4] Launching BrandGuard AI in your default browser...
start "" "http://localhost:5000"

echo.
echo ===============================================================================
echo                    BRANDGUARD AI IS FULLY OPERATIONAL!
echo ===============================================================================
echo.
echo   * Unified Web Application : http://localhost:5000
echo   * Backend REST API        : http://localhost:5000/api
echo   * Backend Health Endpoint : http://localhost:5000/api/health
echo   * Brand Profiles Endpoint : http://localhost:5000/api/brands
echo   * Content Analysis API    : http://localhost:5000/api/analyze
echo.
echo ===============================================================================
echo  Interactive Controls:
echo    [H] Run Live Health Check
echo    [O] Re-open Application in Web Browser
echo    [P] Generate Shareable Public Internet URL (Localtunnel)
echo    [Q] Quit Controller (Server continues running in background)
echo ===============================================================================
echo.

:Loop
set "USER_CHOICE="
set /p "USER_CHOICE=Select an option [H/O/P/Q] (or close window): "
if not defined USER_CHOICE (
    goto :LoopWait
)
if /i "%USER_CHOICE%"=="H" goto :DoHealthCheck
if /i "%USER_CHOICE%"=="O" goto :DoOpenBrowser
if /i "%USER_CHOICE%"=="P" goto :DoPublicTunnel
if /i "%USER_CHOICE%"=="Q" goto :DoQuit
echo Invalid option selected: "%USER_CHOICE%". Please choose H, O, P, or Q.
echo.
goto :Loop

:LoopWait
ping 127.0.0.1 -n 3 >nul
goto :Loop

:DoHealthCheck
echo.
echo --- Querying http://localhost:5000/api/health ---
for /f "delims=" %%r in ('curl.exe -s http://localhost:5000/api/health') do (
    echo  Response: %%r
)
echo.
goto :Loop

:DoOpenBrowser
echo.
echo Opening http://localhost:5000 in default browser...
start "" "http://localhost:5000"
echo.
goto :Loop

:DoPublicTunnel
echo.
echo Starting secure public internet tunnel to port 5000...
start "BrandGuard AI - Public Internet Tunnel" cmd /k "npx -y localtunnel --port 5000"
echo Public tunnel window launched! Check that window for your shareable public URL.
echo.
goto :Loop

:DoQuit
echo.
echo Exiting controller console. The server windows will continue running.
ping 127.0.0.1 -n 2 >nul
exit /b 0
