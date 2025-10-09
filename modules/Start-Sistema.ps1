# Start-Sistema.ps1 - Script para iniciar o sistema
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 CALCULADORA DE PARCELAS ENCOMENDA PALOTINA" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 MÓDULOS ATIVOS:" -ForegroundColor Green
Write-Host "   ✅ Produtos Novos" -ForegroundColor Green
Write-Host "   ✅ Contagem de Dinheiro" -ForegroundColor Green
Write-Host ""
Write-Host "🛠️  MÓDULOS EM DESENVOLVIMENTO:" -ForegroundColor Gray
Write-Host "   ⏳ 16 ferramentas adicionais" -ForegroundColor Gray
Write-Host ""
Write-Host "📍 Iniciando sistema principal..." -ForegroundColor Cyan
Write-Host ""

# Verificar se o PowerShell tem permissões
try {
    Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
    Add-Type -AssemblyName System.Drawing -ErrorAction Stop
} catch {
    Write-Host "❌ Erro: Não foi possível carregar as bibliotecas necessárias" -ForegroundColor Red
    Write-Host "💡 Execute o PowerShell como Administrador" -ForegroundColor Yellow
    pause
    exit
}

# Iniciar sistema principal
try {
    & ".\modules\Main.ps1"
} catch {
    Write-Host "❌ Erro ao iniciar o sistema: $($_.Exception.Message)" -ForegroundColor Red
    pause
}