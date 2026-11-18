/* PAKTAW offline service worker */
const CACHE='paktaw-v3';
const CORE=['./','./index.html'];
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
const FONTS='https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&family=Vazirmatn:wght@400;500&display=swap';
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(CORE);
  for(const u of LIBS){try{const r=await fetch(u,{mode:'cors'});if(r.ok)await c.put(u,r)}catch(x){}}
  try{const r=await fetch(FONTS,{mode:'cors'});if(r.ok){const css=await r.clone().text();await c.put(FONTS,r);const urls=[...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]);for(const u of urls){try{const f=await fetch(u,{mode:'cors'});if(f.ok)await c.put(u,f)}catch(x){}}}}catch(x){}
  self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
function blobFromIDB(id){return new Promise(res=>{const r=indexedDB.open('paktaw-local',1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('docs'))d.createObjectStore('docs');if(!d.objectStoreNames.contains('blobs'))d.createObjectStore('blobs')};
  r.onsuccess=()=>{try{const g=r.result.transaction('blobs','readonly').objectStore('blobs').get(id);g.onsuccess=()=>res(g.result||null);g.onerror=()=>res(null)}catch(x){res(null)}};r.onerror=()=>res(null)})}
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
  if(u.origin===location.origin&&u.pathname.includes('/_blob/')){const id=u.pathname.split('/_blob/')[1];e.respondWith(blobFromIDB(id).then(b=>b?new Response(b,{headers:{'Content-Type':b.type||'image/jpeg'}}):new Response('',{status:404})));return}
  if(e.request.method!=='GET')return;
  // app shell: network first so updates arrive, cache when offline
  if(u.origin===location.origin){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));return}
  // libraries and fonts: cache first
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok||n.type==='opaque'){const cp=n.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return n})))});
