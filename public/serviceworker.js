const CACHE_NAME = "todo-app-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/todo.png",
  "/icon.png",
  "/manifest.json",
  "/src/main.tsx",
  "/src/App.tsx",
  "/offline.html", // Ensure offline.html is cached
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // If not found in cache, try fetching from the network
      return fetch(event.request)
        .then((fetchResponse) => {
          // Check if the response is valid
          if (
            !fetchResponse ||
            fetchResponse.status !== 200 ||
            fetchResponse.type !== "basic"
          ) {
            return fetchResponse; // Return if the response is not valid
          }

          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache); // Cache the new resource
          });

          return fetchResponse; // Return the fetched resource
        })
        .catch(() => {
          // If network fetch fails, show offline.html
          return caches.match("/offline.html");
        });
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Delete old caches
          }
        }),
      );
    }),
  );
});
