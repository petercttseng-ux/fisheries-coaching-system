@echo off
echo ============================================
echo  水試所產銷班輔導應用系統 - 建置腳本
echo ============================================
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo [錯誤] 未偵測到 Node.js
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 安裝相依套件中...
    npm install
)

echo 建置中...
npm run build

if errorlevel 0 (
    echo.
    echo [成功] 建置完成！輸出目錄: dist\
    echo 可將 dist\ 目錄上傳至 GitHub Pages 或其他靜態網站託管服務
)
pause
