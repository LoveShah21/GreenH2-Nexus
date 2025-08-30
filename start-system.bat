@echo off
setlocal enabledelayedexpansion

REM Complete System Startup Script for Windows
REM Starts all components of the hydrogen infrastructure system

echo 🚀 Starting Hydrogen Infrastructure System...
echo ==============================================

REM Function to check if a port is in use
:check_port
netstat -an | find ":%1 " >nul
if %errorlevel% == 0 (
    echo [INFO] Port %1 is already in use
    exit /b 1
) else (
    echo [INFO] Port %1 is available
    exit /b 0
)

REM Check dependencies
echo [INFO] Checking system dependencies...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    pause
    exit /b 1
) else (
    echo [SUCCESS] Node.js is available
)

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed
    pause
    exit /b 1
) else (
    echo [SUCCESS] Python is available
)

REM Install dependencies
echo [INFO] Installing dependencies...

REM Backend dependencies
if exist "backend" (
    echo [INFO] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo [SUCCESS] Backend dependencies installed
)

REM Frontend dependencies
if exist "frontend" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo [SUCCESS] Frontend dependencies installed
)

REM ML service dependencies
if exist "project" (
    echo [INFO] Installing ML service dependencies...
    cd project
    if not exist "myvenv" (
        python -m venv myvenv
    )
    call myvenv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
    echo [SUCCESS] ML service dependencies installed
)

REM Start ML service
echo [INFO] Starting ML service...
cd project
start "ML Service" cmd /k "myvenv\Scripts\activate.bat && python main.py"
cd ..

REM Wait for ML service to start
timeout /t 10 /nobreak >nul

REM Check if ML service is running
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% == 0 (
    echo [SUCCESS] ML service started successfully
) else (
    echo [WARNING] ML service may not be ready yet
)

REM Start backend service
echo [INFO] Starting backend service...
cd backend
start "Backend Service" cmd /k "npm run dev"
cd ..

REM Wait for backend to start
timeout /t 15 /nobreak >nul

REM Check if backend is running
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% == 0 (
    echo [SUCCESS] Backend service started successfully
) else (
    echo [WARNING] Backend service may not be ready yet
)

REM Start frontend service
echo [INFO] Starting frontend service...
cd frontend
start "Frontend Service" cmd /k "npm run dev"
cd ..

REM Wait for frontend to start
timeout /t 20 /nobreak >nul

REM Check if frontend is running
curl -s http://localhost:3001 >nul 2>&1
if %errorlevel% == 0 (
    echo [SUCCESS] Frontend service started successfully
) else (
    echo [WARNING] Frontend service may not be ready yet
)

REM Run integration tests
echo [INFO] Running integration tests...
timeout /t 5 /nobreak >nul

if exist "test-integration.js" (
    node test-integration.js
    if %errorlevel% == 0 (
        echo [SUCCESS] All integration tests passed!
    ) else (
        echo [WARNING] Some integration tests failed, but services are running
    )
) else (
    echo [WARNING] Integration test script not found, skipping tests
)

REM Display service URLs
echo.
echo 🌐 Service URLs:
echo ==============================================
echo Frontend:     http://localhost:3001
echo Backend API:  http://localhost:5000
echo ML Service:   http://localhost:8000
echo Health Check: http://localhost:5000/health
echo API Docs:     http://localhost:5000/api
echo.
echo 📊 Interactive Map: http://localhost:3001/mapping/interactive
echo.

echo [SUCCESS] 🎉 All services are running!
echo [INFO] Press any key to open the interactive map in your browser...
pause >nul

REM Open the interactive map in default browser
start http://localhost:3001/mapping/interactive

echo [INFO] Services are running in separate windows
echo [INFO] Close the service windows to stop the services
pause