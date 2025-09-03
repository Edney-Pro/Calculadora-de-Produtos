// Dados da aplicação
let appData = {
    productValue: 0,
    warrantyValue: 0,
    totalWithWarranty: 0,
    selectedInstallment: null,
    installmentOptions: []
};

// Taxa de garantia automática (5%)
const WARRANTY_RATE = 0.05;

// Taxa de juros mensal para cálculo das parcelas (3.99% ao mês)
const MONTHLY_INTEREST_RATE = 0.0399;

// Função principal que calcula tudo quando o valor do produto é alterado
function calculateAll() {
    const input = document.getElementById('productValue');
    const value = parseFloat(input.value) || 0;
    
    if (value <= 0) {
        hideAllSections();
        return;
    }
    
    // Atualiza os dados
    appData.productValue = value;
    appData.warrantyValue = value * WARRANTY_RATE;
    appData.totalWithWarranty = value + appData.warrantyValue;
    
    // Atualiza a interface
    updateSummarySection();
    calculateInstallments();
    showSections();
}

// Atualiza a seção de resumo
function updateSummarySection() {
    document.getElementById('productValueDisplay').textContent = appData.productValue.toFixed(2);
    document.getElementById('warrantyValueDisplay').textContent = appData.warrantyValue.toFixed(2);
    document.getElementById('totalWithWarrantyDisplay').textContent = appData.totalWithWarranty.toFixed(2);
}

// Calcula as opções de parcelamento
function calculateInstallments() {
    const container = document.getElementById('installmentOptionsContainer');
    container.innerHTML = '';
    appData.installmentOptions = [];
    
    const amount = appData.totalWithWarranty;
    
    // Gera opções de 1x até 36x
    for (let months = 1; months <= 36; months++) {
        let installmentValue;
        
        if (months === 1) {
            // À vista (sem juros)
            installmentValue = amount;
        } else {
            // Com juros compostos usando Tabela Price
            const i = MONTHLY_INTEREST_RATE;
            const n = months;
            installmentValue = amount * (i * Math.pow((1 + i), n)) / (Math.pow((1 + i), n) - 1);
        }
        
        const totalValue = installmentValue * months;
        
        const option = {
            months: months,
            installmentValue: installmentValue,
            totalValue: totalValue
        };
        
        appData.installmentOptions.push(option);
        
        // Cria o card da opção
        const card = document.createElement('div');
        card.classList.add('installment-option-card');
        card.innerHTML = `
            <div class="months">${months}x</div>
            <div class="value">R$ ${installmentValue.toFixed(2)}</div>
            <div class="total">Total: R$ ${totalValue.toFixed(2)}</div>
        `;
        
        card.onclick = () => selectInstallment(option, card);
        container.appendChild(card);
    }
}

// Seleciona uma opção de parcelamento
function selectInstallment(option, cardElement) {
    // Remove seleção anterior
    document.querySelectorAll('.installment-option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Seleciona a nova opção
    cardElement.classList.add('selected');
    appData.selectedInstallment = option;
    
    // Atualiza a seção de opção selecionada
    updateSelectedOption();
    showActionsSection();
}

// Atualiza a seção de opção selecionada
function updateSelectedOption() {
    const option = appData.selectedInstallment;
    document.getElementById('selectedInstallments').textContent = option.months;
    document.getElementById('selectedValue').textContent = option.installmentValue.toFixed(2);
    document.getElementById('selectedTotal').textContent = option.totalValue.toFixed(2);
}

// Mostra as seções conforme necessário
function showSections() {
    document.getElementById('summarySection').style.display = 'block';
    document.getElementById('installmentsSection').style.display = 'block';
}

// Mostra a seção de ações
function showActionsSection() {
    document.getElementById('selectedOption').style.display = 'block';
    document.getElementById('actionsSection').style.display = 'block';
}

// Esconde todas as seções
function hideAllSections() {
    document.getElementById('summarySection').style.display = 'none';
    document.getElementById('installmentsSection').style.display = 'none';
    document.getElementById('selectedOption').style.display = 'none';
    document.getElementById('actionsSection').style.display = 'none';
    appData.selectedInstallment = null;
}

// Gera a mensagem para WhatsApp
function generateWhatsApp() {
    if (!appData.selectedInstallment) {
        alert('Por favor, selecione uma opção de parcelamento primeiro.');
        return;
    }
    
    const option = appData.selectedInstallment;
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR');
    
    let message = `*SIMULAÇÃO DE FINANCIAMENTO*\n\n`;
    message += `📅 *Data:* ${dateStr}\n\n`;
    message += `💰 *Valor do Produto:* R$ ${appData.productValue.toFixed(2)}\n`;
    message += `🛡️ *Garantia Automática (5%):* R$ ${appData.warrantyValue.toFixed(2)}\n`;
    message += `💳 *Total com Garantia:* R$ ${appData.totalWithWarranty.toFixed(2)}\n\n`;
    message += `✅ *Opção Selecionada:*\n`;
    message += `${option.months}x de R$ ${option.installmentValue.toFixed(2)}\n`;
    message += `💵 *Valor Total:* R$ ${option.totalValue.toFixed(2)}\n\n`;
    
    if (option.months > 1) {
        const interest = option.totalValue - appData.totalWithWarranty;
        message += `📊 *Juros:* R$ ${interest.toFixed(2)}\n`;
        message += `📈 *Taxa:* ${MONTHLY_INTEREST_RATE * 100}% ao mês\n\n`;
    }
    
    message += `_Simulação gerada automaticamente_`;
    
    // Mostra o modal com a mensagem
    document.getElementById('whatsappMessage').value = message;
    document.getElementById('whatsappModal').style.display = 'flex';
}

// Envia a mensagem pelo WhatsApp
function sendWhatsApp() {
    const message = document.getElementById('whatsappMessage').value;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    closeModal();
}

// Copia a mensagem para a área de transferência
function copyMessage() {
    const textarea = document.getElementById('whatsappMessage');
    textarea.select();
    textarea.setSelectionRange(0, 99999); // Para dispositivos móveis
    
    try {
        document.execCommand('copy');
        alert('Mensagem copiada para a área de transferência!');
    } catch (err) {
        alert('Erro ao copiar a mensagem. Tente selecionar e copiar manualmente.');
    }
}

// Fecha o modal
function closeModal() {
    document.getElementById('whatsappModal').style.display = 'none';
}

// Limpa tudo e reinicia
function clearAll() {
    document.getElementById('productValue').value = '';
    appData = {
        productValue: 0,
        warrantyValue: 0,
        totalWithWarranty: 0,
        selectedInstallment: null,
        installmentOptions: []
    };
    hideAllSections();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Fecha o modal quando clica fora dele
    window.onclick = function(event) {
        const modal = document.getElementById('whatsappModal');
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Fecha o modal com a tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});

// Formatação de moeda no input (opcional)
function formatCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    value = (value / 100).toFixed(2);
    input.value = value;
    calculateAll();
}

