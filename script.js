// Registrar o Service Worker (para PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("✅ PWA ativo e pronto!"))
    .catch(err => console.error("Erro ao registrar Service Worker:", err));
}

// Pequeno feedback visual ao clicar
document.querySelectorAll('.app-item').forEach(btn => {
  btn.addEventListener('click', () => {
    if ('vibrate' in navigator) navigator.vibrate(20);
  });
});
