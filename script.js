// Sistema de Tema
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Verificar preferência salva ou definir padrão como escuro
const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Feedback tátil CORRIGIDO: Usa o translateY para manter a posição correta
    // Verifica o tamanho da tela para aplicar a transformação correta
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const activeTransform = isMobile ? 'scale(0.95)' : 'translateY(-50%) scale(0.95)';
    const releaseTransform = isMobile ? 'scale(1)' : 'translateY(-50%) scale(1)';
    
    themeToggle.style.transform = activeTransform;
    
    setTimeout(() => {
        themeToggle.style.transform = releaseTransform;
    }, 150);
});

// Smooth scroll para âncoras (Mantido)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Garantir que todos os botões tenham a mesma altura (Mantido)
function equalizeButtonHeights() {
    const buttons = document.querySelectorAll('.btn');
    let maxHeight = 0;
    
    // Reset heights
    buttons.forEach(btn => {
        btn.style.height = 'auto';
    });
    
    // Find max height
    buttons.forEach(btn => {
        const height = btn.offsetHeight;
        if (height > maxHeight) {
            maxHeight = height;
        }
    });
    
    // Apply max height
    buttons.forEach(btn => {
        btn.style.height = maxHeight + 'px';
    });
}

// Executar quando a página carregar e quando redimensionar
window.addEventListener('load', equalizeButtonHeights);
window.addEventListener('resize', equalizeButtonHeights);