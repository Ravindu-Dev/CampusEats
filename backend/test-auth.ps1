# Test CampusEats Authentication Endpoints

Write-Host "Testing CampusEats Signup and Login..." -ForegroundColor Cyan

# Test 1: Signup
Write-Host "`n1. Testing Signup Endpoint..." -ForegroundColor Yellow
$signupBody = @{
    firstName = "Test"
    lastName = "User"
    username = "testuser" + (Get-Random -Maximum 9999)
    email = "testuser$(Get-Random -Maximum 9999)@campuseats.com"
    password = "test123"
    phoneNumber = "1234567890"
    address = "Test Address"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/signup' `
        -Method POST `
        -Body $signupBody `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "✅ Signup successful!" -ForegroundColor Green
    Write-Host "Response: $signupResponse" -ForegroundColor White
    
    # Extract username for login test
    $testUsername = ($signupBody | ConvertFrom-Json).username
    
    # Test 2: Login
    Write-Host "`n2. Testing Login Endpoint..." -ForegroundColor Yellow
    $loginBody = @{
        username = $testUsername
        password = "test123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' `
        -Method POST `
        -Body $loginBody `
        -ContentType 'application/json' `
        -ErrorAction Stop
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token received: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor White
    Write-Host "Username: $($loginResponse.username)" -ForegroundColor White
    Write-Host "Email: $($loginResponse.email)" -ForegroundColor White
    
    Write-Host "`n✅ All tests passed! Authentication is working correctly." -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
