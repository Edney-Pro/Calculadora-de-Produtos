// --- FUNÇÕES DA PÁGINA PRINCIPAL (INDEX.HTML) ---

/**
 * NOVO: Ao carregar a página, verifica o tema salvo no navegador
 * e aplica-o. O tema padrão é o escuro ('dark-theme').
 */
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
    // Não é necessário 'else', pois o 'dark-theme' já é o padrão no body.
});

/**
 * Abre o módulo da calculadora em uma nova página.
 * @param {string} url - O caminho para o index.html do módulo.
 */
function openModule(url) {
    window.location.href = url;
}

/**
 * Alterna a visibilidade do menu mobile.
 */
function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('hidden');
}

/**
 * Fecha o menu mobile.
 */
function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.add('hidden');
}

/**
 * CORRIGIDO: Alterna entre o tema claro e escuro e salva a preferência.
 */
function toggleTheme() {
    const body = document.body;
    const isLightTheme = body.classList.contains('light-theme');

    if (isLightTheme) {
        // Se está no tema claro, muda para o escuro
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark'); // Salva a preferência
    } else {
        // Se está no tema escuro, muda para o claro
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light'); // Salva a preferência
    }
}

/**
 * Define o número de colunas para os grids de módulos.
 * @param {number} cols - O número de colunas (1 ou 2).
 * @param {Event} event - O evento do clique para marcar o botão ativo.
 */
function setGridColumns(cols, event) {
    // Remove a classe 'active' de todos os botões de grid
    document.querySelectorAll('.btn-grid').forEach(btn => btn.classList.remove('active'));
    // Adiciona a classe 'active' ao botão clicado
    if (event) {
        event.currentTarget.classList.add('active');
    }

    // Aplica o número de colunas a todos os contêineres de grid
    document.querySelectorAll('.grid-container').forEach(container => {
        container.dataset.columns = cols;
    });
}

/**
 * Alterna a visibilidade da barra de busca.
 */
function toggleSearch() {
    document.getElementById('searchContainer').classList.toggle('hidden');
}

/**
 * Limpa o campo de busca e reexibe todos os módulos.
 */
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    filterModules();
}

/**
 * Filtra os módulos visíveis com base no texto da busca.
 */
function filterModules() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const modules = document.querySelectorAll('.module-card');
    const categories = document.querySelectorAll('.category-section');

    modules.forEach(module => {
        const moduleName = module.querySelector('.module-name').textContent.toLowerCase();
        const moduleDescription = module.querySelector('.module-description').textContent.toLowerCase();
        
        if (moduleName.includes(searchTerm) || moduleDescription.includes(searchTerm)) {
            module.style.display = '';
        } else {
            module.style.display = 'none';
        }
    });

    // Esconde a categoria se todos os seus módulos estiverem escondidos
    categories.forEach(category => {
        const visibleModules = category.querySelectorAll('.module-card:not([style*="display: none"])');
        if (visibleModules.length === 0) {
            category.style.display = 'none';
        } else {
            category.style.display = '';
        }
    });
}

/**
 * Rola a página suavemente até uma categoria específica.
 * @param {string} categoryId - O ID da seção da categoria.
 */
function scrollToCategory(categoryId) {
    const categoryElement = document.getElementById(categoryId);
    if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    closeMobileMenu(); // Fecha o menu após a seleção
}
