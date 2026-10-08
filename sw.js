// Speichert die App-Dateien, damit sie auch offline (z. B. im Supermarkt ohne Netz) startet.
var CACHE = "einkaufsliste-v1";
var FILES = [
	"./",
	"index.html",
	"style.css",
	"script.js",
	"manifest.webmanifest",
	"icons/icon-180.png",
	"icons/icon-192.png",
	"icons/icon-512.png"
];

self.addEventListener("install", function (event) {
	event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(FILES); }));
	self.skipWaiting();
});

self.addEventListener("activate", function (event) {
	event.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(keys.filter(function (k) { return k !== CACHE; })
				.map(function (k) { return caches.delete(k); }));
		})
	);
	self.clients.claim();
});

// Netzwerk zuerst (für Updates), bei fehlendem Netz aus dem Cache
self.addEventListener("fetch", function (event) {
	if (event.request.method !== "GET") {
		return;
	}
	event.respondWith(
		fetch(event.request)
			.then(function (response) {
				var copy = response.clone();
				caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
				return response;
			})
			.catch(function () {
				return caches.match(event.request, { ignoreSearch: true });
			})
	);
});
