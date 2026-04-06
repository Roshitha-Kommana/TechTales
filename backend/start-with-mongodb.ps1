# Tech Tales Backend Server Startup Script with MongoDB
Write-Host "🚀 Starting Tech Tales Backend with MongoDB..." -ForegroundColor Cyan
Write-Host ""

# Function to start MongoDB
function Start-MongoDB {
    Write-Host "Checking MongoDB..." -ForegroundColor Yellow
    
    # Try to start MongoDB service
    try {
        $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyStop
        if ($mongoService) {
            if ($mongoService.Status -ne 'Running') {
                Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
                Start-Service -Name "MongoDB" -ErrorAction Stop
                Start-Sleep -Seconds 3
                Write-Host "✅ MongoDB service started" -ForegroundColor Green
            } else {
                Write-Host "✅ MongoDB service is already running" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  MongoDB service not found. Trying to start MongoDB manually..." -ForegroundColor Yellow
            # Try common MongoDB installation paths
            $mongoPaths = @(
                "C:\Program Files\MongoDB\Server\*\bin\mongod.exe",
                "C:\mongodb\bin\mongod.exe",
                "$env:ProgramFiles\MongoDB\Server\*\bin\mongod.exe"
            )
            
            $mongoFound = $false
            foreach ($path in $mongoPaths) {
                $mongoExe = Get-ChildItem -Path $path -ErrorAction SilentlyStop | Select-Object -First 1
                if ($mongoExe) {
                    Write-Host "Found MongoDB at: $($mongoExe.FullName)" -ForegroundColor Green
                    $mongoFound = $true
                    break
                }
            }
            
            if (-not $mongoFound) {
                Write-Host "⚠️  Could not find MongoDB installation." -ForegroundColor Yellow
                Write-Host "   Please start MongoDB manually or install it." -ForegroundColor Yellow
                Write-Host "   The server will start but database operations will fail." -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "⚠️  Could not start MongoDB service: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   The server will start but database operations will fail." -ForegroundColor Yellow
    }
    
    # Test MongoDB connection
    try {
        $testConnection = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyStop
        if ($testConnection) {
            Write-Host "✅ MongoDB is accessible on port 27017" -ForegroundColor Green
        } else {
            Write-Host "⚠️  MongoDB is not accessible on port 27017" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not test MongoDB connection" -ForegroundColor Yellow
    }
}

# Start MongoDB
Start-MongoDB

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating default .env..." -ForegroundColor Yellow
    @"
DATABASE_URL=mongodb://localhost:27017/techtales
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GEMINI_API_KEY_1=AIzaSyBL8Z_qif_1Scu71G1v3urGry9PgxoXR3c
GEMINI_API_KEY_2=AIzaSyB30HfF-nBO3go6SWXHx-uT88J2p-2ugnk
GEMINI_API_KEY_3=AIzaSyANxQZIGVpFBKRMzkDTEYAQ96dZ6xgJFfY
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "🚀 Starting server on http://localhost:5000..." -ForegroundColor Green
Write-Host ""
npm run dev
