// --- Novas Funcionalidades ---

/**
 * Alterna entre o tema claro e escuro.
 */
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // Salva a preferência do usuário no localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Define o número de colunas para os grids de módulos.
 * @param {number} cols - O número de colunas (2, 3, 4, ou 5).
 */
function setGridColumns(cols) {
    // Aplica a configuração a todos os containers de grid
    const gridContainers = document.querySelectorAll('.grid-container');
    gridContainers.forEach(container => {
        container.dataset.columns = cols;
    });

    // Atualiza o estado visual do botão ativo
    const gridButtons = document.querySelectorAll('.grid-controls .btn-grid');
    gridButtons.forEach(button => button.classList.remove('active'));

    const activeButton = document.querySelector(`.grid-controls .btn-grid[onclick="setGridColumns(${cols})"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Salva a preferência no localStorage
    localStorage.setItem('gridColumns', cols);
}

/**
 * Carrega as preferências de tema e grid do usuário ao iniciar a página.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Carrega o tema salvo
    const savedTheme = localStorage.getItem('theme');
    // Se o tema salvo NÃO for 'light', aplique o modo escuro.
    // Isso faz com que 'dark' e a primeira visita (null) resultem em tema escuro.
    if (savedTheme !== 'light') { // <-- ÚNICA LINHA ALTERADA
        document.body.classList.add('dark-mode');
    }

    // Carrega o número de colunas salvo (padrão 4)
    const savedColumns = localStorage.getItem('gridColumns') || 4;
    setGridColumns(parseInt(savedColumns));
});

// --- Funções Originais (sem alteração) ---

function openModule(moduleId) {
    const modules = {
        // PRODUTOS
        'produtos-novos': 'PRODUTOS/produtos-novos.html',
        'produtos-usados': 'PRODUTOS/produtos-usados.html',

        // MOVEIS
        'moveis-com-montagem': 'MOVEIS/moveis-com-montagem.html',
        'moveis-sem-montagem': 'MOVEIS/moveis-sem-montagem.html',

        // EMPRESTIMOS
        'emprestimos-sem-garantia': 'EMPRESTIMOS/emprestimos_sem_garantia.html',
        'emprestimos-com-garantia': 'EMPRESTIMOS/emprestimos_com_garantia.html',
        'emprestimos-diario': 'EMPRESTIMOS/emprestimos_diario.html',

        // VEICULOS AUTOMOTORES
        'carros-usados': 'VEICULOS AUTOMOTORES/veiculos-carros-usados.html',
        'motos-usadas': 'VEICULOS AUTOMOTORES/veiculos-motos-usadas.html',
        'acessorios-veiculos': 'VEICULOS AUTOMOTORES/veiculos-acessorios.html',

        // VEICULOS ELETRICOS
        'bicicleta-eletrica-nova': 'VEICULOS ELETRICOS/eletricos-bicicletas-novas.html',
        'bicicleta-eletrica-usada': 'VEICULOS ELETRICOS/eletricos-bicicletas-usadas.html',
        'patinete-eletrico-novo': 'VEICULOS ELETRICOS/eletricos-patinetes-novo.html',
        'patinete-eletrico-usado': 'VEICULOS ELETRICOS/eletricos-patinetes-usado.html',
        'acessorios-eletricos': 'VEICULOS ELETRICOS/eletricos-acessorios.html',

        // RENEGOCIACAO
        'produtos-atrasados': 'RENEGOCIACAO/renegociacao-produtos-atrasados.html',
        'produtos-avencer': 'RENEGOCIACAO/renegociacao-produtos-avencer.html',
        'produtos-combinados': 'RENEGOCIACAO/renegociacao-produtos-combinados.html',
        'veiculos-atrasados': 'RENEGOCIACAO/renegociacao-veiculos-atrasados.html',
        'veiculos-avencer': 'RENEGOCIACAO/renegociacao-veiculos-avencer.html',
        'veiculos-combinados': 'RENEGOCIACAO/renegociacao-veiculos-combinados.html',
        'emprestimo-atrasado': 'RENEGOCIACAO/renegociacao-emprestimo-atrasado.html',
        'emprestimo-avencer': 'RENEGOCIACAO/renegociacao-emprestimo-vencer.html',
        'emprestimo-combinado': 'RENEGOCIACAO/renegociacao-emprestimo-combinado.html',
        'divida-total': 'RENEGOCIACAO/renegociacao-emprestimo-total.html',
        'parcelamento-100': 'RENEGOCIACAO/renegociacao-sem-entrada.html',

        // FERRAMENTAS
        'contagem-dinheiro': 'FERRAMENTAS/contagem-dinheiro.html',
        'calculadora-normal': 'FERRAMENTAS/calculadora-normal.html',
        'prolabore': 'FERRAMENTAS/prolabore.html',

        // FERRAMENTAS AVANÇADAS
        'antecipacao-parcelas': 'FERRAMENTAS_AVANCADAS/antecipacao-parcelas.html',
        'portabilidade-divida': 'FERRAMENTAS_AVANCADAS/portabilidade-divida.html',
        'capacidade-pagamento': 'FERRAMENTAS_AVANCADAS/capacidade-pagamento.html',
        'desvalorizacao-garantia': 'FERRAMENTAS_AVANCADAS/desvalorizacao-garantia.html',
        'troca-com-troco': 'FERRAMENTAS_AVANCADAS/troca-com-troco.html',
        'multa-atraso': 'FERRAMENTAS_AVANCADAS/multa-atraso.html',
        'upgrade-produto': 'FERRAMENTAS_AVANCADAS/upgrade-produto.html',
        'analise-comparativa': 'FERRAMENTAS_AVANCADAS/analise-comparativa.html'
    };

    if (modules[moduleId]) {
        window.location.href = modules[moduleId];
    } else {
        alert('🚧 Módulo em desenvolvimento!');
    }

}

function openCatalog() {
    window.location.href = 'CATALOGO/categorias.html';
}

function openSmartphones() {
    window.open('https://drive.google.com/drive/folders/1jxxnEERu7-7GfuncE7WjzMBr7nCSqMRj', '_blank');
}

function openSmartTV() {
    window.open('https://drive.google.com/drive/folders/1ZESu8IouTDy3eVrzUNx5n6KvDS7Ymosg?usp=drive_link', '_blank');
}

function openMoveis() {
    window.open('https://drive.google.com/drive/folders/1UHskb2lGqFPYuO1KEcz9h7AybUchxVV6', '_blank');
}

function refreshPage() {
    location.reload();
}

function showInfo() {
    alert('Sistema de Calculadora de Parcelas - Encomenda Palotina\n\nEste sistema oferece diversas ferramentas para cálculo de parcelamentos, empréstimos e renegociações.');
}

function contactWhatsApp() {
    const phone = '5544999999999'; // Substitua pelo número real
    const message = 'Olá! Preciso de suporte com o sistema de calculadora de parcelas.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}