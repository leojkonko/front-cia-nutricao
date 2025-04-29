# Script to clean up unused speech recognition files
Write-Host "Starting cleanup of unused speech recognition files..." -ForegroundColor Cyan

# Define the files to be removed
$filesToRemove = @(
    "src\components\AudioTranscriber.tsx",
    "src\components\AudioTranscriber.legacy.tsx",
    "src\components\AudioTranscriberWithAssemblyAI.tsx",
    "src\components\AudioTranscriberWithImport.tsx",
    "src\components\AssemblyAITranscriberComponent.tsx",
    "src\components\SimpleAudioTranscriber.tsx",
    "src\components\WorkingAudioTranscriber.tsx",
    "src\services\AssemblyAIService.ts",
    "src\utils\assemblyAIDebug.ts",
    "src\pages\TranscriptionDemo.tsx"
)

# Create backup directory for removed files
$backupDir = "backup-speech-recognition-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
Write-Host "Created backup directory: $backupDir" -ForegroundColor Green

# Backup and remove each file
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        # Create the directory structure in the backup folder
        $backupPath = Join-Path $backupDir $file
        $backupFolder = Split-Path -Path $backupPath -Parent
        
        if (-not (Test-Path $backupFolder)) {
            New-Item -Path $backupFolder -ItemType Directory -Force | Out-Null
        }
        
        # Copy the file to backup
        Copy-Item -Path $file -Destination $backupPath -Force
        Write-Host "Backed up: $file" -ForegroundColor Green
        
        # Remove the original file
        Remove-Item -Path $file -Force
        Write-Host "Removed: $file" -ForegroundColor Yellow
    } else {
        Write-Host "File not found, skipping: $file" -ForegroundColor Magenta
    }
}

Write-Host "`nCleanup completed successfully!" -ForegroundColor Cyan
Write-Host "Files have been backed up to: $backupDir" -ForegroundColor Cyan
Write-Host "You may want to run 'npm run build' to verify no TypeScript errors remain." -ForegroundColor Cyan
