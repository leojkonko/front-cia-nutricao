# Fix Recognition Script for AssemblyAI
# This script helps troubleshoot and fix common issues with audio transcription

# Set strict error handling
$ErrorActionPreference = "Stop"

# Color functions for better visibility
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) {
    Write-ColorOutput Green "[SUCCESS] $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "[INFO] $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "[WARNING] $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[ERROR] $message"
}

# Banner
Write-Info "====================================================="
Write-Info "      AssemblyAI Speech Recognition Fix Tool"
Write-Info "====================================================="
Write-Info "This script will help fix common issues with the audio transcription."
Write-Info ""

# Check if .env file exists
$envPath = ".\.env"
if (Test-Path $envPath) {
    Write-Info "Checking for AssemblyAI API key in .env file..."
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "ASSEMBLY_API_KEY=([a-zA-Z0-9]+)") {
        $apiKey = $matches[1]
        Write-Success "Found API key in .env file: $apiKey"
    } else {
        Write-Warning "No API key found in .env file."
        $addKey = Read-Host "Would you like to add an API key? (y/n)"
        if ($addKey -eq "y") {
            $newKey = Read-Host "Enter your AssemblyAI API key"
            if ($envContent -match "ASSEMBLY_API_KEY=") {
                $envContent = $envContent -replace "ASSEMBLY_API_KEY=.*", "ASSEMBLY_API_KEY=$newKey"
            } else {
                $envContent += "`nASSEMBLY_API_KEY=$newKey`n"
            }
            $envContent | Set-Content $envPath
            Write-Success "API key added to .env file."
        }
    }
} else {
    Write-Warning "No .env file found. Creating one now."
    $newKey = Read-Host "Enter your AssemblyAI API key (leave blank to skip)"
    if ($newKey) {
        "ASSEMBLY_API_KEY=$newKey" | Set-Content $envPath
        Write-Success ".env file created with API key."
    } else {
        "# Environment variables" | Set-Content $envPath
        Write-Info ".env file created. You'll need to add your API key later."
    }
}

# Check if AssemblyAI package is installed
Write-Info "Checking for AssemblyAI package..."
$packageJson = Get-Content ".\package.json" -Raw | ConvertFrom-Json
$assemblyaiInstalled = $packageJson.dependencies.assemblyai -ne $null

if ($assemblyaiInstalled) {
    Write-Success "AssemblyAI package found in dependencies."
} else {
    Write-Warning "AssemblyAI package not found in dependencies."
    $installPackage = Read-Host "Would you like to install the AssemblyAI package? (y/n)"
    if ($installPackage -eq "y") {
        Write-Info "Installing AssemblyAI package..."
        npm install assemblyai@4.0.0 --save-exact
        if ($LASTEXITCODE -eq 0) {
            Write-Success "AssemblyAI package installed successfully."
        } else {
            Write-Error "Failed to install AssemblyAI package."
            exit 1
        }
    }
}

# Check for required files
Write-Info "Checking for required component files..."
$requiredFiles = @(
    ".\src\components\AudioTranscriberWithAssemblyAI.tsx",
    ".\src\services\AssemblyAIService.ts"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Warning "The following required files are missing:"
    foreach ($file in $missingFiles) {
        Write-Warning "  - $file"
    }
    Write-Info "Please check the documentation in docs/AssemblyAI-Setup.md for instructions."
} else {
    Write-Success "All required component files are present."
}

# Testing microphone access (browser-based, can't test directly from PowerShell)
Write-Info "Note: Microphone access can only be tested in the browser."
Write-Info "Make sure you've granted microphone permissions to your browser."

# Checking browser compatibility
Write-Info "Checking browser compatibility..."
Write-Info "AssemblyAI works with all modern browsers, unlike the Web Speech API."
Write-Info "Make sure you're using Chrome, Firefox, Edge, or Safari for optimal results."

# Final summary
Write-Info ""
Write-Info "====================================================="
Write-Info "                  Fix Summary"
Write-Info "====================================================="
Write-Success "AssemblyAI should be properly configured in your application."
Write-Info "If you're still experiencing issues, please check:"
Write-Info "1. Your API key is valid and has sufficient credits"
Write-Info "2. Your microphone is properly connected and working"
Write-Info "3. Consult the documentation in docs/AssemblyAI-Setup.md"
Write-Info ""
Write-Info "For more assistance, visit: https://www.assemblyai.com/docs"
Write-Info "====================================================="
