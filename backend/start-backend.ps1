# Start Backend with MongoDB Atlas

Write-Host "Starting CampusEats Backend with MongoDB Atlas..." -ForegroundColor Cyan

# Load environment variables from .env file
Write-Host "`nLoading environment variables from .env..." -ForegroundColor Yellow
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.+)$' -and $_ -notmatch '^#') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
        Write-Host "  ✅ Set $key" -ForegroundColor Green
    }
}

# Verify MongoDB URI is set
$mongoUri = $env:MONGODB_URI
if ($mongoUri -match 'mongodb\+srv://') {
    Write-Host "`n✅ MongoDB Atlas URI is set correctly!" -ForegroundColor Green
    $maskedUri = $mongoUri -replace '://([^:]+):([^@]+)@', '://$1:****@'
    Write-Host "   $maskedUri" -ForegroundColor Gray
} else {
    Write-Host "`n❌ WARNING: MongoDB URI is not set to Atlas!" -ForegroundColor Red
    Write-Host "   Current: $mongoUri" -ForegroundColor Yellow
}

Write-Host "`nStarting Spring Boot application..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start Maven
mvn spring-boot:run
