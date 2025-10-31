/* ===== CONFIG MANAGER - SISTEMA GLOBAL ===== */
class ConfigManager {
    static config = {
        theme: 'dark',
        font: 'Inter',
        fontWeight: '400',
        matrixMode: 'dynamic',
        matrixOpacity: 0.25,
        matrixColor: '#00ff66',
        matrixSpeed: 5,
        matrixStreams: 8,
        iconStyle: 'classic',
        animationSpeed: 'normal'
    };

    /* ===== INICIALIZAÇÃO ===== */
    static init() {
        this.loadConfig();
        this.applyAllSettings();
        this.setupEventListeners();
    }

    /* ===== CARREGAR CONFIGURAÇÕES ===== */
    static loadConfig() {
        const savedConfig = localStorage.getItem('systemConfig');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
        // Garante que o tema lido do localStorage seja aplicado ao <html>
        this.applyTheme(); 
    }

    /* ===== SALVAR CONFIGURAÇÕES ===== */
    static saveConfig() {
        localStorage.setItem('systemConfig', JSON.stringify(this.config));
    }

    /* ===== APLICAR TODAS AS CONFIGURAÇÕES ===== */
    static applyAllSettings() {
        this.applyTheme();
        this.applyFont();
        this.applyMatrixSettings();
        this.applyIconStyle();
        this.applyAnimationSpeed();
    }

    /* ===== CONFIGURAÇÕES DE TEMA ===== */
    static setTheme(theme) {
        this.config.theme = theme;
        this.applyTheme();
        this.saveConfig();
        
        // Chama o MatrixBackground para aplicar a nova cor baseada no tema
        if (window.MatrixBackground) window.MatrixBackground.applyThemeColor();
    }

    static applyTheme() {
        document.documentElement.setAttribute('data-theme', this.config.theme);
    }

    /* ===== CONFIGURAÇÕES DE FONTE ===== */
    static setFont(font) {
        this.config.font = font;
        this.applyFont();
        this.saveConfig();
    }

    static setFontWeight(weight) {
        this.config.fontWeight = weight;
        this.applyFont();
        this.saveConfig();
    }

    static applyFont() {
        document.documentElement.style.setProperty('--font-family', this.config.font);
        document.documentElement.style.setProperty('--font-weight', this.config.fontWeight);
    }

    /* ===== CONFIGURAÇÕES DO MATRIX ===== */
    static setMatrixMode(mode) {
        this.config.matrixMode = mode;
        this.applyMatrixSettings();
        this.saveConfig();
    }

    static setMatrixOpacity(opacity) {
        this.config.matrixOpacity = parseFloat(opacity);
        this.applyMatrixSettings();
        this.saveConfig();
    }

    static setMatrixColor(color) {
        this.config.matrixColor = color;
        this.applyMatrixSettings();
        this.saveConfig();
    }

    static setMatrixSpeed(speed) {
        this.config.matrixSpeed = parseInt(speed);
        this.applyMatrixSettings();
        this.saveConfig();
    }

    static setMatrixStreams(streams) {
        this.config.matrixStreams = parseInt(streams);
        this.applyMatrixSettings();
        this.saveConfig();
    }

    static applyMatrixSettings() {
        if (window.MatrixBackground) {
            MatrixBackground.setMode(this.config.matrixMode);
            MatrixBackground.setOpacity(this.config.matrixOpacity);
            MatrixBackground.setColor(this.config.matrixColor);
            
            // Os valores de Speed e Streams serão tratados dentro do MatrixBackground (ou você pode ajustar aqui se necessário)
            // Mantendo o que estava no seu código original para speed/streams
            MatrixBackground.config.speed = this.config.matrixSpeed * 10; // Exemplo: 5 -> 50
            MatrixBackground.config.streams = this.config.matrixStreams; // Exemplo: 8
        }
    }

    /* ===== CONFIGURAÇÕES DE ÍCONES ===== */
    static setIconStyle(style) {
        this.config.iconStyle = style;
        this.applyIconStyle();
        this.saveConfig();
    }

    static applyIconStyle() {
        const icons = document.querySelectorAll('i');
        const styles = {
            classic: { 
                filter: 'none', 
                transform: 'none',
                textShadow: 'none'
            },
            modern: { 
                filter: 'brightness(1.2) contrast(1.1)', 
                transform: 'scale(1.05)',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            },
            premium: { 
                filter: 'drop-shadow(0 2px 4px var(--primary))',
                transform: 'scale(1.1)',
                textShadow: '0 0 10px currentColor'
            },
            neon: {
                filter: 'drop-shadow(0 0 8px var(--primary)) brightness(1.3)',
                transform: 'scale(1.15)',
                textShadow: '0 0 10px currentColor, 0 0 20px currentColor'
            }
        };

        icons.forEach(icon => {
            Object.assign(icon.style, styles[this.config.iconStyle] || styles.classic);
        });
    }

    /* ===== VELOCIDADE DE ANIMAÇÃO ===== */
    static setAnimationSpeed(speed) {
        this.config.animationSpeed = speed;
        this.applyAnimationSpeed();
        this.saveConfig();
    }

    static applyAnimationSpeed() {
        const speeds = {
            slow: '0.5s',
            normal: '0.3s',
            fast: '0.15s'
        };
        document.documentElement.style.setProperty('--transition', `all ${speeds[this.config.animationSpeed]} ease`);
    }

    /* ===== EVENT LISTENERS ===== */
    static setupEventListeners() {
        // Detecta mudanças de tema do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Só aplica se o tema não foi explicitamente salvo no localStorage
            if (!localStorage.getItem('systemConfig')) {
                this.config.theme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
    }

    /* ===== EXPORTAR/IMPORTAR CONFIGURAÇÕES ===== */
    static exportConfig() {
        const dataStr = JSON.stringify(this.config, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'configuracoes-sistema.json';
        link.click();
    }

    static importConfig(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedConfig = JSON.parse(e.target.result);
                this.config = { ...this.config, ...importedConfig };
                this.applyAllSettings();
                this.saveConfig();
                alert('✅ Configurações importadas com sucesso!');
            } catch (error) {
                alert('❌ Erro ao importar configurações!');
            }
        };
        reader.readAsText(file);
    }

    /* ===== RESET PARA PADRÕES ===== */
    static resetToDefaults() {
        this.config = {
            theme: 'dark',
            font: 'Inter',
            fontWeight: '400',
            matrixMode: 'dynamic',
            matrixOpacity: 0.25,
            matrixColor: '#00ff66',
            matrixSpeed: 5,
            matrixStreams: 8,
            iconStyle: 'classic',
            animationSpeed: 'normal'
        };
        this.applyAllSettings();
        this.saveConfig();
    }

    /* ===== GETTERS ===== */
    static getConfig() {
        return { ...this.config };
    }

    static getTheme() {
        return this.config.theme;
    }

    static getMatrixSettings() {
        return {
            mode: this.config.matrixMode,
            opacity: this.config.matrixOpacity,
            color: this.config.matrixColor,
            speed: this.config.matrixSpeed,
            streams: this.config.matrixStreams
        };
    }
}

// Torna global
window.ConfigManager = ConfigManager;