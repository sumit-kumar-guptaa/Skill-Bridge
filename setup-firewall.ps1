# Run this script as Administrator to configure Windows Firewall

Write-Host "Configuring Windows Firewall for Node.js Server..." -ForegroundColor Cyan

# Add inbound rule for port 3000
try {
    $existingRule = Get-NetFirewallRule -DisplayName "Node.js Server - Port 3000" -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Host "Removing existing rule..." -ForegroundColor Yellow
        Remove-NetFirewallRule -DisplayName "Node.js Server - Port 3000"
    }
    
    New-NetFirewallRule -DisplayName "Node.js Server - Port 3000" `
                        -Direction Inbound `
                        -LocalPort 3000 `
                        -Protocol TCP `
                        -Action Allow `
                        -Profile Any `
                        -Enabled True
    
    Write-Host "✅ Firewall rule added successfully!" -ForegroundColor Green
    Write-Host "Port 3000 is now accessible on your network." -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add firewall rule: $_" -ForegroundColor Red
    Write-Host "Please run this script as Administrator" -ForegroundColor Yellow
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
