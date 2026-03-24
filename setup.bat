@echo off
echo ============================================
echo  水試所產銷班輔導應用系統 - 安裝與啟動腳本
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [錯誤] 未偵測到 Node.js，請先安裝 Node.js v18 或更新版本
    echo 下載網址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Node.js 版本:
node --version

echo.
echo [2/3] 安裝相依套件中...
npm install

echo.
echo [3/3] 啟動開發伺服器...
echo 應用程式將在 http://localhost:5173/fisheries-coaching-system/ 開啟
npm run dev
