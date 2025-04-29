# Script to test environment variables in a production-like environment

Write-Host "Testing production environment variables for Vite application..." -ForegroundColor Green
Write-Host "---------------------------------------------------------" -ForegroundColor Green

# Build the application with environment variables
Write-Host "Building the application to test environment variable integration..." -ForegroundColor Yellow
npm run build

# Create a temporary test HTML file to check environment variables in the built output
$testContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Environment Variable Test</title>
    <script>
        // Function to scan built JS files for environment variables
        async function scanBuildFiles() {
            try {
                const response = await fetch('./assets/index-*.js');
                const text = await response.text();
                
                // Check for environment variables
                const envVarMatches = text.match(/VITE_[A-Z_]+/g) || [];
                const uniqueEnvVars = [...new Set(envVarMatches)];
                
                document.getElementById('env-vars').innerHTML = 
                    uniqueEnvVars.length > 0 
                        ? uniqueEnvVars.map(v => `<li>${v}</li>`).join('') 
                        : '<li>No environment variables found</li>';
                
                // Check for hardcoded API keys (as a security measure)
                const apiKeyPattern = /[a-f0-9]{32,}/gi;
                const potentialApiKeys = text.match(apiKeyPattern) || [];
                
                if (potentialApiKeys.length > 0) {
                    document.getElementById('security-warning').style.display = 'block';
                    document.getElementById('api-keys').innerHTML = 
                        potentialApiKeys.map(k => `<li>${k.substring(0, 4)}...${k.substring(k.length-4)}</li>`).join('');
                }
            } catch (error) {
                document.getElementById('error').textContent = `Error: ${error.message}`;
            }
        }
    </script>
</head>
<body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
    <h1>Environment Variable Test for Built Application</h1>
    
    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2>Found Environment Variables:</h2>
        <ul id="env-vars">
            <li>Scanning...</li>
        </ul>
    </div>
    
    <div id="security-warning" style="background-color: #ffe0e0; padding: 15px; border-radius: 5px; margin: 20px 0; display: none;">
        <h2>⚠️ Security Warning: Potential API Keys Found</h2>
        <p>The following potential API keys were found in your built JavaScript files:</p>
        <ul id="api-keys"></ul>
        <p>If these are real API keys, consider using a server-side approach instead of including them in client-side code.</p>
    </div>
    
    <div id="error" style="color: red;"></div>
    
    <script>
        // Run the scan when page loads
        window.onload = scanBuildFiles;
    </script>
</body>
</html>
"@

$testFilePath = ".\dist\env-test.html"
$testContent | Out-File -FilePath $testFilePath -Encoding utf8

Write-Host "`nStarting a local server to test the built application..." -ForegroundColor Yellow
Write-Host "Open http://localhost:4173/env-test.html in your browser to view the test results" -ForegroundColor Cyan

# Start the preview server
npm run preview
