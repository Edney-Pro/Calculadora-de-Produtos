/* ===== GERENCIADOR DE CONFIGURAÇÕES - MÓDULO DE CONFIGURAÇÃO ===== */
// Este SettingsManager gerencia a UI da página de configurações e interage com o ConfigManager global.

class SettingsManager {
    static init() {
        this.initTabs();
        this.addMatrixIcons(); // Garante ícones se não estiverem no HTML
        this.setupEventListeners(); // Configura todos os listeners para os inputs e botões
        this.loadSettingsToControls(); // Carrega configs do localStorage para os campos do formulário
        
        // Inicia o MatrixViewer para a pré-visualização na aba Matrix
        MatrixViewer.init();
        
        // As configurações globais (theme, font, matrix background) são aplicadas
        // pelo ConfigManager.applyAllSettings() que é chamado no DOMContentLoaded global no HTML.
    }

    /* ===== SISTEMA DE ABAS ===== */
    static initTabs() {
        const tabBtns = document.querySelectorAll('.tabs-nav .tab-btn');
        const tabPanes = document.querySelectorAll('.tab-content .tab-pane');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');

                // Se a aba do Matrix for ativada, reinicia/garante que o preview MatrixViewer esteja rodando
                if (tabId === 'matrix') {
                    MatrixViewer.resize(); // Garante que o canvas preview esteja com o tamanho certo
                    MatrixViewer.start();
                } else {
                    MatrixViewer.stop(); // Pausa o preview se sair da aba
                }
            });
        });
        
        // Ativar a primeira aba ao carregar, se nenhuma estiver ativa
        if (!document.querySelector('.tabs-nav .tab-btn.active')) {
            const firstTab = tabBtns[0];
            if (firstTab) firstTab.click();
        }
    }

    /* ===== ADICIONAR ÍCONES NA ABA MATRIX (Se não estiverem no HTML) ===== */
    static addMatrixIcons() {
        const matrixTitle = document.querySelector('#matrix .card h2');
        if (matrixTitle && !matrixTitle.querySelector('.fa-matrix')) {
            matrixTitle.innerHTML = '<i class="fas fa-matrix"></i> Efeito Matrix';
        }

        const advancedTitle = document.querySelector('#matrix .advanced-settings h3');
        if (advancedTitle && !advancedTitle.querySelector('.fa-sliders-h')) {
            advancedTitle.innerHTML = '<i class="fas fa-sliders-h"></i> Configurações Avançadas';
        }
    }

    /* ===== SETUP LISTENERS PARA CONTROLES DO FORMULÁRIO ===== */
    static setupEventListeners() {
        // Aparência
        document.getElementById('theme')?.addEventListener('change', (e) => this.setTheme(e.target.value));
        document.getElementById('font')?.addEventListener('change', (e) => this.setFont(e.target.value));
        document.getElementById('fontWeight')?.addEventListener('change', (e) => this.setFontWeight(e.target.value));

        // Matrix
        document.getElementById('matrixMode')?.addEventListener('change', (e) => this.setMatrixMode(e.target.value));
        document.getElementById('matrixOpacity')?.addEventListener('input', (e) => this.setMatrixOpacity(e.target.value));
        document.getElementById('matrixColor')?.addEventListener('change', (e) => this.setMatrixColor(e.target.value));
        document.getElementById('matrixSpeed')?.addEventListener('input', (e) => this.setMatrixSpeed(e.target.value));
        document.getElementById('matrixStreams')?.addEventListener('input', (e) => this.setMatrixStreams(e.target.value));
        document.getElementById('matrixDirection')?.addEventListener('change', (e) => this.setMatrixDirection(e.target.value));

        // Ícones
        document.getElementById('iconStyle')?.addEventListener('change', (e) => this.setIconStyle(e.target.value));
        document.getElementById('animationSpeed')?.addEventListener('change', (e) => this.setAnimationSpeed(e.target.value));
        
        // Admin
        document.querySelector('.toggle-password')?.addEventListener('click', this.togglePassword);
        document.querySelector('.btn-admin')?.addEventListener('click', this.checkPIMPassword);
        document.querySelector('.btn-danger')?.addEventListener('click', this.resetToDefaults);
        document.getElementById('exportSettingsBtn')?.addEventListener('click', this.exportSettings); // Usando ID
        document.getElementById('importSettingsBtn')?.addEventListener('click', this.importSettings); // Usando ID
        document.querySelector('.fab-btn')?.addEventListener('click', this.saveSettings);

        // Resize observer para o MatrixViewer
        const matrixViewerContainer = document.getElementById('matrixViewer');
        if (matrixViewerContainer) {
            const resizeObserver = new ResizeObserver(() => MatrixViewer.resize());
            resizeObserver.observe(matrixViewerContainer);
        }
    }

    // --- FUNÇÕES DE CHAMADA AO GLOBAL (ConfigManager e MatrixBackground) ---
    
    static setTheme(theme) {
        if (window.ConfigManager) {
            ConfigManager.setTheme(theme);
        }
    }

    static setFont(font) {
        if (window.ConfigManager) {
            ConfigManager.setFont(font);
            this.showFontDemo();
        }
    }

    static setFontWeight(weight) {
        if (window.ConfigManager) {
            ConfigManager.setFontWeight(weight);
            this.showWeightDemo();
        }
    }

    static setMatrixMode(mode) {
        if (window.ConfigManager) {
            ConfigManager.setMatrixMode(mode);
            if (window.MatrixBackground) window.MatrixBackground.setMode(mode); // Atualiza global
            MatrixViewer.applyMode(mode); // Atualiza preview
        }
    }

    static setMatrixOpacity(value) {
        if (window.ConfigManager) {
            ConfigManager.setMatrixOpacity(parseFloat(value));
            document.getElementById('opacityValue').textContent = Math.round(parseFloat(value) * 100) + '%';
            if (window.MatrixBackground) window.MatrixBackground.setOpacity(parseFloat(value)); // Atualiza global
            MatrixViewer.config.opacity = parseFloat(value); // Atualiza preview
        }
    }

    static setMatrixColor(color) {
        if (window.ConfigManager) {
            ConfigManager.setMatrixColor(color);
            if (window.MatrixBackground) window.MatrixBackground.setColor(color); // Atualiza global
            MatrixViewer.config.color = color; // Atualiza preview
        }
    }

    static setMatrixSpeed(value) {
        if (window.ConfigManager) {
            ConfigManager.setMatrixSpeed(parseInt(value));
            document.getElementById('speedValue').textContent = value;
            if (window.MatrixBackground) window.MatrixBackground.config.speed = parseInt(value) * 10; // Ajusta para escala do Global BG
            MatrixViewer.config.speed = parseInt(value); // Atualiza preview
        }
    }

    static setMatrixStreams(value) {
        if (window.ConfigManager) {
            ConfigManager.setMatrixStreams(parseInt(value));
            document.getElementById('streamsValue').textContent = value;
            if (window.MatrixBackground) window.MatrixBackground.config.streams = parseInt(value); // Atualiza global
            MatrixViewer.config.streams = parseInt(value); // Atualiza preview
            MatrixViewer.createStreams(); // Recria streams para o preview
        }
    }

    static setMatrixDirection(value) {
        if (window.ConfigManager) {
            ConfigManager.setMatrixDirection(value);
            if (window.MatrixBackground) window.MatrixBackground.config.direction = value; // Atualiza global
            MatrixViewer.config.direction = value; // Atualiza preview
            MatrixViewer.createStreams(); // Recria streams para o preview
        }
    }

    static setIconStyle(style) {
        if (window.ConfigManager) {
            ConfigManager.setIconStyle(style);
        }
    }

    static setAnimationSpeed(speed) {
        if (window.ConfigManager) {
            ConfigManager.setAnimationSpeed(speed);
        }
    }
    
    // --- FUNÇÕES ADMIN (Chamando o Global) ---

    static togglePassword() {
        const passwordInput = document.getElementById('adminPassword');
        const toggleIcon = document.querySelector('.toggle-password i');
        
        if (passwordInput && toggleIcon) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                toggleIcon.className = 'fas fa-eye';
            }
        }
    }

    static checkPIMPassword() {
        const passwordInput = document.getElementById('adminPassword');
        if (!passwordInput) return;

        const password = passwordInput.value;
        const validPasswords = ['1234', 'PIM2024', 'admin', 'matrix']; // Exemplo de senhas
        
        if (validPasswords.includes(password)) {
            alert('✅ Acesso PIM liberado! Configurações de taxas disponíveis.');
        } else {
            alert('❌ Senha incorreta! Tente: 1234, PIM2024, admin ou matrix');
        }
    }

    static resetToDefaults() {
        if (confirm('⚠️ Tem certeza que deseja restaurar TODAS as configurações para os valores padrão?')) {
            if (window.ConfigManager) {
                ConfigManager.resetToDefaults(); // Chama o reset global
                setTimeout(() => location.reload(), 500); // Recarrega a página para aplicar
            }
        }
    }

    static exportSettings() {
        if (window.ConfigManager) {
            ConfigManager.exportConfig();
        }
    }

    static importSettings() {
        alert('📁 Funcionalidade de importação em desenvolvimento...');
    }

    static saveSettings() {
        // Efeito visual de confirmação
        const fabBtn = document.querySelector('.fab-btn');
        if (!fabBtn) return;

        const originalHTML = fabBtn.innerHTML;
        const originalBg = fabBtn.style.background;
        const originalColor = fabBtn.style.color;
        
        fabBtn.innerHTML = '<i class="fas fa-check"></i><span>Salvo!</span>';
        fabBtn.style.background = '#10b981'; // Cor de sucesso
        fabBtn.style.color = '#fff';

        if (window.ConfigManager) {
            ConfigManager.saveConfig(); // Chama o salvamento do global
        }
        
        setTimeout(() => {
            fabBtn.innerHTML = originalHTML;
            fabBtn.style.background = originalBg;
            fabBtn.style.color = originalColor;
        }, 2000);
    }

    // --- Funções de Demonstração/Carregamento nos controles ---

    static showFontDemo() {
        let demo = document.getElementById('fontDemo');
        if (!demo) {
            const fontSelect = document.getElementById('font');
            if (!fontSelect) return;
            demo = document.createElement('div');
            demo.id = 'fontDemo';
            demo.className = 'font-demo';
            fontSelect.parentNode.insertBefore(demo, fontSelect.nextSibling); // Insere após o select
        }
        const font = document.getElementById('font')?.value;
        if (font) {
            demo.textContent = `Exemplo: Sistema de Parcelas (${font})`;
            demo.style.fontFamily = font;
        }
    }

    static showWeightDemo() {
        let demo = document.getElementById('weightDemo');
        if (!demo) {
            const weightSelect = document.getElementById('fontWeight');
            if (!weightSelect) return;
            demo = document.createElement('div');
            demo.id = 'weightDemo';
            demo.className = 'weight-demo';
            weightSelect.parentNode.insertBefore(demo, weightSelect.nextSibling); // Insere após o select
        }
        const weight = document.getElementById('fontWeight')?.value;
        if (weight) {
            const weightNames = {
                '300': 'Leve', '400': 'Regular', '500': 'Médio', '600': 'Semi-negrito', '700': 'Negrito'
            };
            demo.textContent = `Texto com peso ${weightNames[weight] || weight}`;
            demo.style.fontWeight = weight;
        }
    }
    
    // Carrega os valores salvos para os elementos do formulário (SELECT, INPUT)
    static loadSettingsToControls() {
        // Obtenha as configurações do ConfigManager global, que já carrega do localStorage
        const currentConfig = window.ConfigManager ? ConfigManager.getSettings() : {};

        const controls = {
            theme: currentConfig.theme || 'dark',
            font: currentConfig.font || 'Inter',
            fontWeight: currentConfig.fontWeight || '400',
            matrixMode: currentConfig.matrixMode || 'dynamic',
            matrixOpacity: currentConfig.matrixOpacity !== undefined ? currentConfig.matrixOpacity.toString() : '0.25',
            matrixColor: currentConfig.matrixColor || '#00ff66',
            matrixSpeed: currentConfig.matrixSpeed !== undefined ? currentConfig.matrixSpeed.toString() : '5',
            matrixStreams: currentConfig.matrixStreams !== undefined ? currentConfig.matrixStreams.toString() : '8',
            matrixDirection: currentConfig.matrixDirection || 'down', // Default 'down' para o global
            iconStyle: currentConfig.iconStyle || 'classic',
            animationSpeed: currentConfig.animationSpeed || 'normal',
        };

        Object.keys(controls).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = controls[key];
            }
        });

        // Atualiza textos de range
        document.getElementById('opacityValue')?.textContent = Math.round(parseFloat(controls.matrixOpacity) * 100) + '%';
        document.getElementById('speedValue')?.textContent = controls.matrixSpeed;
        document.getElementById('streamsValue')?.textContent = controls.matrixStreams;
        
        // Inicia demonstrações
        this.showFontDemo();
        this.showWeightDemo();

        // Aplica as configurações ao MatrixViewer para o preview
        // Note: Se o elemento do canvas ainda não foi inicializado, isso pode ser um problema
        // A inicialização do MatrixViewer acontece logo após este método no SettingsManager.init()
        MatrixViewer.config = {
            speed: parseInt(controls.matrixSpeed),
            streams: parseInt(controls.matrixStreams),
            opacity: parseFloat(controls.matrixOpacity),
            color: controls.matrixColor,
            direction: controls.matrixDirection,
            mode: controls.matrixMode
        };
        // MatrixViewer.createStreams() e MatrixViewer.applyMode() serão chamados após init,
        // então o SettingsManager só precisa configurar o `config` dele.
    }
}

/* ===== VISOR DO MATRIX (PARA PREVIEW LOCAL NA PÁGINA DE CONFIGURAÇÕES) ===== */
// Este MatrixViewer é independente do MatrixBackground global.
// Ele é responsável apenas pela pré-visualização DENTRO da aba de configurações.
class MatrixViewer {
    static canvas = null;
    static ctx = null;
    static animationId = null;
    static isRunning = false;
    static streams = [];
    static config = {
        speed: 5,
        streams: 8,
        opacity: 0.25,
        color: '#00ff66',
        direction: 'down', // Default para o preview
        mode: 'dynamic'
    };
    static fontSize = 14;

    static init() {
        this.canvas = document.getElementById('matrixPreview');
        if (!this.canvas