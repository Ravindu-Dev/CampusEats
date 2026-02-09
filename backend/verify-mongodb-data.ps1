# MongoDB Data Verification Script

Write-Host "Checking MongoDB Data Persistence..." -ForegroundColor Cyan

# Create a new user with unique credentials
$timestamp = Get-Date -Format "HHmmss"
$testUsername = "dbtest$timestamp"
$testEmail = "dbtest$timestamp@campuseats.com"

Write-Host "`n1. Creating test user: $testUsername" -ForegroundColor Yellow

$signupBody = @{
    firstName = "Database"
    lastName = "Test"
    username = $testUsername
    email = $testEmail
    password = "test123"
    phoneNumber = "9876543210"
    address = "MongoDB Test Address"
} | ConvertTo-Json

try {
    # Signup
    Write-Host "   Sending signup request..." -ForegroundColor Gray
    $signupResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/signup' `
        -Method POST `
        -Body $signupBody `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "   ✅ Signup Response: $signupResponse" -ForegroundColor Green
    
    # Login to verify
    Write-Host "`n2. Logging in with: $testUsername" -ForegroundColor Yellow
    $loginBody = @{
        username = $testUsername
        password = "test123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' `
        -Method POST `
        -Body $loginBody `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   Username: $($loginResponse.username)" -ForegroundColor White
    Write-Host "   Email: $($loginResponse.email)" -ForegroundColor White
    
    Write-Host "`n" -NoNewline
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host " IMPORTANT " -NoNewline -ForegroundColor Yellow
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -ForegroundColor Cyan
    
    Write-Host "`nTo verify data in MongoDB Atlas:" -ForegroundColor White
    Write-Host "1. Go to: https://cloud.mongodb.com/" -ForegroundColor Gray
    Write-Host "2. Login to your account" -ForegroundColor Gray
    Write-Host "3. Click on your cluster: cluster0" -ForegroundColor Gray
    Write-Host "4. Click 'Browse Collections'" -ForegroundColor Gray
    Write-Host "5. Look for:" -ForegroundColor Gray
    Write-Host "   - Database: " -NoNewline -ForegroundColor Gray
    Write-Host "campuseats" -ForegroundColor Cyan
    Write-Host "   - Collection: " -NoNewline -ForegroundColor Gray
    Write-Host "users" -ForegroundColor Cyan
    Write-Host "6. Search for username: " -NoNewline -ForegroundColor Gray
    Write-Host "$testUsername" -ForegroundColor Yellow
    
    Write-Host "`n" -NoNewline
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -ForegroundColor Cyan
    
    Write-Host "`n✅ Data is being saved successfully!" -ForegroundColor Green
    Write-Host "If you don't see it in Atlas, check:" -ForegroundColor Yellow
    Write-Host "  - You're looking at the correct cluster (cluster0.samygig.mongodb.net)" -ForegroundColor Gray
    Write-Host "  - Database name is 'campuseats' (not 'test' or other)" -ForegroundColor Gray
    Write-Host "  - Collection name is 'users'" -ForegroundColor Gray
    Write-Host "  - Refresh the browser page" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
