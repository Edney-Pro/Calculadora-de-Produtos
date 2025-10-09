# ContagemDinheiro.ps1 - Calculadora de Contagem de Dinheiro
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Show-ContagemDinheiro {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "💵 Contagem de Dinheiro - Encomenda Palotina"
    $form.Size = New-Object System.Drawing.Size(600, 700)
    $form.StartPosition = "CenterScreen"
    $form.BackColor = [System.Drawing.Color]::FromArgb(247, 245, 251)
    $form.MaximizeBox = $false

    # Header
    $headerLabel = New-Object System.Windows.Forms.Label
    $headerLabel.Text = "💵 Contagem de Dinheiro"
    $headerLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $headerLabel.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
    $headerLabel.Size = New-Object System.Drawing.Size(400, 40)
    $headerLabel.Location = New-Object System.Drawing.Point(20, 20)
    $form.Controls.Add($headerLabel)

    # Painel de Cédulas
    $cedulasPanel = New-Object System.Windows.Forms.GroupBox
    $cedulasPanel.Text = "📄 Cédulas"
    $cedulasPanel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $cedulasPanel.Size = New-Object System.Drawing.Size(550, 300)
    $cedulasPanel.Location = New-Object System.Drawing.Point(20, 80)
    $cedulasPanel.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)

    $cedulas = @(
        @{Valor = 200; Label = "R$ 200,00"; YPos = 30},
        @{Valor = 100; Label = "R$ 100,00"; YPos = 60},
        @{Valor = 50; Label = "R$ 50,00"; YPos = 90},
        @{Valor = 20; Label = "R$ 20,00"; YPos = 120},
        @{Valor = 10; Label = "R$ 10,00"; YPos = 150},
        @{Valor = 5; Label = "R$ 5,00"; YPos = 180},
        @{Valor = 2; Label = "R$ 2,00"; YPos = 210}
    )

    $global:CedulasControls = @()
    
    foreach ($cedula in $cedulas) {
        # Label
        $label = New-Object System.Windows.Forms.Label
        $label.Text = $cedula.Label
        $label.Size = New-Object System.Drawing.Size(80, 20)
        $label.Location = New-Object System.Drawing.Point(20, $cedula.YPos)
        $label.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $cedulasPanel.Controls.Add($label)

        # Numeric UpDown
        $numeric = New-Object System.Windows.Forms.NumericUpDown
        $numeric.Size = New-Object System.Drawing.Size(60, 20)
        $numeric.Location = New-Object System.Drawing.Point(110, $cedula.YPos)
        $numeric.Minimum = 0
        $numeric.Maximum = 1000
        $numeric.Value = 0
        $numeric.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $numeric.Add_ValueChanged({ Update-Total })
        $cedulasPanel.Controls.Add($numeric)

        # Total da cédula
        $totalLabel = New-Object System.Windows.Forms.Label
        $totalLabel.Text = "R$ 0,00"
        $totalLabel.Size = New-Object System.Drawing.Size(80, 20)
        $totalLabel.Location = New-Object System.Drawing.Point(180, $cedula.YPos)
        $totalLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $cedulasPanel.Controls.Add($totalLabel)

        $global:CedulasControls += @{
            Valor = $cedula.Valor
            Numeric = $numeric
            Total = $totalLabel
        }
    }

    # Total Cédulas
    $labelTotalCedulas = New-Object System.Windows.Forms.Label
    $labelTotalCedulas.Text = "Total Cédulas: R$ 0,00"
    $labelTotalCedulas.Size = New-Object System.Drawing.Size(200, 25)
    $labelTotalCedulas.Location = New-Object System.Drawing.Point(300, 240)
    $labelTotalCedulas.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $labelTotalCedulas.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
    $cedulasPanel.Controls.Add($labelTotalCedulas)

    $form.Controls.Add($cedulasPanel)

    # Painel de Moedas
    $moedasPanel = New-Object System.Windows.Forms.GroupBox
    $moedasPanel.Text = "🪙 Moedas"
    $moedasPanel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $moedasPanel.Size = New-Object System.Drawing.Size(550, 200)
    $moedasPanel.Location = New-Object System.Drawing.Point(20, 400)
    $moedasPanel.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)

    $moedas = @(
        @{Valor = 1.00; Label = "R$ 1,00"; YPos = 30},
        @{Valor = 0.50; Label = "R$ 0,50"; YPos = 60},
        @{Valor = 0.25; Label = "R$ 0,25"; YPos = 90},
        @{Valor = 0.10; Label = "R$ 0,10"; YPos = 120},
        @{Valor = 0.05; Label = "R$ 0,05"; YPos = 150}
    )

    $global:MoedasControls = @()
    
    foreach ($moeda in $moedas) {
        # Label
        $label = New-Object System.Windows.Forms.Label
        $label.Text = $moeda.Label
        $label.Size = New-Object System.Drawing.Size(80, 20)
        $label.Location = New-Object System.Drawing.Point(20, $moeda.YPos)
        $label.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $moedasPanel.Controls.Add($label)

        # Numeric UpDown
        $numeric = New-Object System.Windows.Forms.NumericUpDown
        $numeric.Size = New-Object System.Drawing.Size(60, 20)
        $numeric.Location = New-Object System.Drawing.Point(110, $moeda.YPos)
        $numeric.Minimum = 0
        $numeric.Maximum = 1000
        $numeric.Value = 0
        $numeric.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $numeric.Add_ValueChanged({ Update-Total })
        $moedasPanel.Controls.Add($numeric)

        # Total da moeda
        $totalLabel = New-Object System.Windows.Forms.Label
        $totalLabel.Text = "R$ 0,00"
        $totalLabel.Size = New-Object System.Drawing.Size(80, 20)
        $totalLabel.Location = New-Object System.Drawing.Point(180, $moeda.YPos)
        $totalLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $moedasPanel.Controls.Add($totalLabel)

        $global:MoedasControls += @{
            Valor = $moeda.Valor
            Numeric = $numeric
            Total = $totalLabel
        }
    }

    # Total Moedas
    $labelTotalMoedas = New-Object System.Windows.Forms.Label
    $labelTotalMoedas.Text = "Total Moedas: R$ 0,00"
    $labelTotalMoedas.Size = New-Object System.Drawing.Size(200, 25)
    $labelTotalMoedas.Location = New-Object System.Drawing.Point(300, 150)
    $labelTotalMoedas.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $labelTotalMoedas.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
    $moedasPanel.Controls.Add($labelTotalMoedas)

    $form.Controls.Add($moedasPanel)

    # Total Geral
    $panelTotal = New-Object System.Windows.Forms.Panel
    $panelTotal.Size = New-Object System.Drawing.Size(550, 60)
    $panelTotal.Location = New-Object System.Drawing.Point(20, 610)
    $panelTotal.BackColor = [System.Drawing.Color]::FromArgb(123, 44, 191)

    $labelTotalGeral = New-Object System.Windows.Forms.Label
    $labelTotalGeral.Text = "TOTAL GERAL: R$ 0,00"
    $labelTotalGeral.Size = New-Object System.Drawing.Size(400, 30)
    $labelTotalGeral.Location = New-Object System.Drawing.Point(20, 15)
    $labelTotalGeral.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $labelTotalGeral.ForeColor = [System.Drawing.Color]::White
    $panelTotal.Controls.Add($labelTotalGeral)

    $form.Controls.Add($panelTotal)

    # Função para atualizar totais
    function Update-Total {
        $totalCedulas = 0.0
        $totalMoedas = 0.0
        
        # Calcula total cédulas
        foreach ($cedula in $global:CedulasControls) {
            $quantidade = [int]$cedula.Numeric.Value
            $totalCedula = $cedula.Valor * $quantidade
            $totalCedulas += $totalCedula
            $cedula.Total.Text = "R$ $($totalCedula.ToString('N2'))"
        }
        
        # Calcula total moedas
        foreach ($moeda in $global:MoedasControls) {
            $quantidade = [int]$moeda.Numeric.Value
            $totalMoeda = $moeda.Valor * $quantidade
            $totalMoedas += $totalMoeda
            $moeda.Total.Text = "R$ $($totalMoeda.ToString('N2'))"
        }
        
        $totalGeral = $totalCedulas + $totalMoedas
        
        $labelTotalCedulas.Text = "Total Cédulas: R$ $($totalCedulas.ToString('N2'))"
        $labelTotalMoedas.Text = "Total Moedas: R$ $($totalMoedas.ToString('N2'))"
        $labelTotalGeral.Text = "TOTAL GERAL: R$ $($totalGeral.ToString('N2'))"
    }

    # Botão Limpar
    $btnLimpar = New-Object System.Windows.Forms.Button
    $btnLimpar.Text = "🗑️ Limpar Tudo"
    $btnLimpar.Size = New-Object System.Drawing.Size(120, 35)
    $btnLimpar.Location = New-Object System.Drawing.Point(450, 350)
    $btnLimpar.BackColor = [System.Drawing.Color]::FromArgb(231, 76, 60)
    $btnLimpar.ForeColor = [System.Drawing.Color]::White
    $btnLimpar.FlatStyle = "Flat"
    $btnLimpar.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $btnLimpar.Add_Click({
        foreach ($cedula in $global:CedulasControls) {
            $cedula.Numeric.Value = 0
        }
        foreach ($moeda in $global:MoedasControls) {
            $moeda.Numeric.Value = 0
        }
        Update-Total
    })
    $form.Controls.Add($btnLimpar)

    $form.Add_Shown({$form.Activate()})
    $form.ShowDialog() | Out-Null
}

Write-Host "💵 Iniciando Calculadora de Contagem de Dinheiro..." -ForegroundColor Cyan
Show-ContagemDinheiro