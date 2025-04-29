# Environment Variable Debug Script for Vite
# This script is used to verify that environment variables are being loaded properly

Write-Host "Checking environment variables for Vite application..." -ForegroundColor Green
Write-Host "---------------------------------------------------------" -ForegroundColor Green

# Check if .env file exists
$envPath = ".\.env"
if (Test-Path $envPath) {
    Write-Host "✅ .env file found" -ForegroundColor Green
    $envContent = Get-Content $envPath -Raw
    
    # Check for AssemblyAI API key in .env
    if ($envContent -match "VITE_ASSEMBLY_API_KEY=(.+)") {
        $maskedKey = $matches[1].Substring(0, 4) + "..." + $matches[1].Substring($matches[1].Length - 4)
        Write-Host "✅ VITE_ASSEMBLY_API_KEY found in .env file (value: $maskedKey)" -ForegroundColor Green
    } else {
        Write-Host "❌ VITE_ASSEMBLY_API_KEY not found in .env file" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

# Check Vite's handling of environment variables
Write-Host "`nEnvironment variable handling in Vite:" -ForegroundColor Yellow
Write-Host "- Variables must be prefixed with VITE_ to be exposed to client-side code" -ForegroundColor Yellow
Write-Host "- Access environment variables in code as: import.meta.env.VITE_VARIABLE_NAME" -ForegroundColor Yellow

# Recommendations
Write-Host "`nRecommendations:" -ForegroundColor Cyan
Write-Host "1. Ensure .env file is in the root directory of your project" -ForegroundColor Cyan
Write-Host "2. Use VITE_ prefix for all environment variables in Vite projects" -ForegroundColor Cyan
Write-Host "3. Restart the dev server after changing .env files" -ForegroundColor Cyan
Write-Host "4. For production, set environment variables on your hosting platform" -ForegroundColor Cyan

Write-Host "`nDebug steps:" -ForegroundColor Magenta
Write-Host "1. Try printing environment variables in your code:" -ForegroundColor Magenta
Write-Host "   console.log('ENV_API_KEY:', import.meta.env.VITE_ASSEMBLY_API_KEY)" -ForegroundColor Magenta
Write-Host "2. Check browser console for logged variables" -ForegroundColor Magenta
