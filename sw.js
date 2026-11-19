// Dépenses : service worker, réseau d'abord puis cache en secours
const CACHE='depenses-v1';
const CORE=['./','index.html','manifest.webmanifest','icon.png'];
const CACHED_HOSTS=['fonts.googleapis.com','fonts.gstatic.com','unpkg.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const same=url.origin===self.location.origin;
  if(!same&&!CACHED_HOSTS.includes(url.hostname))return; // API (taux, lieux, tuiles) : jamais en cache
  e.respondWith(fetch(req).then(res=>{
    if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
    return res;
  }).catch(()=>caches.match(req,{ignoreSearch:same}).then(r=>r||(req.mode==='navigate'?caches.match('index.html'):undefined))));
});
