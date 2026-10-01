$ErrorActionPreference = 'Stop'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node.js is required. Install the current LTS release, then run this script again.'
}

if (-not (Test-Path (Join-Path $PSScriptRoot 'node_modules\socket.io'))) {
    throw 'Server dependencies are missing. Run "npm install" from the server folder first.'
}

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    throw 'cloudflared is not installed. Download the Windows executable from Cloudflare, rename it to cloudflared.exe, and add its folder to PATH.'
}

$portProbe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 3001)
try {
    $portProbe.Start()
} catch {
    throw 'Port 3001 is already in use. Stop its multiplayer server before starting this one.'
} finally {
    $portProbe.Stop()
}

$serverProcess = Start-Process -FilePath 'node' `
    -ArgumentList 'index.js' `
    -WorkingDirectory $PSScriptRoot `
    -PassThru `
    -NoNewWindow

try {
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        if ($serverProcess.HasExited) {
            throw 'The game server stopped before it was ready.'
        }
        try {
            $connection = [System.Net.Sockets.TcpClient]::new()
            $connection.Connect('127.0.0.1', 3001)
            $connection.Dispose()
            $ready = $true
            break
        } catch {
            Start-Sleep -Seconds 1
        }
    }

    if (-not $ready) {
        throw 'The multiplayer server did not start on port 3001.'
    }

    Write-Host 'Multiplayer server ready. Keep this window open and share the trycloudflare.com URL below.'
    & cloudflared tunnel --url http://127.0.0.1:3001
    if ($LASTEXITCODE -ne 0) {
        throw "cloudflared exited with code $LASTEXITCODE."
    }
} finally {
    if (-not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id
    }
}
