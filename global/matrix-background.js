/* =======================================================
   MATRIX BACKGROUND SYSTEM - VERSÃO ASCENDENTE
   Autor: Dr. Lucas (versão ascendente global)
   ======================================================= */
(() => {
  const MatrixBackground = {
    canvas: null,
    ctx: null,
    animationFrame: null,
    config: {
      mode: 'dynamic',          // off | smooth | dynamic | realistic | minimal
      opacity: 0.25,            // transparência padrão (será sobrescrita pelo modo)
      color: '#00ff66',         // cor padrão (verde Matrix)
      fontSize: 16,             // tamanho base dos caracteres
      columns: [],
      streams: [],
    },

    /* ===========================
       Inicialização do Canvas
       =========================== */
    init() {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvas.id = 'matrix-bg';
      Object.assign(this.canvas.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: '0',
        opacity: this.config.opacity,
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease',
        background: '#000000'
      });
      document.body.prepend(this.canvas);

      window.addEventListener('resize', () => this.resize());
      
      this.loadSettings();
      this.applyMode(this.config.mode); // Aplica a configuração inicial de modo/opacidade
      this.applyThemeColor(); // Aplica a cor baseada no data-theme inicial
      this.resize();
      this.start();
    },

    /* ===========================
       Redimensionamento
       =========================== */
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      const streamCount = 25;
      
      // Se já existem streams, apenas recalcula a posição X para não perder a animação
      if (this.config.streams.length > 0) {
          this.config.streams.forEach(stream => {
              stream.x = Math.random() * this.canvas.width; // Reposiciona no eixo X
          });
      } else {
          // Cria streams do zero se estiver inicializando
          for (let i = 0; i < streamCount; i++) {
            this.config.streams.push({
              x: Math.random() * this.canvas.width,
              y: Math.random() * this.canvas.height,
              characters: this.generateCharacterList(20 + Math.floor(Math.random() * 10)),
              speed: 2 + Math.random() * 3,
              charIndex: 0
            });
          }
      }
    },

    /* ===========================
       Gerar lista de caracteres
       =========================== */
    generateCharacterList(length) {
      const chars = [];
      for (let i = 0; i < length; i++) {
        if (Math.random() > 0.5) {
          chars.push(String.fromCharCode(0x30 + Math.floor(Math.random() * 10))); // 0-9
        } else if (Math.random() > 0.3) {
          chars.push(String.fromCharCode(0x41 + Math.floor(Math.random() * 26))); // A-Z
        } else {
          chars.push(String.fromCharCode(0x20 + Math.floor(Math.random() * 15))); // !"#$%&'()*+,-./
        }
      }
      return chars;
    },

    /* ===========================
       Animação principal (SUBINDO)
       =========================== */
    draw() {
      const { ctx, canvas, config } = this;

      // Fundo preto com leve fade para criar rastro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = config.color;
      ctx.font = `bold ${config.fontSize}px 'Courier New', monospace`;

      // Desenhar cada stream de caracteres
      config.streams.forEach((stream) => {
        // Mover para CIMA (subindo)
        stream.y -= stream.speed;

        // Se saiu da tela por cima, reinicia embaixo
        if (stream.y < -stream.characters.length * config.fontSize) {
          stream.y = canvas.height + config.fontSize;
          stream.x = Math.random() * canvas.width;
        }

        // Desenhar todos os caracteres da stream
        stream.characters.forEach((char, charIndex) => {
          const y = stream.y + (charIndex * config.fontSize);
          
          if (y > -config.fontSize && y < canvas.height + config.fontSize) {
            const opacity = charIndex === 0 ? 1 : 0.3 + (charIndex / stream.characters.length) * 0.7;
            ctx.fillStyle = this.hexToRgba(config.color, opacity);
            ctx.fillText(char, stream.x, y);
          }
        });

        // Avançar para o próximo caractere (efeito de piscar)
        if (Math.random() > 0.95) {
          const firstChar = stream.characters.shift();
          stream.characters.push(firstChar);
        }
      });

      this.animationFrame = requestAnimationFrame(() => this.draw());
    },

    /* ===========================
       Converter hex para rgba
       =========================== */
    hexToRgba(hex, opacity) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },

    /* ===========================
       Aplicar modo visual
       =========================== */
    applyMode(mode) {
      const modes = {
          off: { speed: 0, opacity: 0 },
          smooth: { speed: 25, opacity: 0.15 },
          dynamic: { speed: 50, opacity: 0.25 },
          realistic: { speed: 80, opacity: 0.35 },
          minimal: { speed: 20, opacity: 0.1 }
      };

      const modeConfig = modes[mode] || modes.dynamic;
      this.config.speed = modeConfig.speed;
      this.canvas.style.opacity = modeConfig.opacity;
      
      if (mode === 'off' || modeConfig.speed === 0) {
        this.stop();
      } else if (!this.animationFrame) {
        this.start();
      }
      
      this.resize(); 
    },

    /* ===========================
       Início e parada
       =========================== */
    start() {
      if (this.config.speed === 0) return; // Não inicia se o modo for 'off'
      cancelAnimationFrame(this.animationFrame);
      this.applyThemeColor();
      this.resize();
      this.draw();
    },

    stop() {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    },

    enable() {
      this.canvas.style.display = 'block';
      this.applyMode(this.config.mode);
    },

    disable() {
      this.canvas.style.display = 'none';
      this.stop();
    },

    /* ===========================
       Ajustes via Configurações
       =========================== */
    setMode(mode) {
      this.config.mode = mode;
      localStorage.setItem('matrixMode', mode);
      this.applyMode(mode);
    },

    setOpacity(value) {
      this.config.opacity = parseFloat(value);
      // A opacidade visual é ajustada no applyMode/resize se o modo for ativado
      localStorage.setItem('matrixOpacity', value);
      // Força a atualização do canvas opacity apenas se estiver rodando (para modos fixos)
      if (this.canvas) this.canvas.style.opacity = this.config.opacity;
    },

    setColor(color) {
      this.config.color = color;
      localStorage.setItem('matrixColor', color);
    },
    
    // NOVO: Chama a lógica de cor do tema
    applyThemeColor() {
      const theme = document.body.getAttribute('data-theme');
      const themeColors = {
        light: '#008844', // Cor verde clara para tema claro
        dark: '#00ff66',  // Cor verde vibrante para tema escuro
        gold: '#cfa800',
        blue: '#3399ff',
        purple: '#bb55ff',
      };
      // Se o tema atual não for um dos salvos, usa a cor salva no localStorage
      const color = themeColors[theme] || this.config.color;
      this.config.color = color;
      localStorage.setItem('matrixColor', color); // Salva a cor baseada no tema
      this.ctx.fillStyle = color; // Atualiza a cor de desenho
    },


    /* ===========================
       Carregar configurações salvas
       =========================== */
    loadSettings() {
      const mode = localStorage.getItem('matrixMode') || 'dynamic';
      const opacity = localStorage.getItem('matrixOpacity') || '0.25';
      const color = localStorage.getItem('matrixColor'); // Não define padrão, deixa o applyThemeColor decidir

      this.config.mode = mode;
      this.config.opacity = parseFloat(opacity);
      
      if (color) {
          this.config.color = color;
      }

      this.applyMode(mode);
    },
  };

  window.MatrixBackground = MatrixBackground;

  // Inicialização automática após o carregamento da página
  window.addEventListener('DOMContentLoaded', () => {
    MatrixBackground.init();
  });
})();