# StoryWizard Backend Server Startup Script
Write-Host "🚀 Starting Tech Tales Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating default .env..." -ForegroundColor Yellow
    @"
DATABASE_URL=mongodb://localhost:27017/storywizard
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
