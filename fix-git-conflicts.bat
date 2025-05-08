@echo off
chcp 65001 >nul

echo ===================================
echo === Công cụ sửa xung đột Git ===
echo ===================================
echo.
echo Script này sẽ giúp bạn giải quyết xung đột git hiện tại.
echo.

REM Kiểm tra các thay đổi cục bộ
git diff --name-only
echo.
echo Các tệp trên có thay đổi cục bộ. Bạn có các lựa chọn sau:
echo.
echo 1. Stash các thay đổi cục bộ, pull từ remote, sau đó áp dụng lại stash
echo 2. Giữ các thay đổi cục bộ và bỏ qua các thay đổi từ remote
echo 3. Bỏ các thay đổi cục bộ và sử dụng phiên bản từ remote
echo 4. Thoát mà không thực hiện thay đổi
echo.
choice /c 1234 /m "Chọn một tùy chọn (1-4)"

if errorlevel 4 (
    echo Thoát mà không thực hiện thay đổi.
    exit /b 0
)

if errorlevel 3 (
    echo Đang bỏ các thay đổi cục bộ và sử dụng phiên bản từ remote...
    git checkout -- WebApp.Client/package.json WebApp.Client/package-lock.json
    git pull origin main
    echo Hoàn tất! Đã sử dụng phiên bản từ remote.
    exit /b 0
)

if errorlevel 2 (
    echo Đang giữ các thay đổi cục bộ và bỏ qua các thay đổi từ remote...
    git checkout --ours WebApp.Client/package.json WebApp.Client/package-lock.json
    git add WebApp.Client/package.json WebApp.Client/package-lock.json
    git commit -m "Giữ các thay đổi cục bộ cho package.json và package-lock.json"
    echo Hoàn tất! Đã giữ các thay đổi cục bộ.
    exit /b 0
)

if errorlevel 1 (
    echo Đang stash các thay đổi cục bộ...
    git stash
    echo Đang pull từ remote...
    git pull origin main
    echo Đang áp dụng lại các thay đổi đã stash...
    git stash pop
    
    if %errorlevel% neq 0 (
        echo Có xung đột khi áp dụng lại các thay đổi.
        echo.
        echo Bạn có muốn:
        echo 1. Giữ các thay đổi cục bộ
        echo 2. Giữ các thay đổi từ remote
        echo 3. Mở công cụ merge để giải quyết xung đột thủ công
        echo.
        choice /c 123 /m "Chọn một tùy chọn (1-3)"
        
        if errorlevel 3 (
            echo Vui lòng giải quyết xung đột thủ công trong trình soạn thảo của bạn.
            echo Sau khi giải quyết, chạy các lệnh sau:
            echo git add WebApp.Client/package.json WebApp.Client/package-lock.json
            echo git commit -m "Giải quyết xung đột merge"
            exit /b 0
        )
        
        if errorlevel 2 (
            echo Đang giữ các thay đổi từ remote...
            git checkout --theirs WebApp.Client/package.json WebApp.Client/package-lock.json
            git add WebApp.Client/package.json WebApp.Client/package-lock.json
            git commit -m "Giữ các thay đổi từ remote cho package.json và package-lock.json"
            echo Hoàn tất! Đã giữ các thay đổi từ remote.
            exit /b 0
        )
        
        if errorlevel 1 (
            echo Đang giữ các thay đổi cục bộ...
            git checkout --ours WebApp.Client/package.json WebApp.Client/package-lock.json
            git add WebApp.Client/package.json WebApp.Client/package-lock.json
            git commit -m "Giữ các thay đổi cục bộ cho package.json và package-lock.json"
            echo Hoàn tất! Đã giữ các thay đổi cục bộ.
            exit /b 0
        )
    ) else (
        echo Hoàn tất! Đã áp dụng lại các thay đổi cục bộ thành công.
        exit /b 0
    )
)

pause
