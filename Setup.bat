@echo off
:: Ask user where the folder is or assume it's on Desktop
cd /d "%USERPROFILE%\Desktop\CFB-Dynasty-Manager-v2026"

echo Installing dependencies...
npm install

pause
