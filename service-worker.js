/* eslint-disable no-restricted-globals */
// Service Worker pour PWA Offline-First
// Version: 1.0.0

const CACHE_VERSION = 'stockwise-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Fichiers à mettre en cache immédiatement lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/offline.html',
  '/logo192.png',
  '/logo512.png'
];

// Routes API à mettre en cache (cache-first strategy)
const API_CACHE_ROUTES = [
  '/api/v1/dashboard/summary',
  '/api/v1/products',
  '/api/v1/categories',
  '/api/v1/suppliers',
  '/api/v1/orders'
];

// Limite de taille des caches
const CACHE_LIMITS = {
  [DYNAMIC_CACHE]: 50,
  [API_CACHE]: 100,
  [IMAGE_CACHE]: 60
};

// ==================== INSTALLATION ====================
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting(); // Active immédiatement
      })
      .catch((error) => {
        console.error('[SW] Erreur installation:', error);
      })
  );
});

// ==================== ACTIVATION ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (cacheName.startsWith('stockwise-') && cacheName !== CACHE_VERSION) {
              console.log('[SW] Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation terminée');
        return self.clients.claim(); // Prend contrôle immédiatement
      })
  );
});

// ==================== FETCH ====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Stratégie selon le type de ressource
  if (url.pathname.startsWith('/api/')) {
    // API: Network-First avec fallback cache
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (isImageRequest(request)) {
    // Images: Cache-First avec fallback network
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (isStaticAsset(url.pathname)) {
    // Assets statiques: Cache-First
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    // Pages HTML: Network-First
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  }
});

// ==================== STRATÉGIE: NETWORK-FIRST ====================
async function networkFirstStrategy(request, cacheName) {
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request);
    
    // Mettre en cache si la réponse est valide
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Limiter la taille du cache
      limitCacheSize(cacheName, CACHE_LIMITS[cacheName]);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Réseau indisponible, utilisation du cache:', request.url);
    
    // Fallback sur le cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si pas de cache, retourner page offline pour les pages HTML
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Pour les API, retourner une réponse offline
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({
          success: false,
          offline: true,
          message: 'Vous êtes hors ligne. Les données seront synchronisées une fois en ligne.'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// ==================== STRATÉGIE: CACHE-FIRST ====================
async function cacheFirstStrategy(request, cacheName) {
  // Chercher dans le cache d'abord
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Si pas dans le cache, aller sur le réseau
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Limiter la taille du cache
      limitCacheSize(cacheName, CACHE_LIMITS[cacheName]);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Erreur réseau pour:', request.url);
    throw error;
  }
}

// ==================== HELPERS ====================
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(request.url);
}

function isStaticAsset(pathname) {
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(pathname);
}

async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Supprimer les plus anciennes entrées
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map(key => cache.delete(key)));
    console.log(`[SW] Cache ${cacheName} nettoyé: ${toDelete.length} entrées supprimées`);
  }
}

// ==================== BACKGROUND SYNC ====================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync déclenché:', event.tag);
  
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

async function syncPendingOperations() {
  console.log('[SW] Synchronisation des opérations en attente...');
  
  try {
    // Notifier tous les clients pour démarrer la sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_PENDING_OPERATIONS'
      });
    });
  } catch (error) {
    console.error('[SW] Erreur sync:', error);
    throw error; // Réessayer plus tard
  }
}

// ==================== PUSH NOTIFICATIONS ====================
self.addEventListener('push', (event) => {
  console.log('[SW] Notification push reçue');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'StockWise';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée');
  
  event.notification.close();
  
  // Ouvrir l'application
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// ==================== MESSAGES ====================
self.addEventListener('message', (event) => {
  console.log('[SW] Message reçu:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_API_DATA') {
    // Mettre des données en cache manuellement
    const { url, data } = event.data;
    cacheApiData(url, data);
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

async function cacheApiData(url, data) {
  const cache = await caches.open(API_CACHE);
  const response = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
  await cache.put(url, response);
  console.log('[SW] Données API mises en cache:', url);
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] Tous les caches supprimés');
}

// ==================== LOGGING ====================
console.log('[SW] Service Worker chargé - Version:', CACHE_VERSION);
