@echo off
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

echo === Dang cai dat cac goi npm ===
cd WebApp.Client
call npm install
call npm install xlsx --save
call npm install pizzip --save
call npm install file-saver --save
call npm install docxtemplater --save
call npm install @types/file-saver --save-dev
call npm install @types/xlsx --save-dev

echo === Dang khoi phuc cac goi NuGet ===
cd ..
dotnet restore WebApp.sln

echo === Dang build du an ===
dotnet build WebApp.sln

echo === Khoi dong API ===
start cmd /k "cd WebApp.Server && dotnet run"

echo === Cho API khoi dong (10 giay) ===
timeout /t 10 /nobreak

echo === Khoi dong ung dung Angular ===
cd WebApp.Client
start cmd /k "npm start"

echo === Da hoan tat! ===
echo Ung dung API dang chay tren http://localhost:5000
echo Ung dung Angular dang chay tren http://localhost:4200
pause 