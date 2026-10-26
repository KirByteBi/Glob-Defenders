// Simula la carga de los scripts como en el navegador y detecta errores de
// ejecución (no solo de sintaxis). Stubs mínimos de DOM/navegador.
const fs = require('fs'), vm = require('vm');

const noop = () => {};
const elementStub = () => new Proxy({
  style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  addEventListener: noop, removeEventListener: noop, appendChild: noop, append: noop,
  replaceChildren: noop, remove: noop, querySelector: () => null, querySelectorAll: () => [],
  insertAdjacentHTML: noop, setAttribute: noop, getAttribute: () => null, replaceWith: noop,
  getBoundingClientRect: () => ({ left:0, top:0, width:0, height:0 }), focus: noop, click: noop,
  cloneNode: () => elementStub(), offsetWidth: 0, children: [], firstChild: null
}, { get(t,p){ return p in t ? t[p] : (typeof p==='string' ? (t[p]=undefined) : undefined); }, set(t,p,v){ t[p]=v; return true; } });

const ctx = {};
ctx.window = ctx;
ctx.self = ctx;
ctx.globalThis = ctx;
ctx.console = console;
ctx.setTimeout = noop; ctx.clearTimeout = noop; ctx.setInterval = () => 0; ctx.clearInterval = noop;
ctx.requestAnimationFrame = noop; ctx.cancelAnimationFrame = noop;
ctx.performance = { now: () => 0 };
ctx.navigator = { userAgent: 'node', onLine: true, language: 'es' };
ctx.location = { search: '', href: '', reload: noop };
ctx.localStorage = { _d:{}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=String(v); }, removeItem(k){ delete this._d[k]; } };
ctx.Audio = function(){ return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, canPlayType: () => '' }; };
ctx.URL = URL;
ctx.fetch = () => Promise.resolve({ json: () => Promise.resolve({}), ok: true });
ctx.AudioContext = function(){ return { createGain: ()=>({connect:noop,gain:{value:1,setValueAtTime:noop}}), createBiquadFilter:()=>({connect:noop}), destination:{}, currentTime:0 }; };
ctx.matchMedia = () => ({ matches:false, addEventListener:noop });
ctx.MutationObserver = function(){ return { observe: noop, disconnect: noop }; };
ctx.ResizeObserver = function(){ return { observe: noop, disconnect: noop }; };
ctx.IntersectionObserver = function(){ return { observe: noop, disconnect: noop }; };
ctx.Image = function(){ return elementStub(); };
ctx.document = {
  getElementById: () => elementStub(),
  querySelector: () => elementStub(),
  querySelectorAll: () => [],
  createElement: () => elementStub(),
  createElementNS: () => elementStub(),
  addEventListener: noop, removeEventListener: noop,
  body: elementStub(), documentElement: elementStub(), head: elementStub(),
  baseURI: 'http://localhost/',
  visibilityState: 'visible'
};
ctx.supabase = { createClient: () => ({ auth:{}, from: () => ({ select: ()=>({}) }) }) };

vm.createContext(ctx);

const files = ['Modelo/supabase-config.js','Vista/traducciones.js','Modelo/datos-del-juego.js','Modelo/config.js','Controlador/game.js'];
let failed = false;
for (const f of files) {
  try {
    vm.runInContext(fs.readFileSync(f,'utf8'), ctx, { filename: f });
    console.log('OK loaded:', f);
  } catch (e) {
    failed = true;
    console.error('\n>>> RUNTIME ERROR in', f);
    console.error('   ', e.name + ':', e.message);
    if (e.stack) console.error(e.stack.split('\n').slice(0,4).join('\n'));
    break;
  }
}
if (!failed) {
  // Intenta ejecutar init() como hace window.onload
  try {
    if (typeof ctx.init === 'function') { ctx.init(); console.log('\ninit() ran without throwing'); }
    else console.log('\n(init no es global; onload =', typeof ctx.onload, ')');
  } catch (e) {
    console.error('\n>>> init() threw:', e.name, e.message);
    if (e.stack) console.error(e.stack.split('\n').slice(0,5).join('\n'));
  }
  // Comprueba que las cosas nuevas existen
  const checks = {
    'SKINS_DATA.Grey rewamped_gray_set': () => ctx.SKINS_DATA?.Grey?.some(s=>s.id==='rewamped_gray_set'),
    'SKINS_DATA.Grey gray_rgb_sr': () => ctx.SKINS_DATA?.Grey?.some(s=>s.id==='gray_rgb_sr'),
    'SKINS_DATA.IEx toy_glomb_set': () => ctx.SKINS_DATA?.IEx?.some(s=>s.id==='toy_glomb_set'),
  };
  console.log('\n--- feature presence ---');
  for (const [k,fn] of Object.entries(checks)) {
    try { console.log(k+':', fn() ? 'YES' : 'NO'); } catch(e){ console.log(k+': (err '+e.message+')'); }
  }
}
