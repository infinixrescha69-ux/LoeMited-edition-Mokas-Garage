const CACHE_NAME = "mokas-garage-v43-pwa";
const CORE = ["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if(event.request.method!=="GET") return;
  event.respondWith((async()=>{
    const hit=await caches.match(event.request);
    if(hit) return hit;
    try {
      const res=await fetch(event.request);
      if(res.ok && new URL(event.request.url).origin===self.location.origin){
        const cache=await caches.open(CACHE_NAME); cache.put(event.request,res.clone());
      }
      return res;
    } catch(e) {
      if(event.request.mode==="navigate") return caches.match("./index.html");
      throw e;
    }
  })());
});
