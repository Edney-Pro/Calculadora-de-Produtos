async function loadComponent(elementId, isHeader = false, title = "Meu Sistema", iconClass = "fas fa-globe-americas") {
    const element = document.getElementById(elementId);
    if (!element) return;

    let html = '';
    
    if (isHeader) {
        // Injetando o Header PREMIUM (com título e ícone dinâmicos)
        html = `
            <header class="premium-header">
                <div class="container">
                    <div class="header-content">
                        <div class="logo-container">
                            <i class="${iconClass} logo-icon"></i> <!-- ÍCONE DINÂMICO AQUI -->
                        </div>
                        <div class="brand-text">
                            <h1>${title}</h1>
                            <p class="tagline">Eficiência e controle financeiro</p>
                        </div>
                    </div>
                </div>
            </header>
        `;
        // Adiciona Font Awesome, caso ainda não esteja no index.html
        if (!document.querySelector('link[href*="fontawesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(link);
        }
    } else { // FOOTER (Injetando o Footer PREMIUM)
        // O footer não muda, mas mantemos o HTML dele aqui por completude
        html = `
            <nav class="premium-footer">
                <div class="container">
                    <div class="footer-nav">
                        <a href="../../index.html" class="nav-item">
                            <i class="fas fa-home nav-icon"></i>
                            <span class="nav-label">Home</span>
                        </a>
                        <a href="#" class="nav-item" onclick="window.open('https://wa.me/5544998408460','_blank')">
                            <i class="fab fa-whatsapp nav-icon"></i>
                            <span class="nav-label">WhatsApp</span>
                        </a>
                        <a href="#" class="nav-item" onclick="window.open('https://www.instagram.com/encomendapalotina','_blank')">
                            <i class="fab fa-instagram nav-icon"></i>
                            <span class="nav-label">Instagram</span>
                        </a>
                        <a href="../../apps/AJUDA/index.html" class="nav-item">
                            <i class="fas fa-question-circle nav-icon"></i>
                            <span class="nav-label">Ajuda</span>
                        </a>
                    </div>
                </div>
            </nav>
        `;
    }

    element.innerHTML = html;
}

function applyThemeToggleLogic() {
    // ... (Função de toggle do tema permanece a mesma)
    const toggleButton = document.getElementById('themeToggleButton');
    if (toggleButton) {
        toggleButton.onclick = () => {
            if (window.ConfigManager) {
                const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                window.ConfigManager.setTheme(currentTheme); 
                updateThemeIcon(currentTheme);
            }
        };
    }
}

function updateThemeIcon(theme) {
    // ... (Função de ícone do tema permanece a mesma)
    const thumb = document.querySelector('.toggle-thumb');
    const sun = document.querySelector('.toggle-icon.sun');
    const moon = document.querySelector('.toggle-icon.moon');
    
    if (thumb && sun && moon) {
        if (theme === 'light') {
            thumb.style.transform = 'translateX(30px)'; 
            sun.style.opacity = '1';
            moon.style.opacity = '0';
        } else {
            thumb.style.transform = 'translateX(0px)'; 
            sun.style.opacity = '0';
            moon.style.opacity = '1';
        }
    }
}

// MUDANÇA: Aceita o título E a classe do ícone
function loadGlobalHeaderFooter(title = "Meu Sistema", iconClass = "fas fa-globe-americas") {
    // Carrega Header e Footer
    loadComponent('global-header', true, title, iconClass); // Passa título e ícone
    loadComponent('global-footer', false);

    setTimeout(() => {
        applyThemeToggleLogic();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        updateThemeIcon(currentTheme);
    }, 100);
}