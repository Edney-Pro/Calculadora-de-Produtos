# ProdutosNovos.ps1 - Calculadora Completa de Produtos Novos
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Funções de cálculo
function Format-Currency {
    param([double]$Value)
    return "R$ $($Value.ToString('N2'))"
}

function Calculate-TaxaJuros {
    param(
        [int]$Parcelas,
        [bool]$ComEntrada
    )
    
    if ($Parcelas -eq 1) { return 0.0 }
    
    if ($ComEntrada) {
        # Taxa com entrada: 0.14 → 0.05
        return 0.14 - (0.14 - 0.05) * (($Parcelas - 1) / 35)
    } else {
        # Taxa sem entrada: 0.18 → 0.08  
        return 0.18 - (0.18 - 0.08) * (($Parcelas - 1) / 35)
    }
}

function Calculate-Parcela {
    param(
        [double]$ValorTotal,
        [double]$Entrada,
        [int]$Parcelas,
        [bool]$ComEntrada
    )
    
    $valorFinanciado = $ValorTotal - $Entrada
    if ($valorFinanciado -le 0) { return 0.0 }
    
    if ($Parcelas -eq 1) { return $valorFinanciado }
    
    $taxa = Calculate-TaxaJuros -Parcelas $Parcelas -ComEntrada $ComEntrada
    $valorParcela = $valorFinanciado * $taxa * [math]::Pow(1 + $taxa, $Parcelas) / ([math]::Pow(1 + $taxa, $Parcelas) - 1)
    
    return [math]::Round($valorParcela, 2)
}

function Show-ProdutosNovosCalculator {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "📦 Calculadora de Produtos Novos - Encomenda Palotina"
    $form.Size = New-Object System.Drawing.Size(900, 700)
    $form.StartPosition = "CenterScreen"
    $form.BackColor = [System.Drawing.Color]::FromArgb(247, 245, 251)
    $form.MaximizeBox = $false

    # Header
    $headerLabel = New-Object System.Windows.Forms.Label
    $headerLabel.Text = "Calculadora de Produtos Novos"
    $headerLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $headerLabel.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
    $headerLabel.Size = New-Object System.Drawing.Size(400, 40)
    $headerLabel.Location = New-Object System.Drawing.Point(20, 20)
    $form.Controls.Add($headerLabel)

    # Painel de dados do cliente
    $clientePanel = New-Object System.Windows.Forms.GroupBox
    $clientePanel.Text = "👤 Dados do Cliente"
    $clientePanel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $clientePanel.Size = New-Object System.Drawing.Size(850, 100)
    $clientePanel.Location = New-Object System.Drawing.Point(20, 70)
    $clientePanel.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)

    # Nome
    $labelNome = New-Object System.Windows.Forms.Label
    $labelNome.Text = "Nome Completo:"
    $labelNome.Size = New-Object System.Drawing.Size(120, 20)
    $labelNome.Location = New-Object System.Drawing.Point(20, 30)
    $labelNome.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $clientePanel.Controls.Add($labelNome)

    $textNome = New-Object System.Windows.Forms.TextBox
    $textNome.Size = New-Object System.Drawing.Size(300, 20)
    $textNome.Location = New-Object System.Drawing.Point(140, 30)
    $textNome.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $clientePanel.Controls.Add($textNome)

    # CPF
    $labelCPF = New-Object System.Windows.Forms.Label
    $labelCPF.Text = "CPF:"
    $labelCPF.Size = New-Object System.Drawing.Size(40, 20)
    $labelCPF.Location = New-Object System.Drawing.Point(460, 30)
    $labelCPF.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $clientePanel.Controls.Add($labelCPF)

    $textCPF = New-Object System.Windows.Forms.TextBox
    $textCPF.Size = New-Object System.Drawing.Size(200, 20)
    $textCPF.Location = New-Object System.Drawing.Point(500, 30)
    $textCPF.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $textCPF.Add_TextChanged({
        $currentText = $textCPF.Text -replace '\D'
        if ($currentText.Length -gt 11) {
            $currentText = $currentText.Substring(0, 11)
        }
        
        if ($currentText.Length -gt 0) {
            $formatted = $currentText
            if ($currentText.Length -gt 3) {
                $formatted = $currentText.Insert(3, '.')
            }
            if ($currentText.Length -gt 6) {
                $formatted = $formatted.Insert(7, '.')
            }
            if ($currentText.Length -gt 9) {
                $formatted = $formatted.Insert(11, '-')
            }
            $textCPF.Text = $formatted
            $textCPF.SelectionStart = $textCPF.Text.Length
        }
    })
    $clientePanel.Controls.Add($textCPF)

    $form.Controls.Add($clientePanel)

    # Painel de produtos
    $produtosPanel = New-Object System.Windows.Forms.GroupBox
    $produtosPanel.Text = "🛒 Produtos (Máximo 15)"
    $produtosPanel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $produtosPanel.Size = New-Object System.Drawing.Size(850, 200)
    $produtosPanel.Location = New-Object System.Drawing.Point(20, 190)
    $produtosPanel.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)

    # Cabeçalho da lista
    $labelProduto = New-Object System.Windows.Forms.Label
    $labelProduto.Text = "Produto"
    $labelProduto.Size = New-Object System.Drawing.Size(200, 20)
    $labelProduto.Location = New-Object System.Drawing.Point(20, 30)
    $labelProduto.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $produtosPanel.Controls.Add($labelProduto)

    $labelValor = New-Object System.Windows.Forms.Label
    $labelValor.Text = "Valor Unitário"
    $labelValor.Size = New-Object System.Drawing.Size(100, 20)
    $labelValor.Location = New-Object System.Drawing.Point(230, 30)
    $labelValor.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $produtosPanel.Controls.Add($labelValor)

    $labelQuantidade = New-Object System.Windows.Forms.Label
    $labelQuantidade.Text = "Qtd"
    $labelQuantidade.Size = New-Object System.Drawing.Size(50, 20)
    $labelQuantidade.Location = New-Object System.Drawing.Point(340, 30)
    $labelQuantidade.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $produtosPanel.Controls.Add($labelQuantidade)

    $labelTotal = New-Object System.Windows.Forms.Label
    $labelTotal.Text = "Total"
    $labelTotal.Size = New-Object System.Drawing.Size(100, 20)
    $labelTotal.Location = New-Object System.Drawing.Point(400, 30)
    $labelTotal.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $produtosPanel.Controls.Add($labelTotal)

    # Lista de produtos (inicial com 1 produto)
    $global:ProdutosControls = @()
    Add-ProdutoRow -YPosition 60

    # Botão adicionar produto
    $btnAddProduto = New-Object System.Windows.Forms.Button
    $btnAddProduto.Text = "➕ Adicionar Produto"
    $btnAddProduto.Size = New-Object System.Drawing.Size(150, 30)
    $btnAddProduto.Location = New-Object System.Drawing.Point(20, 160)
    $btnAddProduto.BackColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
    $btnAddProduto.ForeColor = [System.Drawing.Color]::White
    $btnAddProduto.FlatStyle = "Flat"
    $btnAddProduto.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $btnAddProduto.Add_Click({ Add-ProdutoRow -YPosition (60 + ($global:ProdutosControls.Count * 30)) })
    $produtosPanel.Controls.Add($btnAddProduto)

    # Total produtos
    $labelTotalProdutos = New-Object System.Windows.Forms.Label
    $labelTotalProdutos.Text = "Total Produtos: R$ 0,00"
    $labelTotalProdutos.Size = New-Object System.Drawing.Size(200, 20)
    $labelTotalProdutos.Location = New-Object System.Drawing.Point(600, 160)
    $labelTotalProdutos.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $labelTotalProdutos.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
    $produtosPanel.Controls.Add($labelTotalProdutos)

    $form.Controls.Add($produtosPanel)

    # Painel de parcelamento
    $parcelamentoPanel = New-Object System.Windows.Forms.GroupBox
    $parcelamentoPanel.Text = "💳 Condições de Pagamento"
    $parcelamentoPanel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $parcelamentoPanel.Size = New-Object System.Drawing.Size(850, 200)
    $parcelamentoPanel.Location = New-Object System.Drawing.Point(20, 410)
    $parcelamentoPanel.ForeColor = [System.Drawing.Color]::FromArgb(123, 44, 191)

    # Opção entrada
    $labelEntrada = New-Object System.Windows.Forms.Label
    $labelEntrada.Text = "Entrada:"
    $labelEntrada.Size = New-Object System.Drawing.Size(100, 20)
    $labelEntrada.Location = New-Object System.Drawing.Point(20, 35)
    $labelEntrada.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $parcelamentoPanel.Controls.Add($labelEntrada)

    $radioSemEntrada = New-Object System.Windows.Forms.RadioButton
    $radioSemEntrada.Text = "Sem Entrada"
    $radioSemEntrada.Size = New-Object System.Drawing.Size(100, 20)
    $radioSemEntrada.Location = New-Object System.Drawing.Point(120, 35)
    $radioSemEntrada.Checked = $true
    $radioSemEntrada.Add_CheckedChanged({ Update-Calculos })
    $parcelamentoPanel.Controls.Add($radioSemEntrada)

    $radioComEntrada = New-Object System.Windows.Forms.RadioButton
    $radioComEntrada.Text = "Com Entrada"
    $radioComEntrada.Size = New-Object System.Drawing.Size(100, 20)
    $radioComEntrada.Location = New-Object System.Drawing.Point(230, 35)
    $radioComEntrada.Add_CheckedChanged({ Update-Calculos })
    $parcelamentoPanel.Controls.Add($radioComEntrada)

    # Slider parcelas
    $labelParcelas = New-Object System.Windows.Forms.Label
    $labelParcelas.Text = "Parcelas: 1x"
    $labelParcelas.Size = New-Object System.Drawing.Size(100, 20)
    $labelParcelas.Location = New-Object System.Drawing.Point(20, 75)
    $labelParcelas.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $parcelamentoPanel.Controls.Add($labelParcelas)

    $sliderParcelas = New-Object System.Windows.Forms.TrackBar
    $sliderParcelas.Size = New-Object System.Drawing.Size(300, 45)
    $sliderParcelas.Location = New-Object System.Drawing.Point(120, 70)
    $sliderParcelas.Minimum = 1
    $sliderParcelas.Maximum = 36
    $sliderParcelas.Value = 1
    $sliderParcelas.TickFrequency = 5
    $sliderParcelas.Add_ValueChanged({
        $labelParcelas.Text = "Parcelas: $($sliderParcelas.Value)x"
        Update-Calculos
    })
    $parcelamentoPanel.Controls.Add($sliderParcelas)

    # Display valor parcela
    $labelValorParcela = New-Object System.Windows.Forms.Label
    $labelValorParcela.Text = "Valor da Parcela:"
    $labelValorParcela.Size = New-Object System.Drawing.Size(120, 20)
    $labelValorParcela.Location = New-Object System.Drawing.Point(450, 75)
    $labelValorParcela.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $parcelamentoPanel.Controls.Add($labelValorParcela)

    $displayParcela = New-Object System.Windows.Forms.Label
    $displayParcela.Text = "R$ 0,00"
    $displayParcela.Size = New-Object System.Drawing.Size(150, 30)
    $displayParcela.Location = New-Object System.Drawing.Point(580, 70)
    $displayParcela.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $displayParcela.ForeColor = [System.Drawing.Color]::FromArgb(46, 204, 113)
    $parcelamentoPanel.Controls.Add($displayParcela)

    # Botões de ação
    $btnCalcular = New-Object System.Windows.Forms.Button
    $btnCalcular.Text = "🧮 Calcular"
    $btnCalcular.Size = New-Object System.Drawing.Size(120, 40)
    $btnCalcular.Location = New-Object System.Drawing.Point(450, 120)
    $btnCalcular.BackColor = [System.Drawing.Color]::FromArgb(123, 44, 191)
    $btnCalcular.ForeColor = [System.Drawing.Color]::White
    $btnCalcular.FlatStyle = "Flat"
    $btnCalcular.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $btnCalcular.Add_Click({ Update-Calculos })
    $parcelamentoPanel.Controls.Add($btnCalcular)

    $btnWhatsApp = New-Object System.Windows.Forms.Button
    $btnWhatsApp.Text = "💚 WhatsApp"
    $btnWhatsApp.Size = New-Object System.Drawing.Size(120, 40)
    $btnWhatsApp.Location = New-Object System.Drawing.Point(580, 120)
    $btnWhatsApp.BackColor = [System.Drawing.Color]::FromArgb(37, 211, 102)
    $btnWhatsApp.ForeColor = [System.Drawing.Color]::White
    $btnWhatsApp.FlatStyle = "Flat"
    $btnWhatsApp.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $btnWhatsApp.Add_Click({ Send-WhatsApp })
    $parcelamentoPanel.Controls.Add($btnWhatsApp)

    $form.Controls.Add($parcelamentoPanel)

    # Funções auxiliares
    function Add-ProdutoRow {
        param($YPosition)
        
        if ($global:ProdutosControls.Count -ge 15) {
            [System.Windows.Forms.MessageBox]::Show("Máximo de 15 produtos atingido!", "Aviso", "OK", "Warning")
            return
        }
        
        $index = $global:ProdutosControls.Count
        
        # Nome do produto
        $textProduto = New-Object System.Windows.Forms.TextBox
        $textProduto.Size = New-Object System.Drawing.Size(200, 20)
        $textProduto.Location = New-Object System.Drawing.Point(20, $YPosition)
        $textProduto.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $textProduto.Tag = $index
        $textProduto.Add_TextChanged({ Update-TotalProdutos })
        $produtosPanel.Controls.Add($textProduto)
        
        # Valor unitário
        $textValor = New-Object System.Windows.Forms.TextBox
        $textValor.Size = New-Object System.Drawing.Size(100, 20)
        $textValor.Location = New-Object System.Drawing.Point(230, $YPosition)
        $textValor.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $textValor.Tag = $index
        $textValor.Add_TextChanged({ 
            # Formatação monetária
            $currentText = $textValor.Text -replace '[^\d,]'
            if ($currentText -match '^(\d+),?(\d{0,2})$') {
                $valor = [double]$matches[1]
                if ($matches[2]) { $valor += [double]$matches[2] / 100 }
                $textValor.Text = "R$ $($valor.ToString('N2'))"
                $textValor.SelectionStart = $textValor.Text.Length
            }
            Update-TotalProdutos 
        })
        $produtosPanel.Controls.Add($textValor)
        
        # Quantidade
        $numericQtd = New-Object System.Windows.Forms.NumericUpDown
        $numericQtd.Size = New-Object System.Drawing.Size(50, 20)
        $numericQtd.Location = New-Object System.Drawing.Point(340, $YPosition)
        $numericQtd.Minimum = 1
        $numericQtd.Maximum = 999
        $numericQtd.Value = 1
        $numericQtd.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $numericQtd.Tag = $index
        $numericQtd.Add_ValueChanged({ Update-TotalProdutos })
        $produtosPanel.Controls.Add($numericQtd)
        
        # Total do produto
        $labelProdTotal = New-Object System.Windows.Forms.Label
        $labelProdTotal.Text = "R$ 0,00"
        $labelProdTotal.Size = New-Object System.Drawing.Size(100, 20)
        $labelProdTotal.Location = New-Object System.Drawing.Point(400, $YPosition)
        $labelProdTotal.Font = New-Object System.Drawing.Font("Segoe UI", 9)
        $labelProdTotal.Tag = $index
        $produtosPanel.Controls.Add($labelProdTotal)
        
        # Botão remover
        $btnRemover = New-Object System.Windows.Forms.Button
        $btnRemover.Text = "❌"
        $btnRemover.Size = New-Object System.Drawing.Size(30, 20)
        $btnRemover.Location = New-Object System.Drawing.Point(510, $YPosition)
        $btnRemover.Font = New-Object System.Drawing.Font("Segoe UI", 8)
        $btnRemover.Tag = $index
        $btnRemover.Add_Click({
            $indexToRemove = $this.Tag
            Remove-ProdutoRow -Index $indexToRemove
        })
        # Não mostrar botão remover se for o único produto
        if ($global:ProdutosControls.Count -gt 0) {
            $produtosPanel.Controls.Add($btnRemover)
        }
        
        $global:ProdutosControls += @{
            Nome = $textProduto
            Valor = $textValor
            Quantidade = $numericQtd
            Total = $labelProdTotal
            Remover = $btnRemover
        }
        
        Update-TotalProdutos
    }
    
    function Remove-ProdutoRow {
        param($Index)
        
        # Remove controles do painel
        $produtosPanel.Controls.Remove($global:ProdutosControls[$Index].Nome)
        $produtosPanel.Controls.Remove($global:ProdutosControls[$Index].Valor)
        $produtosPanel.Controls.Remove($global:ProdutosControls[$Index].Quantidade)
        $produtosPanel.Controls.Remove($global:ProdutosControls[$Index].Total)
        $produtosPanel.Controls.Remove($global:ProdutosControls[$Index].Remover)
        
        # Remove do array
        $global:ProdutosControls = $global:ProdutosControls | Where-Object { $_ -ne $global:ProdutosControls[$Index] }
        
        # Reorganiza posições e tags
        for ($i = 0; $i -lt $global:ProdutosControls.Count; $i++) {
            $yPos = 60 + ($i * 30)
            $global:ProdutosControls[$i].Nome.Location = New-Object System.Drawing.Point(20, $yPos)
            $global:ProdutosControls[$i].Valor.Location = New-Object System.Drawing.Point(230, $yPos)
            $global:ProdutosControls[$i].Quantidade.Location = New-Object System.Drawing.Point(340, $yPos)
            $global:ProdutosControls[$i].Total.Location = New-Object System.Drawing.Point(400, $yPos)
            $global:ProdutosControls[$i].Remover.Location = New-Object System.Drawing.Point(510, $yPos)
            $global:ProdutosControls[$i].Nome.Tag = $i
            $global:ProdutosControls[$i].Valor.Tag = $i
            $global:ProdutosControls[$i].Quantidade.Tag = $i
            $global:ProdutosControls[$i].Total.Tag = $i
            $global:ProdutosControls[$i].Remover.Tag = $i
        }
        
        Update-TotalProdutos
    }
    
    function Update-TotalProdutos {
        $total = 0.0
        
        foreach ($produto in $global:ProdutosControls) {
            $valorText = $produto.Valor.Text -replace '[^\d,]' -replace ',', '.'
            if ([double]::TryParse($valorText, [ref]$valor)) {
                $quantidade = [int]$produto.Quantidade.Value
                $produtoTotal = $valor * $quantidade
                $total += $produtoTotal
                $produto.Total.Text = Format-Currency -Value $produtoTotal
            }
        }
        
        $labelTotalProdutos.Text = "Total Produtos: $(Format-Currency -Value $total)"
        Update-Calculos
    }
    
    function Update-Calculos {
        $totalProdutos = 0.0
        
        foreach ($produto in $global:ProdutosControls) {
            $valorText = $produto.Valor.Text -replace '[^\d,]' -replace ',', '.'
            if ([double]::TryParse($valorText, [ref]$valor)) {
                $quantidade = [int]$produto.Quantidade.Value
                $totalProdutos += $valor * $quantidade
            }
        }
        
        if ($totalProdutos -gt 0) {
            $comEntrada = $radioComEntrada.Checked
            $parcelas = $sliderParcelas.Value
            
            $valorParcela = Calculate-Parcela -ValorTotal $totalProdutos -Entrada 0 -Parcelas $parcelas -ComEntrada $comEntrada
            $displayParcela.Text = Format-Currency -Value $valorParcela
        } else {
            $displayParcela.Text = "R$ 0,00"
        }
    }
    
    function Send-WhatsApp {
        # Validação básica
        if ([string]::IsNullOrWhiteSpace($textNome.Text)) {
            [System.Windows.Forms.MessageBox]::Show("Por favor, preencha o nome do cliente!", "Aviso", "OK", "Warning")
            return
        }
        
        if ($global:ProdutosControls.Count -eq 0) {
            [System.Windows.Forms.MessageBox]::Show("Adicione pelo menos um produto!", "Aviso", "OK", "Warning")
            return
        }
        
        # Construir mensagem
        $mensagem = "*📦 ORÇAMENTO - ENCOMENDA PALOTINA*%0A%0A"
        $mensagem += "*Cliente:* $($textNome.Text)%0A"
        $mensagem += "*CPF:* $($textCPF.Text)%0A%0A"
        $mensagem += "*PRODUTOS:*%0A"
        
        $totalProdutos = 0.0
        foreach ($produto in $global:ProdutosControls) {
            $nome = $produto.Nome.Text
            $valorText = $produto.Valor.Text -replace '[^\d,]' -replace ',', '.'
            if ([double]::TryParse($valorText, [ref]$valor)) {
                $quantidade = [int]$produto.Quantidade.Value
                $total = $valor * $quantidade
                $totalProdutos += $total
                $mensagem += "• $nome - $quantidade x $(Format-Currency -Value $valor) = $(Format-Currency -Value $total)%0A"
            }
        }
        
        $mensagem += "%0A*TOTAL: $(Format-Currency -Value $totalProdutos)*%0A"
        $mensagem += "*Parcelas:* $($sliderParcelas.Value)x%0A"
        $mensagem += "*Valor Parcela:* $($displayParcela.Text)%0A%0A"
        $mensagem += "_*Condições sujeitas à análise de crédito*_%0A"
        $mensagem += "📞 *Encomenda Palotina*%0A"
        $mensagem += "💚 https://wa.me/554498408460"
        
        $whatsappUrl = "https://wa.me/554498408460?text=$mensagem"
        Start-Process $whatsappUrl
    }

    $form.Add_Shown({$form.Activate(); Update-Calculos})
    $form.ShowDialog() | Out-Null
}

Write-Host "🚀 Iniciando Calculadora de Produtos Novos..." -ForegroundColor Cyan
Show-ProdutosNovosCalculator