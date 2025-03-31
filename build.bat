@echo off
chcp 65001 >nul

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Vui lòng chạy với quyền Administrator!
    pause
    exit /b
)

echo === git update ===
cd /d "%~dp0"
git fetch
git pull origin main

echo === Stop IIS ===
iisreset /stop

echo === Dang cai dat va chay du an ===

REM Kiem tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js chua duoc cai dat. Vui long cai dat Node.js tu https://nodejs.org/
    pause
    exit /b 1
)

REM Kiem tra .NET SDK
where dotnet >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo .NET SDK chua duoc cai dat. Vui long cai dat .NET SDK tu https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

echo === install library angular ===
cd WebApp.Client
call npm i
call npm i xlsx --save
call npm i pizzip --save
call npm i jszip --save
call npm i file-saver --save
call npm i docxtemplater --save
call npm i @types/file-saver --save-dev
call npm i @types/xlsx --save-dev

echo === Dang build du an angular ===
call ng build --configuration production

echo === Copy to folder IIS ===
for /d %%i in ("\\?\C:\inetpub\huyphucweb\*") do rd /s /q "%%i"
for %%i in ("\\?\C:\inetpub\huyphucweb\*") do if /I not "%%~nxi"=="web.config" del "%%i"

xcopy .\dist\webapp.client\*.* C:\inetpub\huyphucweb /E /I /Y

echo === Dang build du an .net ===
cd ..
cd WebApp.Server
dotnet build --configuration Release

echo === Copy to folder IIS ===
for /d %%i in ("\\?\C:\inetpub\huyphucapi\*") do rd /s /q "%%i"
for %%i in ("\\?\C:\inetpub\huyphucapi\*") do if /I not "%%~nxi"=="web.config" del "%%i"

xcopy .\bin\Release\net9.0\*.* C:\inetpub\huyphucapi /E /I /Y

echo === Start IIS ===
iisreset /start

echo build va deploy thanh cong

pause
