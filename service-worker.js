// sw.js - Service Worker PARA SEU SISTEMA REAL
const CACHE_NAME = 'sistema-financeiro-edney-v2.0';

// 🔥 ATENÇÃO: Precisamos mapear SEUS arquivos reais
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css', 
  '/script.js',
  
  // ⚠️ PRECISAMOS ADICIONAR SEUS MÓDULOS PRINCIPAIS
  // '/PRODUTOS/produtos-novos-com-entrada/index.html',
  // '/PRODUTOS/produtos-novos-sem-entrada/index.html',
  // ...e assim por diante
  
  // ⚠️ SEUS ÍCONES
  '/assets/icones/produtos.ico',
  '/assets/icones/veiculos.ico',
  // ...todos os ícones que você usa
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna do cache ou busca na rede
        return response || fetch(event.request);
      })
  );
});