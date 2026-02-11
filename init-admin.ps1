# Admin Initialization and Testing Script

# Initialize the admin account
Write-Host "Initializing admin account..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/api/admin/init" -Method POST -UseBasicParsing -ErrorAction Stop
    Write-Host "Success: $($response.Content)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "Admin already exists (this is OK)" -ForegroundColor Yellow
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Admin Login Credentials ===" -ForegroundColor Cyan
Write-Host "Email: admin@campuseats.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Open your browser and navigate to: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host "2. Login with the credentials above" -ForegroundColor White
Write-Host "3. You should be redirected to the admin dashboard" -ForegroundColor White
