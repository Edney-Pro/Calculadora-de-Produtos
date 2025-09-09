// Estado da aplicação
let appState = {
    currentStep: 1,
    client: {
        name: '',
        cpf: ''
    },
    products: [],
    selectedDate: null, // { date: Date object, day: number, daysUntil: number }
    entryOption: null, // 'none' or 'with'
    entryPercent: 0,
    selectedInstallment: null, // { count: number, value: number }
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

    const productValueInput = document.getElementById('productValue');
    productValueInput.addEventListener('input', function(e) {
        maskCurrency(e);
    });
    productValueInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addProduct();
        }
    });

    document.getElementById('entryPercent').addEventListener('input', validateStep4);

    generateDateOptions();
    showStep(1);

    // Initial product examples (se houver, manter aqui ou carregar via JSON/API)
    // Se você usa o script do index.html para popular, certifique-se que o initializeApp()
    // rode ANTES daquele trecho no HTML.

    // Apenas para testes, se não estiver vindo do index.html
    if (appState.products.length === 0) {
        appState.products.push(
            { id: Date.now() + 1, name: 'Mesa', value: 450.00 },
            { id: Date.now() + 2, name: 'Cadeira', value: 180.00 },
            { id: Date.now() + 3, name: 'Cozinha Compacta', value: 1800.00 },
            { id: Date.now() + 4, name: 'Máquina de Lavar', value: 2500.00 }
        );
        updateProductsList();
        validateStep2(); // Valida o step 2 após adicionar produtos iniciais
    }
}

// Validação de CPF
function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11 || /^(.)\1{10}$/.test(cpf)) {
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

// Máscara de Moeda
function maskCurrency(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    value = (parseInt(value) / 100).toFixed(2); // Divide por 100 e formata para 2 casas decimais
    value = value.replace('.', ','); // Troca ponto por vírgula para formato BR
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // Adiciona pontos para milhares
    e.target.value = value;
}


// Validações por step
function validateStep1() {
    const name = document.getElementById('clientName').value.trim();
    const cpfInput = document.getElementById('clientCpf');
    const cpf = cpfInput.value;
    const cleanCpf = cpf.replace(/[^\d]/g, ''); // CPF sem máscara
    const cpfError = document.getElementById('cpfError');

    let isCpfValid = true;

    if (cleanCpf.length > 0 && cleanCpf.length !== 11) {
        cpfError.textContent = 'CPF deve ter 11 dígitos.';
        cpfError.classList.add('show');
        isCpfValid = false;
    } else if (cleanCpf.length === 11 && !isValidCPF(cleanCpf)) {
        cpfError.textContent = 'CPF inválido.';
        cpfError.classList.add('show');
        isCpfValid = false;
    } else {
        cpfError.classList.remove('show');
    }

    const isFormValid = name.length >= 3 && cleanCpf.length === 11 && isCpfValid;
    document.getElementById('nextBtn1').disabled = !isFormValid;

    if (isFormValid) {
        appState.client.name = name;
        appState.client.cpf = cpf; // Armazena o CPF com máscara
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
        appState.entryPercent = 0; // Garante que o percentual seja 0
        generateInstallments(); // Regenera as parcelas para 'sem entrada'
    } else if (appState.entryOption === 'with') {
        const entryPercentInput = document.getElementById('entryPercent');
        const percent = parseInt(entryPercentInput.value);
        if (!isNaN(percent) && percent >= 1 && percent <= 56) {
            isValid = true;
            appState.entryPercent = percent;
            generateInstallments(); // Regenera as parcelas para 'com entrada'
        } else {
            // Se o valor estiver fora do range, desabilita
            document.getElementById('installmentsGrid').innerHTML = '<p class="instruction">Percentual de entrada inválido (1% a 56%).</p>';
        }
    }

    document.getElementById('nextBtn4').disabled = !isValid || appState.selectedInstallment === null;
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

    // Atualizar barra de progresso (opcional, mas bom para UX)
    document.querySelectorAll('.progress').forEach(el => el.textContent = `${step}/5`);

    // Executar ações específicas do step
    if (step === 3) {
        generateDateOptions();
        // Re-validar step 3 caso o usuário volte
        validateStep3();
    } else if (step === 4) {
        // Assegurar que as parcelas sejam geradas ou instrução seja mostrada
        if (appState.entryOption) {
            generateInstallments();
        } else {
            document.getElementById('installmentsGrid').innerHTML = '<p class="instruction">Selecione uma opção de entrada para ver as parcelas.</p>';
        }
        validateStep4(); // Re-validar step 4 caso o usuário volte
    } else if (step === 5) {
        updateSummary();
        // Garante que o botão de avançar para o step 5 só esteja ativo se uma parcela for selecionada
        document.getElementById('nextBtn4').disabled = appState.selectedInstallment === null;
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
            // Para o step 4, também precisamos garantir que uma parcela foi selecionada
            canProceed = validateStep4() && appState.selectedInstallment !== null;
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
    // Converter o valor de BRL para float
    const value = parseFloat(valueInput.value.replace('.', '').replace(',', '.'));

    if (!name || isNaN(value) || value <= 0) {
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
    const visorTotal = document.getElementById('visorTotal');

    if (appState.products.length === 0) {
        container.innerHTML = '<p class="no-products">Nenhum produto adicionado</p>';
        appState.totalValue = 0;
    } else {
        let html = '';
        appState.totalValue = 0;

        appState.products.forEach(product => {
            appState.totalValue += product.value;
            html += `
                <div class="product-item">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-value">R$ ${product.value.toFixed(2).replace(".", ",")}</div>
                    </div>
                    <button class="remove-btn" onclick="removeProduct(${product.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }
    visorTotal.textContent = `Total: R$ ${appState.totalValue.toFixed(2).replace(".", ",")}`;
}

// Sistema de datas
function generateDateOptions() {
    const container = document.getElementById('dateOptions');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora para comparação
    const availableDays = [5, 10, 15, 20, 25, 30];
    let html = '';

    // Clear previous options
    container.innerHTML = '';

    let generatedDates = [];
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // Generate dates for current and next months
    for (let i = 0; i < 2; i++) { // Current month and next month
        availableDays.forEach(day => {
            let date = new Date(currentYear, currentMonth + i, day);
            date.setHours(0, 0, 0, 0); // Zera a hora da data gerada também
            if (date > today) {
                generatedDates.push(date);
            }
        });
    }

    // Sort and filter to get up to 20 unique dates within 35 days
    generatedDates = generatedDates.sort((a, b) => a - b)
                                   .filter(date => {
                                       const diffTime = Math.abs(date.getTime() - today.getTime()); // Usar getTime para evitar problemas de timezone
                                       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                       return diffDays >= 1 && diffDays <= 35; // A data deve ser no mínimo amanhã
                                   })
                                   .slice(0, 20); // Take only the first 20

    if (generatedDates.length === 0) {
        container.innerHTML = '<p class="instruction">Nenhuma data disponível nos próximos 35 dias.</p>';
    } else {
        generatedDates.forEach(date => {
            const diffTime = Math.abs(date.getTime() - today.getTime());
            const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            let className = 'date-option';
            let daysClass = '';

            if (daysUntil <= 7) {
                daysClass = 'danger'; // Vermelho: 1-7 dias
            } else if (daysUntil <= 15) {
                daysClass = 'warning'; // Laranja: 8-15 dias
            } else if (daysUntil <= 21) {
                daysClass = 'info'; // Amarelo: 16-21 dias
            } else { // daysUntil <= 35
                daysClass = 'success'; // Verde: 22-35 dias
            }

            // Marca a opção selecionada se já existir
            const isSelected = appState.selectedDate && appState.selectedDate.date.toISOString() === date.toISOString();
            if (isSelected) className += ' selected';

            html += `
                <div class="${className}" onclick="selectDate(event, '${date.toISOString()}', ${date.getDate()}, ${daysUntil})">
                    <div>Dia ${date.getDate()}</div>
                    <div style="font-size: 12px; color: #666;">
                        ${date.toLocaleDateString('pt-BR')}
                    </div>
                    <div style="font-size: 10px; color: #999;">
                        ${daysUntil} dias
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Atualiza a exibição da data selecionada se já houver uma
        if (appState.selectedDate) {
            updateSelectedDateDisplay(appState.selectedDate.date.toISOString(), appState.selectedDate.daysUntil);
        }
    }
}


function selectDate(event, dateString, day, daysUntil) {
    // Remover seleção anterior
    document.querySelectorAll('.date-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Selecionar nova opção
    // event.target pode ser um span dentro do div, então find the closest .date-option
    event.target.closest('.date-option').classList.add('selected');

    appState.selectedDate = {
        date: new Date(dateString),
        day: day,
        daysUntil: daysUntil
    };

    updateSelectedDateDisplay(dateString, daysUntil);
    validateStep3();
}

function updateSelectedDateDisplay(dateString, daysUntil) {
    // Mostrar informações
    const dateInfo = document.getElementById('dateInfo');
    const selectedDateSpan = document.getElementById('selectedDate');
    const daysInfoSpan = document.getElementById('daysInfo');

    selectedDateSpan.textContent = new Date(dateString).toLocaleDateString('pt-BR');

    let daysClass = 'success';
    if (daysUntil <= 7) {
        daysClass = 'danger';
    } else if (daysUntil <= 15) {
        daysClass = 'warning';
    } else if (daysUntil <= 21) {
        daysClass = 'info'; // Usando a nova classe 'info'
    }

    daysInfoSpan.textContent = `${daysUntil} dias até a primeira cobrança`;
    daysInfoSpan.className = `days-info ${daysClass}`;

    dateInfo.style.display = 'block';
}


// Sistema de entrada
function selectEntryOption(option) {
    // Remover seleção anterior
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Selecionar nova opção
    // event.target pode ser um input ou label, encontrar o .option-card pai
    const targetCard = event.target.closest('.option-card');
    if (targetCard) {
        targetCard.classList.add('selected');
    }

    appState.entryOption = option;

    const entryPercentage = document.getElementById('entryPercentage');

    if (option === 'with') {
        entryPercentage.style.display = 'block';
        document.getElementById('entryPercent').focus();
    } else {
        entryPercentage.style.display = 'none';
        document.getElementById('entryPercent').value = ''; // Limpa o campo ao selecionar "sem entrada"
        appState.entryPercent = 0;
    }

    // Limpa a seleção de parcela anterior ao mudar a opção de entrada
    appState.selectedInstallment = null;
    document.getElementById('nextBtn4').disabled = true; // Desabilita o botão até uma nova parcela ser selecionada

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
        if (entryPercent >= 1 && entryPercent <= 10) entryRange = 1;
        else if (entryPercent >= 11 && entryPercent <= 20) entryRange = 11;
        else if (entryPercent >= 21 && entryPercent <= 30) entryRange = 21;
        else if (entryPercent >= 31 && entryPercent <= 40) entryRange = 31;
        else if (entryPercent >= 41 && entryPercent <= 50) entryRange = 41;
        else if (entryPercent >= 51 && entryPercent <= 56) entryRange = 51;
        else return 0; // Entrada fora do range definido, retorna 0% ou lida com erro

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
    // Multiplica por 2, arredonda para o inteiro mais próximo e divide por 2
    return Math.round(value * 2) / 2;
}

function calculateInstallment(principal, rate, installments) {
    if (installments === 0) return 0; // Handle 0 installments case
    if (principal <= 0) return 0; // Se não há valor a financiar

    // Se for 1 parcela, não aplica juros compostos
    if (installments === 1) {
        return roundToHalf(principal * (1 + rate)); // Aplica juros simples para 1 parcela
    }

    // Fórmula da Tabela Price (PMT)
    const monthlyRate = rate / 12; // A taxa é anual, precisamos da mensal
    if (monthlyRate === 0) { // Evita divisão por zero se a taxa for 0
        return roundToHalf(principal / installments);
    }
    const installmentValue = principal * (monthlyRate * Math.pow(1 + monthlyRate, installments)) /
                            (Math.pow(1 + monthlyRate, installments) - 1);

    return roundToHalf(installmentValue);
}

function generateInstallments() {
    const container = document.getElementById('installmentsGrid');
    container.innerHTML = ''; // Limpa as parcelas existentes

    // Se nenhuma opção de entrada foi selecionada, não gera as parcelas
    if (appState.entryOption === null) {
        container.innerHTML = '<p class="instruction">Selecione uma opção de entrada para ver as parcelas.</p>';
        document.getElementById('nextBtn4').disabled = true;
        return;
    }

    // Calcular valores
    appState.entryValue = appState.entryOption === 'with' ?
        (appState.totalValue * appState.entryPercent / 100) : 0;
    appState.financedValue = appState.totalValue - appState.entryValue;

    if (appState.financedValue <= 0 && appState.entryOption === 'with') {
        container.innerHTML = '<p class="instruction">O valor da entrada cobre ou excede o total dos produtos. Não há parcelas a serem financiadas.</p>';
        appState.selectedInstallment = null; // Reseta a seleção de parcela
        document.getElementById('nextBtn4').disabled = true;
        return;
    } else if (appState.financedValue <= 0 && appState.entryOption === 'none') {
         container.innerHTML = '<p class="instruction">Não há produtos ou o valor total é zero. Não há parcelas a serem financiadas.</p>';
        appState.selectedInstallment = null; // Reseta a seleção de parcela
        document.getElementById('nextBtn4').disabled = true;
        return;
    }

    let html = '';

    for (let i = 1; i <= 24; i++) {
        const rate = getInterestRate(i, appState.entryPercent);
        // O valor total financiado já inclui os juros se a taxa anual for aplicada ao principal
        // A função calculateInstallment já aplica os juros mensais.
        const installmentValue = calculateInstallment(appState.financedValue, rate, i);
        const totalPaidWithInstallments = installmentValue * i; // Soma simples das parcelas
        const totalFinal = appState.entryValue + totalPaidWithInstallments; // Total geral
        const totalJuros = totalFinal - appState.totalValue;

        // Se uma parcela já foi selecionada, adiciona a classe 'selected'
        const isSelected = appState.selectedInstallment && appState.selectedInstallment.count === i;
        const cardClass = isSelected ? 'installment-card selected' : 'installment-card';

        html += `
            <div class="${cardClass}" onclick="selectInstallment(${i}, ${installmentValue.toFixed(2)})">
                <div class="installment-number">${i}x</div>
                <div class="installment-value">R$ ${installmentValue.toFixed(2).replace(".", ",")}</div>
                <div style="font-size: 12px; color: #666;">Total c/ juros: R$ ${totalPaidWithInstallments.toFixed(2).replace(".", ",")}</div>
                <div style="font-size: 10px; color: #999;">Juros: R$ ${totalJuros.toFixed(2).replace(".", ",")}</div>
            </div>
        `;
    }

    container.innerHTML = html;
    // Re-validar o passo 4 após a geração das parcelas
    validateStep4();
}

function selectInstallment(count, value) {
    // Remover seleção anterior
    document.querySelectorAll('.installment-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Selecionar nova opção
    // event.target pode ser um span dentro do div, então find the closest .installment-card
    event.target.closest('.installment-card').classList.add('selected');

    appState.selectedInstallment = {
        count: count,
        value: value
    };

    // Habilita o botão "Avançar"
    document.getElementById('nextBtn4').disabled = false;
}

// Resumo
function updateSummary() {
    document.getElementById('summaryClientName').textContent = appState.client.name;
    document.getElementById('summaryClientCpf').textContent = appState.client.cpf;
    document.getElementById('summaryBudgetDate').textContent = new Date().toLocaleDateString('pt-BR');

    const summaryProductsList = document.getElementById('summaryProducts');
    summaryProductsList.innerHTML = '';
    appState.products.forEach(product => {
        const li = document.createElement('li');
        li.textContent = `${product.name}: R$ ${product.value.toFixed(2).replace(".", ",")}`;
        summaryProductsList.appendChild(li);
    });

    document.getElementById('summaryEntryType').textContent = appState.entryOption === 'none' ? 'Sem Entrada' : 'Com Entrada';
    document.getElementById('summaryEntryValue').textContent = `R$ ${appState.entryValue.toFixed(2).replace(".", ",")}`;

    if (appState.selectedInstallment) {
        const firstInstallmentDate = new Date(appState.selectedDate.date);
        document.getElementById('summaryFirstInstallmentDate').textContent = firstInstallmentDate.toLocaleDateString('pt-BR');

        const lastInstallmentDate = new Date(firstInstallmentDate);
        lastInstallmentDate.setMonth(lastInstallmentDate.getMonth() + appState.selectedInstallment.count - 1); // Subtrai 1 porque a primeira parcela já está incluída
        document.getElementById('summaryLastInstallmentDate').textContent = lastInstallmentDate.toLocaleDateString('pt-BR');

        document.getElementById('summaryInstallmentCount').textContent = appState.selectedInstallment.count;
        document.getElementById('summaryInstallmentValue').textContent = `R$ ${appState.selectedInstallment.value.toFixed(2).replace(".", ",")}`;
    } else {
        document.getElementById('summaryFirstInstallmentDate').textContent = 'N/A';
        document.getElementById('summaryLastInstallmentDate').textContent = 'N/A';
        document.getElementById('summaryInstallmentCount').textContent = 'N/A';
        document.getElementById('summaryInstallmentValue').textContent = 'N/A';
    }
}


// Ações finais
function resetCalculator() {
    // Reinicializa o estado da aplicação
    appState = {
        currentStep: 1,
        client: { name: '', cpf: '' },
        products: [],
        selectedDate: null,
        entryOption: null,
        entryPercent: 0,
        selectedInstallment: null,
        totalValue: 0,
        entryValue: 0,
        financedValue: 0
    };

    // Limpa campos do formulário
    document.getElementById('clientName').value = '';
    document.getElementById('clientCpf').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productValue').value = '';
    document.getElementById('entryPercent').value = '';

    // Limpa exibições e seleções
    document.getElementById('cpfError').classList
