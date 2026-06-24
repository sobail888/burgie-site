/* ================= Burgie — app.js ================= */
'use strict';

/* ---------- Config ---------- */
const WA_NUMBER = '96171317661';
const FRAME_COUNT = 100;
const SECTIONS = ['burgers', 'appetizers', 'shakes', 'drinks', 'extras'];
const framePath = i => `frames/frame_${String(i + 1).padStart(4, '0')}.webp`;

/* ---------- Helpers ---------- */
const money = n => (Number.isInteger(n) ? `$${n}` : `$${(+n.toFixed(2))}`);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = s => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

/* ---------- Menu state (loaded from /data) ---------- */
let MENU = {};
const ITEMS = {};

/* ---------- Built-in fallback ----------
   The live menu is loaded from /data/*.json (what the admin panel edits).
   This snapshot is ONLY used if those files can't be fetched — e.g. when the
   page is opened directly as a file (file://) instead of through a web server.
   On the hosted site (Cloudflare) the JSON files are always used. */
const FALLBACK = {
  burgers: [
    { name: "Jack's Signature", price: 10, tag: "Signature", description: "Burgie dressing, iceberg, tomato, dill pickles, halloumi, onion jam, roasted onions & truffle mayo." },
    { name: "Wagyu Blueberry Bacon Jam Burger", price: 15, tag: "180g Wagyu", description: "180g Wagyu beef, Burgie dressing, berry bacon jam, chipotle sauce, cheddar, red onion pickles & jalapeño pickles." },
    { name: "Protein Burger", price: 13, tag: "75g Protein", description: "Burgie dressing, grilled onions, cheddar cheese & 3 patties." },
    { name: "King Burger", price: 9, description: "Burgie dressing, iceberg, tomato, dill pickles, cheddar, onion jam, red onion pickles, smoked bacon & egg." },
    { name: "Chipotle Burger", price: 8, tag: "Masterpiece", description: "Chipotle mayo, onion jam, cheddar cheese & smoked bacon." },
    { name: "Smokey BBQ", price: 8, description: "Burgie dressing, iceberg, tomato, dill pickles, cheddar, smoked bacon, BBQ sauce & roasted onions." },
    { name: "Cheesy Bacon", price: 8, description: "Burgie dressing, iceberg, tomato, dill pickles, cheddar, onion, ketchup & smoked bacon." },
    { name: "Bacon Royal", price: 7, description: "Ketchup, mayo, smoked bacon & cheddar cheese." },
    { name: "Ordinary Burger", price: 6, description: "Burgie dressing, iceberg, tomato, dill pickles & onion." },
    { name: "Cheese Burger", price: 7, description: "Burgie dressing, iceberg, tomato, dill pickles, ketchup, onion & cheddar cheese." },
    { name: "Oklahoma Burger", price: 6, description: "Burgie dressing, dill pickles, smashed onions & mustard." },
    { name: "Fire Jalapeños", price: 7, tag: "Spicy", description: "Jalapeño dressing, iceberg, dill pickles, cheddar cheese & onion." },
    { name: "Swiss Mushroom", price: 8, description: "Truffle mayo, onion jam, emmental cheese & grilled fresh mushrooms." },
    { name: "Tex Mex Burger", price: 9, description: "Burgie dressing, iceberg, tomato, jalapeño pickles, onion jam, red onion pickles, mayo, guacamole & tortilla chips." },
    { name: "Crunchy Chicken", price: 5, description: "Burgie dressing, iceberg, tomato, dill pickles & cheddar cheese." },
    { name: "BBQ Chicken", price: 6, description: "Burgie dressing, iceberg, tomato, dill pickles, cheddar, bacon, BBQ sauce & chipotle mayo." },
    { name: "Halloumi Burger", price: 6, tag: "120g", description: "Burgie dressing, iceberg, tomato, dill pickles, chimichurri & onion jam." },
    { name: "Truffle Luxe Burger", price: 8, tag: "180g Wagyu", description: "180g Wagyu beef, Burgie dressing, onion jam, emmental cheese, roasted onions & truffle mayo." }
  ],
  appetizers: [
    { name: "Starter Set", price: 9, description: "Fries, 3 crispy strips, 3 onion rings, 3 cheesy bites & dipping sauce." },
    { name: "Dirty Fries", price: 6, tag: "Imported", description: "Loaded with bacon, onions, jalapeño pickles & chipotle mayo." },
    { name: "Truffle Fries", price: 6, tag: "Imported", description: "Truffle oil, parmesan & parsley." },
    { name: "Dirty Crispy", price: 7, description: "Crispy chicken strips, fries, mayo & BBQ sauce." },
    { name: "Crispy Onion Rings", price: 3, description: "5 pieces, golden & crunchy." },
    { name: "Cheesy Heat Bites", price: 4, description: "5 pieces of melty, spicy cheese bites." },
    { name: "Small Fries", price: 3, tag: "Imported", description: "Imported fries, perfectly salted." },
    { name: "Large Fries", price: 5, tag: "Imported", description: "A big basket of imported fries." },
    { name: "Crispy Strips", price: 5, description: "4 pieces of crispy chicken strips." }
  ],
  shakes: [
    { name: "Oreo Dream Shake", price: 6, description: "Crushed Oreo blended thick & creamy, finished with a whipped top." },
    { name: "Choco Bliss Shake", price: 5, description: "Deep, velvety chocolate — pure blended bliss." },
    { name: "Vanilla Delight Shake", price: 5, description: "Smooth classic vanilla, blended rich & frosty." }
  ],
  drinks: [
    { name: "Soft Drinks", price: 1, description: "Ice-cold canned sodas." },
    { name: "Small Water", price: 0.5, description: "Bottled still water." }
  ],
  extras: [
    { name: "Double Your Patty", price: 3, tag: "Add-on", description: "Add an extra 120g Black Angus patty to any burger." },
    { name: "Make It Combo", price: 4, tag: "Add-on", description: "Turn any burger into a combo: imported fries, a soft drink & a sauce." },
    { name: "Spicy Kick", price: 0.5, tag: "Sauce", description: "Our fiery house dip." },
    { name: "Smokey Drizzle", price: 0.5, tag: "Sauce", description: "Smoky, rich & moreish." },
    { name: "Truffle Dip", price: 0.5, tag: "Sauce", description: "Earthy truffle indulgence." },
    { name: "Creamy Mayo", price: 0.5, tag: "Sauce", description: "Classic, smooth & creamy." },
    { name: "Chipotle Hit", price: 0.5, tag: "Sauce", description: "Smoky chipotle heat." },
    { name: "Burgie Dressing", price: 0.5, tag: "Sauce", description: "The signature Burgie sauce." }
  ]
};

/* ================= Hero scroll-scrub ================= */
(function heroScrub() {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('heroCanvas');
  const hint = document.getElementById('heroHint');
  if (!hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  const images = new Array(FRAME_COUNT);
  let current = -1, firstReady = false;

  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = framePath(i);
    img.onload = () => {
      if (!firstReady && images[0] && images[0].complete) { firstReady = true; resize(); drawFrame(0, true); }
    };
    images[i] = img;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(current < 0 ? 0 : current, true);
  }
  function drawFrame(i, force) {
    const img = images[i];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    if (i === current && !force) return;
    current = i;
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let w, h;
    if (cr > ir) { w = cw; h = cw / ir; } else { h = ch; w = ch * ir; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const scrollable = hero.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / scrollable));
      drawFrame(Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1))));
      if (hint) hint.style.opacity = p > 0.04 ? '0' : '0.85';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);
  if (images[0].complete) { firstReady = true; resize(); drawFrame(0, true); }
})();

/* ================= Nav: scroll state + mobile menu ================= */
(function nav() {
  const navEl = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const onScroll = () => navEl.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.6);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const close = () => { navEl.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = navEl.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

/* ================= Load menu data, then render ================= */
async function loadMenu() {
  const results = await Promise.all(SECTIONS.map(s =>
    fetch(`data/${s}.json`, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(j => (Array.isArray(j.items) ? j.items : []))
      .catch(() => null)   // null = data file couldn't be loaded (e.g. opened via file://)
  ));
  const usingFallback = results.some(r => r === null);
  if (usingFallback) console.warn('[Burgie] Menu data files not reachable — using built-in fallback. Serve the site over http (or host it) to use the editable /data files.');
  MENU = {};
  for (const k in ITEMS) delete ITEMS[k];
  const used = new Set();
  SECTIONS.forEach((sec, i) => {
    const list = results[i] !== null ? results[i] : (FALLBACK[sec] || []);
    MENU[sec] = list.filter(it => it && it.name).map(it => {
      let id = slug(it.name), base = id, n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      const obj = {
        id, name: it.name,
        price: Number(it.price) || 0,
        desc: it.description || it.desc || '',
        tag: it.tag || '',
        image: it.image || ''
      };
      ITEMS[id] = obj;
      return obj;
    });
  });
  renderRails();
  renderCart();
}

/* ================= Render cards into rails ================= */
function cardHTML(it) {
  const tag = it.tag ? `<span class="card__tag">${esc(it.tag)}</span>` : '';
  const media = it.image
    ? `<img src="${esc(it.image)}" alt="${esc(it.name)}" loading="lazy" />`
    : `<div class="card__placeholder"><img src="assets/logo.jpg" alt="" /><span>${esc(it.name)}</span></div>`;
  return `
  <article class="card" data-id="${it.id}">
    <div class="card__media" data-open="${it.id}" role="button" tabindex="0" aria-label="View ${esc(it.name)}">
      ${tag}
      ${media}
      <span class="card__view">View ＋</span>
    </div>
    <div class="card__body">
      <h3 class="card__name">${esc(it.name)}</h3>
      <p class="card__desc">${esc(it.desc)}</p>
      <div class="card__foot">
        <span class="card__price">${money(it.price)}</span>
        <button class="card__add" data-add="${it.id}" aria-label="Add ${esc(it.name)} to cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add
        </button>
      </div>
    </div>
  </article>`;
}
function renderRails() {
  document.querySelectorAll('.rail__track').forEach(track => {
    const cat = track.dataset.track;
    track.innerHTML = (MENU[cat] || []).map(cardHTML).join('');
  });
  initRails();
}

/* ================= Rail arrow controls ================= */
function initRails() {
  document.querySelectorAll('.rail').forEach(rail => {
    if (rail.dataset.inited) return;
    rail.dataset.inited = '1';
    const track = rail.querySelector('.rail__track');
    const left = rail.querySelector('.rail__arrow--left');
    const right = rail.querySelector('.rail__arrow--right');
    const step = () => Math.max(260, track.clientWidth * 0.85);
    const TOL = 12;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const overflow = track.scrollWidth > track.clientWidth + 4;
      left.style.display = right.style.display = overflow ? '' : 'none';
      left.disabled = track.scrollLeft <= TOL;
      right.disabled = track.scrollLeft >= max - TOL;
    };
    left.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    right.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    rail._railUpdate = update;
    update();
  });
  // run an extra update next frame once images/layout settle
  requestAnimationFrame(() => document.querySelectorAll('.rail').forEach(r => r._railUpdate && r._railUpdate()));
}

/* ================= Cart ================= */
const CART_KEY = 'burgie_cart_v1';
let cart = load();
function load() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function save() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(id) {
  if (!ITEMS[id]) return;
  const line = cart.find(l => l.id === id);
  if (line) line.qty++; else cart.push({ id, qty: 1 });
  save(); renderCart();
  toast(`${ITEMS[id].name} added`);
}
function changeQty(id, delta) {
  const line = cart.find(l => l.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter(l => l.id !== id);
  save(); renderCart();
}
function cartTotal() { return cart.reduce((s, l) => s + (ITEMS[l.id] ? ITEMS[l.id].price * l.qty : 0), 0); }
function cartCount() { return cart.reduce((s, l) => s + l.qty, 0); }

function renderCart() {
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  const countEl = document.getElementById('cartCount');
  // drop ids no longer on the menu (only once data is loaded)
  if (Object.keys(ITEMS).length) cart = cart.filter(l => ITEMS[l.id]);
  countEl.textContent = cartCount();
  countEl.style.display = cartCount() ? 'flex' : 'none';

  if (!cart.length) {
    body.innerHTML = `<p class="cart__empty">Your cart is empty.<br/>Add something tasty 🍔</p>`;
    foot.hidden = true;
    return;
  }
  body.innerHTML = cart.map(l => {
    const it = ITEMS[l.id];
    return `
    <div class="cart-item">
      <div class="cart-item__info">
        <div class="cart-item__name">${esc(it.name)}</div>
        <div class="cart-item__price">${money(it.price)} each</div>
      </div>
      <div class="cart-item__qty">
        <button class="qtybtn" data-dec="${l.id}" aria-label="Decrease">−</button>
        <span>${l.qty}</span>
        <button class="qtybtn" data-inc="${l.id}" aria-label="Increase">+</button>
      </div>
    </div>`;
  }).join('');
  foot.hidden = false;
  document.getElementById('cartTotal').textContent = money(cartTotal());
}

const cartEl = document.getElementById('cart');
const cartOverlay = document.getElementById('cartOverlay');
function openCart() { cartEl.classList.add('open'); cartOverlay.classList.add('open'); }
function closeCart() { cartEl.classList.remove('open'); cartOverlay.classList.remove('open'); }
document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.getElementById('cartOrder').addEventListener('click', () => {
  if (!cart.length) return;
  const name = document.getElementById('custName').value.trim();
  const addr = document.getElementById('custAddr').value.trim();
  let msg = 'Hi Burgie! 🍔 I would like to order:\n\n';
  cart.forEach(l => { const it = ITEMS[l.id]; msg += `• ${l.qty}× ${it.name} — ${money(it.price * l.qty)}\n`; });
  msg += `\nTotal: ${money(cartTotal())}`;
  if (name) msg += `\n\nName: ${name}`;
  if (addr) msg += `\nDelivery address: ${addr}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
});

/* ================= Lightbox ================= */
const lb = document.getElementById('lightbox');
let lbCurrent = null;
function openLightbox(id) {
  const it = ITEMS[id];
  if (!it) return;
  lbCurrent = id;
  document.getElementById('lbName').textContent = it.name;
  document.getElementById('lbDesc').textContent = it.desc;
  document.getElementById('lbPrice').textContent = money(it.price);
  const media = document.getElementById('lbMedia');
  if (it.image) {
    media.innerHTML = `<img src="${esc(it.image)}" alt="${esc(it.name)}"/>`;
  } else {
    media.innerHTML = `<div class="ph"><img src="assets/logo.jpg" alt=""/><span>Photo coming soon</span></div>`;
  }
  lb.classList.add('open');
}
function closeLightbox() { lb.classList.remove('open'); lbCurrent = null; }
document.getElementById('lbClose').addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.getElementById('lbAdd').addEventListener('click', () => { if (lbCurrent) { addToCart(lbCurrent); closeLightbox(); } });

/* ================= Delegated clicks + keyboard ================= */
document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]'); if (add) { addToCart(add.dataset.add); return; }
  const open = e.target.closest('[data-open]'); if (open) { openLightbox(open.dataset.open); return; }
  const inc = e.target.closest('[data-inc]'); if (inc) { changeQty(inc.dataset.inc, +1); return; }
  const dec = e.target.closest('[data-dec]'); if (dec) { changeQty(dec.dataset.dec, -1); return; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeCart(); return; }
  if (e.key === 'Enter' || e.key === ' ') {
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); openLightbox(open.dataset.open); }
  }
});

/* ================= Toast ================= */
let toastTimer;
function toast(text) {
  const t = document.getElementById('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ================= Init ================= */
document.getElementById('year').textContent = new Date().getFullYear();
renderCart();
loadMenu();
