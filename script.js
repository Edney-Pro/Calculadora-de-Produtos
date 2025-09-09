// Estado da aplicação
let appState = {
    currentStep: 1,
    client: {
        name: '',
        cpf: ''
    },
    products: [],
    selectedDate: null,
    entryOption: null,
    entryPercent: 0,
    selectedInstallment: null,
    totalValue: 0,
    entryValue: 0,
    financedValue: 0
};

// Regras de juros
const interestRates = {
    noEntry: {
        1: 0.09,   // 1-6 parcelas: 9%
        7: 0.12,   // 7-12 parcelas: 12%
        13: 0.15,  // 13-18 parcelas: 15%
        19: 0.18,  // 19-21 parcelas: 18%
        22: 0.20   // 22-24 parcelas: 20%
    },
    withEntry: {
        1: {   // 1% a 10% de entrada
            1: 0.085,  // 1-6 parcelas: 8,5%
            7: 0.115,  // 7-12 parcelas: 11,5%
            13: 0.145, // 13-18 parcelas: 14,5%
            19: 0.175, // 19-21 parcelas: 17,5%
            22: 0.195  // 22-24 parcelas: 19,5%
        },
        11: {  // 11% a 20%
            1: 0.07,   // 1-6 parcelas: 7%
            7: 0.11,   // 7-12 parcelas: 11%
            13: 0.14,  // 13-18 parcelas: 14%
            19: 0.17,  // 19-21 parcelas: 17%
            22: 0.19   // 22-24 parcelas: 19%
        },
        21: {  // 21% a 30%
            1: 0.065,  // 1-6 parcelas: 6,5%
            7: 0.105,  // 7-12 parcelas: 10,5%
            13: 0.135, // 13-18 parcelas: 13,5%
            19: 0.165, // 19-21 parcelas: 16,5%
            22: 0.185  // 22-24 parcelas: 18,5%
        },
        31: {  // 31% a 40%
            1: 0.06,   // 1-6 parcelas: 6%
            7: 0.10,   // 7-12 parcelas: 10%
            13: 0.13,  // 13-18 parcelas: 13%
            19: 0.16,  // 19-21 parcelas: 16%
            22: 0.18   // 22-24 parcelas: 18%
        },
        41: {  // 41% a 50%
            1: 0.055,  // 1-6 parcelas: 5,5%
            7: 0.095,  // 7-12 parcelas: 9,5%
            13: 0.125, // 13-18 parcelas: 12,5%
            19: 0.155, // 19-21 parcelas: 15,5%
            22: 0.175  // 22-24 parcelas: 17,5%
        },
        51: {  // 51% a 56%
            1: 0.04,   // 1-6 parcelas: 4%
            7: 0.09,   // 7-12 parcelas: 9%
            13: 0.12,  // 13-18 parcelas: 12%
            19: 0.15,  // 19-21 parcelas: 15%
            22: 0.17   // 22-24 parcelas: 17%
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Event listeners para validação em tempo real
    document.getElementById('clientName').addEventListener('input', validateStep1);
    document.getElementById('clientCpf').addEventListener('input', function(e) {
        maskCPF(e);
        validateStep1();
    });
    
    document.getElementById('productName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addProduct();
        }
    });
    
    document.getElementById('productValue').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addProduct();
        }
    });
    
    document.getElementById('entryPercent').addEventListener('input', validateStep4);
    
    generateDateOptions();
    showStep(1);
}

// Validação de CPF
function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Máscara de CPF
function maskCPF(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
}

// Validações por step
function validateStep1() {
    const name = document.getElementById('clientName').value.trim();
    const cpf = document.getElementById('clientCpf').value;
    const cpfError = document.getElementById('cpfError');
    
    let isValid = true;
    
    if (cpf && !isValidCPF(cpf)) {
        cpfError.textContent = 'CPF inválido';
        cpfError.classList.add('show');
        isValid = false;
    } else {
        cpfError.classList.remove('show');
    }
    
    const isFormValid = name.length >= 3 && cpf.length === 14 && isValid;
    document.getElementById('nextBtn1').disabled = !isFormValid;
    
    if (isFormValid) {
        appState.client.name = name;
        appState.client.cpf = cpf;
    }
    
    return isFormValid;
}

function validateStep2() {
    const isValid = appState.products.length > 0;
    document.getElementById('nextBtn2').disabled = !isValid;
    return isValid;
}

function validateStep3() {
    const isValid = appState.selectedDate !== null;
    document.getElementById('nextBtn3').disabled = !isValid;
    return isValid;
}

function validateStep4() {
    let isValid = false;
    
    if (appState.entryOption === 'none') {
        isValid = true;
    } else if (appState.entryOption === 'with') {
        const percent = parseInt(document.getElementById('entryPercent').value);
        isValid = percent >= 1 && percent <= 56;
        if (isValid) {
            appState.entryPercent = percent;
        }
    }
    
    document.getElementById('nextBtn4').disabled = !isValid;
    return isValid;
}

// Navegação entre steps
function showStep(step) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar tela atual
    document.getElementById(`screen${step}`).classList.add('active');
    appState.currentStep = step;
    
    // Executar ações específicas do step
    if (step === 3) {
        generateDateOptions();
    } else if (step === 5) {
        generateInstallments();
    }
}

function nextStep(currentStep) {
    let canProceed = false;
    
    switch(currentStep) {
        case 1:
            canProceed = validateStep1();
            break;
        case 2:
            canProceed = validateStep2();
            break;
        case 3:
            canProceed = validateStep3();
            break;
        case 4:
            canProceed = validateStep4();
            break;
    }
    
    if (canProceed && currentStep < 5) {
        showStep(currentStep + 1);
    }
}

function prevStep(currentStep) {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

// Gerenciamento de produtos
function addProduct() {
    const nameInput = document.getElementById('productName');
    const valueInput = document.getElementById('productValue');
    
    const name = nameInput.value.trim();
    const value = parseFloat(valueInput.value);
    
    if (!name || !value || value <= 0) {
        alert('Por favor, preencha o nome e valor do produto corretamente.');
        return;
    }
    
    if (appState.products.length >= 10) {
        alert('Máximo de 10 produtos permitidos.');
        return;
    }
    
    const product = {
        id: Date.now(),
        name: name,
        value: value
    };
    
    appState.products.push(product);
    updateProductsList();
    
    // Limpar campos
    nameInput.value = '';
    valueInput.value = '';
    nameInput.focus();
    
    validateStep2();
}

function removeProduct(id) {
    appState.products = appState.products.filter(product => product.id !== id);
    updateProductsList();
    validateStep2();
}

function updateProductsList() {
    const container = document.getElementById('productsContainer');
    
    if (appState.products.length === 0) {
        container.innerHTML = '<p class="no-products">Nenhum produto adicionado</p>';
        appState.totalValue = 0;
        return;
    }
    
    let html = '';
    appState.totalValue = 0;
    
    appState.products.forEach(product => {
        appState.totalValue += product.value;
        html += `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-value">R$ ${product.value.toFixed(2)}</div>
                </div>
                <button class="remove-btn" onclick="removeProduct(${product.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Sistema de datas
function generateDateOptions() {
    const container = document.getElementById('dateOptions');
    const today = new Date();
    const availableDays = [5, 10, 15, 20, 25, 30];
    let html = '';
    
    availableDays.forEach(day => {
        // Calcular próxima data disponível para este dia
        const nextDate = getNextAvailableDate(day);
        const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
        
        let className = 'date-option';
        if (daysUntil > 35) {
            className += ' unavailable';
        }
        
        html += `
            <div class="${className}" onclick="selectDate('${nextDate.toISOString()}', ${day}, ${daysUntil})" 
                 ${daysUntil > 35 ? 'style="pointer-events: none;"' : ''}>
                <div>Dia ${day}</div>
                <div style="font-size: 12px; color: #666;">
                    ${nextDate.toLocaleDateString('pt-BR')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function getNextAvailableDate(day) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Tentar no mês atual
    let nextDate = new Date(currentYear, currentMonth, day);
    
    // Se a data já passou ou é hoje, ir para o próximo mês
    if (nextDate <= today) {
        nextDate = new Date(currentYear, currentMonth + 1, day);
    }
    
    return nextDate;
}

function selectDate(dateString, day, daysUntil) {
    // Remover seleção anterior
    document.querySelectorAll('.date-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Selecionar nova opção
    event.target.closest('.date-option').classList.add('selected');
    
    appState.selectedDate = {
        date: new Date(dateString),
        day: day,
        daysUntil: daysUntil
    };
    
    // Mostrar informações
    const dateInfo = document.getElementById('dateInfo');
    const selectedDateSpan = document.getElementById('selectedDate');
    const daysInfoSpan = document.getElementById('daysInfo');
    
    selectedDateSpan.textContent = new Date(dateString).toLocaleDateString('pt-BR');
    
    let daysClass = 'success';
    let daysText = `${daysUntil} dias até a primeira cobrança`;
    
    if (daysUntil <= 5) {
        daysClass = 'danger';
    } else if (daysUntil <= 15) {
        daysClass = 'warning';
    }
    
    daysInfoSpan.textContent = daysText;
    daysInfoSpan.className = `days-info ${daysClass}`;
    
    dateInfo.style.display = 'block';
    validateStep3();
}

// Sistema de entrada
function selectEntryOption(option) {
    // Remover seleção anterior
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Selecionar nova opção
    event.target.closest('.option-card').classList.add('selected');
    
    appState.entryOption = option;
    
    const entryPercentage = document.getElementById('entryPercentage');
    
    if (option === 'with') {
        entryPercentage.style.display = 'block';
        document.getElementById('entryPercent').focus();
    } else {
        entryPercentage.style.display = 'none';
        appState.entryPercent = 0;
    }
    
    validateStep4();
}

// Cálculo de parcelas
function getInterestRate(installments, entryPercent) {
    if (appState.entryOption === 'none') {
        if (installments <= 6) return interestRates.noEntry[1];
        if (installments <= 12) return interestRates.noEntry[7];
        if (installments <= 18) return interestRates.noEntry[13];
        if (installments <= 21) return interestRates.noEntry[19];
        return interestRates.noEntry[22];
    } else {
        let entryRange;
        if (entryPercent <= 10) entryRange = 1;
        else if (entryPercent <= 20) entryRange = 11;
        else if (entryPercent <= 30) entryRange = 21;
        else if (entryPercent <= 40) entryRange = 31;
        else if (entryPercent <= 50) entryRange = 41;
        else entryRange = 51;
        
        const rates = interestRates.withEntry[entryRange];
        
        if (installments <= 6) return rates[1];
        if (installments <= 12) return rates[7];
        if (installments <= 18) return rates[13];
        if (installments <= 21) return rates[19];
        return rates[22];
    }
}

function roundToHalf(value) {
    // Arredondar para terminar em ,00 ou ,50
    const integerPart = Math.floor(value);
    const decimalPart = value - integerPart;
    
    if (decimalPart <= 0.25) {
        return integerPart;
    } else if (decimalPart <= 0.75) {
        return integerPart + 0.5;
    } else {
        return integerPart + 1;
    }
}

function calculateInstallment(principal, rate, installments) {
    if (installments === 1) {
        return principal;
    }
    
    const monthlyRate = rate / 12;
    const installmentValue = principal * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
                            (Math.pow(1 + monthlyRate, installments) - 1);
    
    return roundToHalf(installmentValue);
}

function generateInstallments() {
    const container = document.getElementById('installmentsGrid');
    
    // Calcular valores
    appState.entryValue = appState.entryOption === 'with' ? 
        (appState.totalValue * appState.entryPercent / 100) : 0;
    appState.financedValue = appState.totalValue - appState.entryValue;
    
    let html = '';
    
    for (let i = 1; i <= 24; i++) {
        const rate = getInterestRate(i, appState.entryPercent);
        const installmentValue = calculateInstallment(appState.financedValue, rate, i);
        
        html += `
            <div class="installment-card" onclick="selectInstallment(${i}, ${installmentValue})">
                <div class="installment-number">${i}x</div>
                <div class="installment-value">R$ ${installmentValue.toFixed(2)}</div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function selectInstallment(installments, value) {
    // Remover seleção anterior
    document.querySelectorAll('.installment-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Selecionar nova opção
    event.target.closest('.installment-card').classList.add('selected');
    
    appState.selectedInstallment = {
        installments: installments,
        value: value
    };
    
    // Mostrar opção selecionada
    const selectedDiv = document.getElementById('selectedInstallment');
    const selectedText = document.getElementById('selectedInstallmentText');
    
    let text = `${installments}x de R$ ${value.toFixed(2)}`;
    if (appState.entryValue > 0) {
        text += ` + entrada de R$ ${appState.entryValue.toFixed(2)}`;
    }
    
    selectedText.textContent = text;
    selectedDiv.style.display = 'block';
    
    document.getElementById('finalizeBtn').disabled = false;
}

// Finalização
function finalizeSimulation() {
    if (!appState.selectedInstallment) {
        alert('Selecione uma opção de parcelamento');
        return;
    }
    
    // Gerar mensagem para WhatsApp
    let message = `*SIMULAÇÃO DE FINANCIAMENTO*\n\n`;
    message += `👤 *Cliente:* ${appState.client.name}\n`;
    message += `📄 *CPF:* ${appState.client.cpf}\n\n`;
    
    message += `📦 *Produtos:*\n`;
    appState.products.forEach(product => {
        message += `• ${product.name} - R$ ${product.value.toFixed(2)}\n`;
    });
    
    message += `\n💰 *Resumo:*\n`;
    if (appState.entryValue > 0) {
        message += `• Entrada: R$ ${appState.entryValue.toFixed(2)} (${appState.entryPercent}%)\n`;
        message += `• Valor financiado: R$ ${appState.financedValue.toFixed(2)}\n`;
    }
    message += `• Parcelamento: ${appState.selectedInstallment.installments}x de R$ ${appState.selectedInstallment.value.toFixed(2)}\n`;
    message += `• Data da primeira cobrança: ${appState.selectedDate.date.toLocaleDateString('pt-BR')}\n\n`;
    
    message += `⚠️ *Atenção:* devido à grande quantidade de pedidos, estamos pedindo um prazo de 10 a 30 dias para entrada do produto assim que confirmado o pedido.\n\n`;
    message += `_Simulação gerada automaticamente_`;
    
    // Abrir WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

