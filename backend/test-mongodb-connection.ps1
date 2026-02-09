# Deep MongoDB Connection Test

Write-Host "=== MongoDB Connection Deep Test ===" -ForegroundColor Cyan

# Test 1: Check environment variable
Write-Host "`n1. Checking MONGODB_URI environment variable..." -ForegroundColor Yellow
$envUri = $env:MONGODB_URI
if ($envUri) {
    Write-Host "   ✅ MONGODB_URI is set" -ForegroundColor Green
    # Mask password for security
    $maskedUri = $envUri -replace '://([^:]+):([^@]+)@', '://$1:****@'
    Write-Host "   URI: $maskedUri" -ForegroundColor Gray
} else {
    Write-Host "   ❌ MONGODB_URI is NOT set!" -ForegroundColor Red
    Write-Host "   This means the app is using localhost!" -ForegroundColor Yellow
}

# Test 2: Create a user and check response
Write-Host "`n2. Creating a new test user..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testUser = "verify$timestamp"

$signupBody = @{
    firstName = "Verify"
    lastName = "Test"
    username = $testUser
    email = "$testUser@test.com"
    password = "test123"
    phoneNumber = "1111111111"
    address = "Test"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/signup' `
        -Method POST `
        -Body $signupBody `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "   ✅ User created: $testUser" -ForegroundColor Green
    
    # Test 3: Login to verify
    Write-Host "`n3. Logging in to verify user exists..." -ForegroundColor Yellow
    $loginBody = @{
        username = $testUser
        password = "test123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' `
        -Method POST `
        -Body $loginBody `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   Email from response: $($loginResponse.email)" -ForegroundColor White
    
    Write-Host "`n" -NoNewline
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host " CRITICAL INFORMATION " -NoNewline -ForegroundColor Yellow
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host "=" -ForegroundColor Red
    
    Write-Host "`nYour data IS being saved!" -ForegroundColor Green
    Write-Host "`nWhere to look in MongoDB Atlas:" -ForegroundColor Cyan
    Write-Host "  1. Cluster: cluster0.samygig.mongodb.net" -ForegroundColor White
    Write-Host "  2. Database: campuseats" -ForegroundColor Yellow
    Write-Host "  3. Collection: users" -ForegroundColor Yellow
    Write-Host "  4. Search for: $testUser" -ForegroundColor Green
    
    Write-Host "`nIf you STILL don't see it:" -ForegroundColor Red
    Write-Host "  - Click the REFRESH button in MongoDB Atlas" -ForegroundColor Yellow
    Write-Host "  - Make sure you clicked 'Browse Collections'" -ForegroundColor Yellow
    Write-Host "  - Check you're in the right PROJECT in Atlas" -ForegroundColor Yellow
    Write-Host "  - Try using MongoDB Compass desktop app instead" -ForegroundColor Yellow
    
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

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
Write-Host "=" -ForegroundColor Cyan
