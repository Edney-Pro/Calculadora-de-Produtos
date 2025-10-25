// Dados dos módulos do sistema
const modulesData = [
    {
        name: "Cadastro",
        description: "Clientes",
        icon: "fas fa-user-plus",
        link: "apps/CADASTRO/cadastro-de-cliente.html",
        color: "#3b82f6"
    },
    {
        name: "Produtos",
        description: "Novos/usados",
        icon: "fas fa-box-open",
        link: "apps/PRODUTOS/produtos.html",
        color: "#10b981"
    },
    {
        name: "Veículos",
        description: "Automotores",
        icon: "fas fa-car",
        link: "apps/VEICULOS AUTOMOTORES/veiculos-automotores.html",
        color: "#ef4444"
    },
    {
        name: "Elétricos",
        description: "Bicicletas",
        icon: "fas fa-bolt",
        link: "apps/VEICULOS ELETRICOS/veiculos-eletricos.html",
        color: "#f59e0b"
    },
    {
        name: "Móveis",
        description: "Com montagem",
        icon: "fas fa-couch",
        link: "apps/MOVEIS/moveis.html",
        color: "#8b5cf6"
    },
    {
        name: "Empréstimos",
        description: "Garantia",
        icon: "fas fa-hand-holding-usd",
        link: "apps/EMPRESTIMOS/emprestimos.html",
        color: "#06b6d4"
    },
    {
        name: "Renegociação",
        description: "Dívidas",
        icon: "fas fa-exchange-alt",
        link: "apps/RENEGOCIACAO/renegociacao.html",
        color: "#84cc16"
    },
    {
        name: "Ferramentas",
        description: "Cálculos",
        icon: "fas fa-tools",
        link: "apps/FERRAMENTAS/ferramentas.html",
        color: "#f97316"
    },
    {
        name: "Catálogo",
        description: "Produtos",
        icon: "fas fa-book",
        link: "apps/CATALOGO/catalogo.html",
        color: "#ec4899"
    },
    {
        name: "Compramos",
        description: "Para você",
        icon: "fas fa-shopping-cart",
        link: "apps/COMPRAMOS/compramos-pra-voce.html",
        color: "#14b8a6"
    },
    {
        name: "Ferramentas Av",
        description: "Análises",
        icon: "fas fa-chart-bar",
        link: "apps/FERRAMENTAS_AVANCADAS/ferramentas-avancadas.html",
        color: "#a855f7"
    }
];

// Toggle Theme
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupEventListeners();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    setupEventListeners() {
        const themeToggle = document.querySelector('.theme-toggle');
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }
}

// Renderizar módulos
function renderModules() {
    const modulesGrid = document.getElementById('modulesGrid');
    
    const modulesHTML = modulesData.map(module => `
        <a href="${module.link}" class="module-item" data-module="${module.name.toLowerCase()}">
            <div class="module-icon">
                <i class="${module.icon}" style="color: ${module.color}"></i>
            </div>
            <div class="module-content">
                <h3>${module.name}</h3>
                <p>${module.description}</p>
            </div>
        </a>
    `).join('');

    modulesGrid.innerHTML = modulesHTML;
    
    // Adicionar eventos de clique
    const moduleItems = document.querySelectorAll('.module-item');
    
    moduleItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Feedback visual
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 150);
        });

        item.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });

        item.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar módulos
    renderModules();
    
    // Inicializar gerenciador de temas
    const themeManager = new ThemeManager();

    console.log('Sistema de Parcelas inicializado!');
});

// Prevenir zoom em dispositivos móveis
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
