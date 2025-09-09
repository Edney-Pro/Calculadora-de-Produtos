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

    // ************* ALTERAÇÃO AQUI *************
    // Removido o preenchimento inicial de produtos.
    // A lista de produtos agora começa vazia e o botão "Avançar" do Step 2 estará desabilitado.
    updateProductsList(); // Garante que a lista de produtos seja renderizada vazia
    validateStep2();      // Desabilita o botão "Avançar" do Step 2 se não houver produtos
    // *****************************************
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
    if (remainder !==
