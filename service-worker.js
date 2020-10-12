const preCacheName = "pre-cache-pra",
	// listado de archivos estáticos para añadir a la cache (css, scripts, imagenes,....)
    preCacheFiles = [
        "/",
        "/index.html",
        "css/jquery-ui.min.css",
        "css/estils.css",
        "favicon.ico",
        "imgs/cargando.gif",
        "imgs/logos/imago.png",
        "imgs/logos/logo1.png",  
        "imgs/logos/logo2.png",  
        "js/jquery-3.4.1.min.js",
        "js/jquery-ui.min.js",
        "js/popper.min.js",
        "js/bootstrap.min.js",
        "js/main.js"
    ];


self.addEventListener("install", event => {
    console.log("installing precached files");
    caches.open(preCacheName).then(function (cache) {
        return cache.addAll(preCacheFiles);
    });
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (!response) {
                //fall back to the network fetch
                return fetch(event.request);
            }
            return response;
        })
    )
});
