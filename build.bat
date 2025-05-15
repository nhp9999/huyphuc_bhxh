@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

net session >nul 2>&1
if !errorlevel! neq 0 (
    echo Vui lòng chạy với quyền Administrator!
    pause
    exit /b
)

echo === git update ===
cd /d "%~dp0"
git fetch

REM Kiểm tra các thay đổi cục bộ
git diff --quiet
if !errorlevel! neq 0 (
    echo Phát hiện thay đổi cục bộ. Bạn có muốn stash các thay đổi này không?
    choice /c YN /m "Chọn"
    set "choice1=!errorlevel!"
    if "!choice1!"=="2" (
        echo Bỏ qua cập nhật git. Tiếp tục với phiên bản hiện tại.
        goto end
    )
    echo Đang stash các thay đổi cục bộ...
    git stash
    echo Đang pull từ remote...
    git pull origin main
    echo Bạn có muốn áp dụng lại các thay đổi đã stash không?
    choice /c YN /m "Chọn"
    set "choice2=!errorlevel!"
    if "!choice2!"=="1" (
        echo Đang áp dụng lại các thay đổi đã stash...
        git stash pop
        if !errorlevel! neq 0 (
            echo Có xung đột khi áp dụng lại các thay đổi. Vui lòng giải quyết thủ công sau khi script kết thúc.
            echo Các thay đổi của bạn vẫn được lưu trong stash.
            goto end
        )
		goto end
    )
	goto end
)
echo Không có thay đổi cục bộ. Đang pull từ remote...
git pull origin main

:end

echo === Stop IIS ===
iisreset /stop

echo === Dang cai dat va chay du an ===

REM Kiem tra Node.js
where node >nul 2>nul
if !ERRORLEVEL! neq 0 (
    echo Node.js chua duoc cai dat. Vui long cai dat Node.js tu https://nodejs.org/
    pause
    exit /b 1
)

REM Kiem tra .NET SDK
where dotnet >nul 2>nul
if !ERRORLEVEL! neq 0 (
    echo .NET SDK chua duoc cai dat. Vui long cai dat .NET SDK tu https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

echo === install library angular ===
cd WebApp.Client
echo Bạn có muốn xóa thư mục node_modules và cài đặt lại không?
choice /c YN /m "Chọn"
set "choice3=!errorlevel!"
if "!choice3!"=="1" (
    echo Đang xóa thư mục node_modules...
    rd /s /q node_modules
)

echo Đang cài đặt các thư viện...
call npm i
if !errorlevel! neq 0 (
    echo Lỗi khi cài đặt các thư viện npm cơ bản. Đang thử lại...
    call npm i --legacy-peer-deps
    if !errorlevel! neq 0 (
        echo Không thể cài đặt các thư viện npm. Vui lòng kiểm tra lại kết nối mạng hoặc package.json.
        echo Bạn có muốn tiếp tục không?
        choice /c YN /m "Chọn"
		set "choice4=!errorlevel!"
		if "!choice4!"=="2" (
            echo Đang hủy quá trình build...
            iisreset /start
            pause
            exit /b 1
        )
    )
)

echo Đang cài đặt các thư viện bổ sung...
call npm i xlsx pizzip jszip file-saver docxtemplater --save
call npm i @types/file-saver @types/xlsx --save-dev

echo === Dang build du an angular ===
echo Đang build với cấu hình production và tăng bộ nhớ cho Node.js...
node --max-old-space-size=8192 node_modules/@angular/cli/bin/ng build --configuration production

if !errorlevel! neq 0 (
    echo Lỗi khi build dự án Angular.
    echo Bạn có muốn tiếp tục triển khai phiên bản cũ không?
    choice /c YN /m "Chọn"
	set "choice5=!errorlevel!"
	if "!choice5!"=="2" (
        echo Đang hủy quá trình triển khai...
        iisreset /start
        pause
        exit /b 1
    )
    echo Tiếp tục với phiên bản cũ...
	goto abort
)
echo Build Angular thành công!

:abort

echo === Copy to folder IIS ===
echo Đang xóa các tệp cũ trong thư mục IIS...
for /d %%i in ("\\?\C:\inetpub\huyphucweb\*") do rd /s /q "%%i"
if !errorlevel! neq 0 (
    echo Lỗi khi xóa thư mục trong IIS. Kiểm tra quyền truy cập.
    iisreset /start
    pause
    exit /b 1
)

for %%i in ("\\?\C:\inetpub\huyphucweb\*") do if /I not "%%~nxi"=="web.config" del "%%i"
if !errorlevel! neq 0 (
    echo Lỗi khi xóa tệp trong IIS. Kiểm tra quyền truy cập.
    iisreset /start
    pause
    exit /b 1
)

echo Đang sao chép các tệp mới vào thư mục IIS...
xcopy .\dist\webapp.client\*.* C:\inetpub\huyphucweb /E /I /Y
if !errorlevel! neq 0 (
    echo Lỗi khi sao chép vào thư mục IIS. Kiểm tra quyền truy cập.
    iisreset /start
    pause
    exit /b 1
)

echo === Dang build du an .net ===
cd ..
cd WebApp.Server
echo Đang build dự án .NET với cấu hình Release...
dotnet build --configuration Release
if !errorlevel! neq 0 (
    echo Lỗi khi build dự án .NET.
    echo Bạn có muốn tiếp tục triển khai phiên bản cũ không?
    choice /c YN /m "Chọn"
	set "choice6=!errorlevel!"
	if "!choice6!"=="2" (
        echo Đang hủy quá trình triển khai...
        iisreset /start
        pause
        exit /b 1
    )
    echo Tiếp tục với phiên bản cũ...
	goto skip
)
echo Build .NET thành công!

:skip

echo === Copy to folder IIS ===
echo Đang xóa các tệp cũ trong thư mục IIS API...
for /d %%i in ("\\?\C:\inetpub\huyphucapi\*") do rd /s /q "%%i"
if !errorlevel! neq 0 (
    echo Lỗi khi xóa thư mục trong IIS API. Kiểm tra quyền truy cập.
    iisreset /start
    pause
    exit /b 1
)

for %%i in ("\\?\C:\inetpub\huyphucapi\*") do if /I not "%%~nxi"=="web.config" del "%%i"
if !errorlevel! neq 0 (
    echo Lỗi khi xóa tệp trong IIS API. Kiểm tra quyền truy cập.
    iisreset /start
    pause
    exit /b 1
)

echo Đang sao chép các tệp mới vào thư mục IIS API...
xcopy .\bin\Release\net9.0\*.* C:\inetpub\huyphucapi /E /I /Y
if !errorlevel! neq 0 (
    echo Lỗi khi sao chép vào thư mục IIS API. Kiểm tra quyền truy cập.
    iisreset /start
    pause
    exit /b 1
)

echo === Start IIS ===
echo Đang khởi động lại IIS...
iisreset /start
if !errorlevel! neq 0 (
    echo Lỗi khi khởi động lại IIS. Vui lòng khởi động lại thủ công.
    pause
    exit /b 1
)

echo ===================================
echo === Build và deploy thành công ===
echo ===================================
echo.
echo Ứng dụng đã được triển khai thành công!
echo - Frontend: http://localhost
echo - API: http://localhost:5182
echo.
echo Nhấn phím bất kỳ để thoát...
pause
