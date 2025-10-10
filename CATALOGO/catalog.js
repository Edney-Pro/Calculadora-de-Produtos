/**
 * Alterna entre o tema claro e escuro.
 */
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Salva a preferência do usuário
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Define o número de colunas para o grid de categorias.
 * @param {number} cols - O número de colunas.
 */
function setGridColumns(cols) {
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
        gridContainer.dataset.columns = cols;
    }

    // Atualiza o botão ativo
    const gridButtons = document.querySelectorAll('.grid-controls .btn-grid');
    gridButtons.forEach(button => button.classList.remove('active'));
    
    const activeButton = document.querySelector(`.grid-controls .btn-grid[onclick="setGridColumns(${cols})"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    localStorage.setItem('catalogGridColumns', cols);
}

/**
 * Carrega as preferências do usuário ao iniciar a página.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Define o modo escuro como padrão
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== 'light') {
        document.body.classList.add('dark-mode');
    }

    // Carrega o layout de grid salvo (padrão 4 colunas)
    const savedColumns = localStorage.getItem('catalogGridColumns') || 4;
    setGridColumns(parseInt(savedColumns));
});


// --- Funções dos Botões do Rodapé ---

function goToCalculator() {
    window.location.href = 'index.html'; // Certifique-se que o nome do arquivo principal é 'index.html'
}

function contactWhatsApp() {
    window.open('https://wa.me/554498408460', '_blank'); // Substitua pelo seu número
}