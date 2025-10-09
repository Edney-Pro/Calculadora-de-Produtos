# Main.ps1 - Sistema Principal Completo
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Configurações globais
$Script:Config = Get-Content "$PSScriptRoot\..\config.json" | ConvertFrom-Json
$Script:IconPath = "$PSScriptRoot\..\icons"

function Show-MainInterface {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = $Script:Config.system_name
    $form.Size = New-Object System.Drawing.Size(1200, 800)
    $form.StartPosition = "CenterScreen"
    $form.BackColor = [System.Drawing.Color]::FromArgb(247, 245, 251)
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false

    # Header
    $headerPanel = New-Object System.Windows.Forms.Panel
    $headerPanel.Size = New-Object System.Drawing.Size(1180, 80)
    $headerPanel.Location = New-Object System.Drawing.Point(10, 10)
    $headerPanel.BackColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
    
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = $Script:Config.system_name
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleLabel.ForeColor = [System.Drawing.Color]::White
    $titleLabel.Size = New-Object System.Drawing.Size(600, 40)
    $titleLabel.Location = New-Object System.Drawing.Point(20, 20)
    $headerPanel.Controls.Add($titleLabel)
    $form.Controls.Add($headerPanel)

    # Container principal com scroll
    $scrollPanel = New-Object System.Windows.Forms.Panel
    $scrollPanel.Size = New-Object System.Drawing.Size(1180, 550)
    $scrollPanel.Location = New-Object System.Drawing.Point(10, 100)
    $scrollPanel.AutoScroll = $true
    $scrollPanel.BackColor = [System.Drawing.Color]::FromArgb(247, 245, 251)

    # Criar os 7 grupos de ferramentas
    $yPosition = 20
    $grupos = @(
        @{Nome = "🛒 Produtos"; Icone = "produtos.ico"; Cor = "7b2cbf"},
        @{Nome = "🪑 Móveis"; Icone = "moveis.ico"; Cor = "9c27b0"},
        @{Nome = "💰 Empréstimos"; Icone = "emprestimos.ico"; Cor = "673ab7"},
        @{Nome = "🚗 Veículos Automotores"; Icone = "veiculos.ico"; Cor = "3f51b5"},
        @{Nome = "⚡ Veículos Elétricos"; Icone = "eletricos.ico"; Cor = "2196f3"},
        @{Nome = "🔄 Renegociação de Dívidas"; Icone = "renegociacao.ico"; Cor = "ff9800"},
        @{Nome = "🧮 Ferramentas Gerais"; Icone = "ferramentas.ico"; Cor = "4caf50"}
    )

    foreach ($grupo in $grupos) {
        $grupoPanel = Create-GroupPanel -Grupo $grupo -YPosition $yPosition
        $scrollPanel.Controls.Add($grupoPanel)
        $yPosition += 130
    }

    $form.Controls.Add($scrollPanel)

    # Rodapé com redes sociais
    $footerPanel = Create-FooterPanel
    $form.Controls.Add($footerPanel)

    $form.Add_Shown({$form.Activate()})
    $form.ShowDialog() | Out-Null
}

function Create-GroupPanel {
    param($Grupo, $YPosition)
    
    $panel = New-Object System.Windows.Forms.Panel
    $panel.Size = New-Object System.Drawing.Size(1140, 110)
    $panel.Location = New-Object System.Drawing.Point(20, $YPosition)
    $panel.BackColor = [System.Drawing.Color]::White
    $panel.BorderStyle = "FixedSingle"

    # Título do grupo
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = $Grupo.Nome
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $titleLabel.Size = New-Object System.Drawing.Size(300, 25)
    $titleLabel.Location = New-Object System.Drawing.Point(20, 15)
    $titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
    $panel.Controls.Add($titleLabel)

    # Botões das ferramentas do grupo
    $ferramentas = Get-FerramentasPorGrupo -Grupo $Grupo.Nome
    $xPos = 20
    $yPos = 45
    
    foreach ($ferramenta in $ferramentas) {
        $btn = Create-ToolButton -Ferramenta $ferramenta -XPosition $xPos -YPosition $yPos
        $panel.Controls.Add($btn)
        $xPos += 180
        
        # Quebra de linha se passar de 5 botões
        if ($xPos -gt 900) {
            $xPos = 20
            $yPos += 70
        }
    }

    return $panel
}

function Get-FerramentasPorGrupo {
    param($Grupo)
    
    switch -Regex ($Grupo) {
        "Produtos" { 
            return @(
                @{Nome = "📦 Produtos Novos"; Ativo = $true; Script = "ProdutosNovos.ps1"},
                @{Nome = "📦 Produtos Usados"; Ativo = $false; Script = ""}
            )
        }
        "Móveis" {
            return @(
                @{Nome = "🪑 Com Montagem"; Ativo = $false; Script = ""},
                @{Nome = "🪑 Sem Montagem"; Ativo = $false; Script = ""}
            )
        }
        "Empréstimos" {
            return @(
                @{Nome = "💰 Sem Garantia"; Ativo = $false; Script = ""},
                @{Nome = "💰 Com Garantia"; Ativo = $false; Script = ""},
                @{Nome = "📅 Diário"; Ativo = $false; Script = ""}
            )
        }
        "Veículos Automotores" {
            return @(
                @{Nome = "🚗 Carros Usados"; Ativo = $false; Script = ""},
                @{Nome = "🏍️ Motos Usadas"; Ativo = $false; Script = ""},
                @{Nome = "🔧 Acessórios"; Ativo = $false; Script = ""}
            )
        }
        "Veículos Elétricos" {
            return @(
                @{Nome = "🚲 Bicicletas"; Ativo = $false; Script = ""},
                @{Nome = "🛴 Patinetes"; Ativo = $false; Script = ""},
                @{Nome = "🔧 Acessórios"; Ativo = $false; Script = ""}
            )
        }
        "Renegociação" {
            return @(
                @{Nome = "📦 Produtos"; Ativo = $false; Script = ""},
                @{Nome = "🚗 Veículos"; Ativo = $false; Script = ""},
                @{Nome = "💳 Dívida Total"; Ativo = $false; Script = ""}
            )
        }
        "Ferramentas Gerais" {
            return @(
                @{Nome = "💵 Contagem Dinheiro"; Ativo = $true; Script = "ContagemDinheiro.ps1"},
                @{Nome = "🧮 Calculadora"; Ativo = $false; Script = ""}
            )
        }
    }
}

function Create-ToolButton {
    param($Ferramenta, $XPosition, $YPosition)
    
    $button = New-Object System.Windows.Forms.Button
    $button.Size = New-Object System.Drawing.Size(160, 55)
    $button.Location = New-Object System.Drawing.Point($XPosition, $YPosition)
    $button.Text = $Ferramenta.Nome
    $button.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    
    if ($Ferramenta.Ativo) {
        $button.BackColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
        $button.ForeColor = [System.Drawing.Color]::White
        $button.FlatStyle = "Flat"
        $button.FlatAppearance.BorderSize = 0
        $button.Cursor = [System.Windows.Forms.Cursors]::Hand
        
        $button.Add_Click({
            $scriptPath = Join-Path $PSScriptRoot $Ferramenta.Script
            if (Test-Path $scriptPath) {
                & $scriptPath
            } else {
                [System.Windows.Forms.MessageBox]::Show("Módulo em desenvolvimento!", "Info", "OK", "Information")
            }
        })
    } else {
        $button.BackColor = [System.Drawing.Color]::FromArgb(240, 240, 240)
        $button.ForeColor = [System.Drawing.Color]::FromArgb(150, 150, 150)
        $button.FlatStyle = "Flat"
        $button.FlatAppearance.BorderSize = 0
        $button.Enabled = $false
        $button.Text = "🚧 Em Breve"
    }
    
    return $button
}

function Create-FooterPanel {
    $panel = New-Object System.Windows.Forms.Panel
    $panel.Size = New-Object System.Drawing.Size(1180, 70)
    $panel.Location = New-Object System.Drawing.Point(10, 660)
    $panel.BackColor = [System.Drawing.Color]::FromArgb(245, 245, 245)
    $panel.BorderStyle = "FixedSingle"

    # Logo
    $logoLabel = New-Object System.Windows.Forms.Label
    $logoLabel.Text = "© 2024 Encomenda Palotina - Todos os direitos reservados"
    $logoLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $logoLabel.Size = New-Object System.Drawing.Size(400, 25)
    $logoLabel.Location = New-Object System.Drawing.Point(20, 23)
    $logoLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
    $panel.Controls.Add($logoLabel)

    # Redes sociais
    $redesSociais = @(
        @{Nome = "Instagram"; Icone = "📷"; Url = $Script:Config.social_links.instagram; Cor = "E4405F"},
        @{Nome = "Facebook"; Icone = "👥"; Url = $Script:Config.social_links.facebook; Cor = "1877F2"},
        @{Nome = "WhatsApp"; Icone = "💚"; Url = $Script:Config.social_links.whatsapp; Cor = "25D366"},
        @{Nome = "E-mail"; Icone = "📧"; Url = $Script:Config.social_links.email; Cor = "EA4335"}
    )

    $xPos = 800
    foreach ($rede in $redesSociais) {
        $btn = New-Object System.Windows.Forms.Button
        $btn.Size = New-Object System.Drawing.Size(45, 45)
        $btn.Location = New-Object System.Drawing.Point($xPos, 12)
        $btn.FlatStyle = "Flat"
        $btn.BackColor = [System.Drawing.Color]::FromArgb(255, 255, 255)
        $btn.ForeColor = [System.Drawing.Color]::White
        $btn.Font = New-Object System.Drawing.Font("Segoe UI", 12)
        $btn.Text = $rede.Icone
        $btn.FlatAppearance.BorderSize = 0
        $btn.Cursor = [System.Windows.Forms.Cursors]::Hand
        
        $btn.Add_Click({
            Start-Process $rede.Url
        })
        
        $panel.Controls.Add($btn)
        $xPos += 55
    }

    return $panel
}

# Iniciar sistema
Write-Host "🚀 Iniciando Calculadora de Parcelas Encomenda Palotina..." -ForegroundColor Cyan
Write-Host "📍 Módulos Ativos: Produtos Novos, Contagem Dinheiro" -ForegroundColor Yellow
Write-Host "⏳ Módulos em Desenvolvimento: 12 ferramentas" -ForegroundColor Gray

Show-MainInterface