/**
 * Ayomi Collection — store.js
 * Supabase-connected marketplace with ₦2,000 flat markup
 * Pricing rule: supplier_price + ₦2,000 = selling_price
 */

// ============================================
// SUPABASE CONFIG — Replace with your values
// ============================================
const SUPABASE_URL = 'https://vuqajdjwqudacyzdcgyx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cWFqZGp3cXVkYWN5emRjZ3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTU2NjIsImV4cCI6MjA4OTE3MTY2Mn0.na9WvsXb_K7Jb7LWHxxz2RmFavnNmlLuNH0mX0YHftg';
const MARKUP_FLAT = 2000; // ₦2,000 flat markup on all products
const WA_NUMBER = '2348143105629';
const PHONE_NUMBER = '08080945551';

// ============================================
// STATE
// ============================================
let store = {
  products: [],
  filtered: [],
  cart: JSON.parse(localStorage.getItem('ayomi_cart') || '[]'),
  activeCategory: null,
  searchQuery: '',
  currentPage: 1,
  perPage: 12,
  priceFrom: 0,
  priceTo: Infinity,
  sortBy: 'newest',
};

// ============================================
// SUPABASE CLIENT (vanilla fetch — no npm needed)
// ============================================
async function supabaseFetch(table, queryParams = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${queryParams}&order=created_at.desc`;
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Supabase fetch failed, using demo data:', err.message);
    return null;
  }
}

// ============================================
// DEMO PRODUCTS — shown if Supabase not configured
// ============================================
const DEMO_PRODUCTS = [
  { id:'1', name:'Ankara Floral Maxi Dress', description:'Beautiful hand-woven Ankara fabric maxi dress. Perfect for events, parties, and everyday wear. Available in multiple sizes (S-XL). Vibrant colors, quality fabric.', supplier_price:8500, category:'Clothing', image_url:'👗', source:'Lagos Fashion Wholesale Group', created_at:new Date(Date.now()-1*86400000).toISOString(), status:'active' },
  { id:'2', name:'Nike Air Max 270 (Original)', description:'Authentic Nike Air Max 270 sneakers. Lightweight, comfortable, and stylish. Available in sizes 40-45. Comes with original box.', supplier_price:35000, category:'Shoes', image_url:'👟', source:'Abuja Shoe Wholesale', created_at:new Date(Date.now()-2*86400000).toISOString(), status:'active' },
  { id:'3', name:'Samsung Galaxy S24 Ultra', description:'Latest Samsung flagship smartphone. 200MP camera, Snapdragon 8 Gen 3, 5000mAh battery. Nigerian warranty. Comes with all accessories.', supplier_price:650000, category:'Electronics', image_url:'📱', source:'Electronics Hub NG', created_at:new Date(Date.now()-3*86400000).toISOString(), status:'active' },
  { id:'4', name:'Versace Eros Perfume 100ml', description:'Original Versace Eros eau de toilette. Long-lasting masculine fragrance with mint and vanilla notes. Comes with gift box and certificate.', supplier_price:28000, category:'Perfumes', image_url:'🌹', source:'Perfume Palace NG', created_at:new Date(Date.now()-4*86400000).toISOString(), status:'active' },
  { id:'5', name:'Non-Stick Cooking Set 7-Piece', description:'Premium non-stick pot and pan set. Granite coating, even heat distribution. Includes frying pans, pots, and glass lids. Suitable for all cooktops.', supplier_price:22000, category:'Kitchen Utensils', image_url:'🍳', source:'Home & Kitchen NG', created_at:new Date(Date.now()-5*86400000).toISOString(), status:'active' },
  { id:'6', name:'Gucci GG Supreme Tote Bag', description:'Premium quality Gucci-inspired tote bag. Durable canvas material with leather handles. Perfect for shopping or everyday use. Multiple colors available.', supplier_price:18000, category:'Bags', image_url:'👜', source:'Fashion Bags Lagos', created_at:new Date(Date.now()-6*86400000).toISOString(), status:'active' },
  { id:'7', name:'Gold Layered Necklace Set', description:'Elegant 18k gold-plated layered necklace set. Hypoallergenic, tarnish-resistant. Set includes 3 necklaces of different lengths. Beautiful gift option.', supplier_price:7500, category:'Accessories', image_url:'💍', source:'Jewellery Palace NG', created_at:new Date(Date.now()-7*86400000).toISOString(), status:'active' },
  { id:'8', name:'Apple AirPods Pro 2nd Gen', description:'Apple AirPods Pro with active noise cancellation, transparency mode, and MagSafe charging case. Original packaging. Nigerian warranty included.', supplier_price:72000, category:'Electronics', image_url:'🎧', source:'Apple Resellers NG', created_at:new Date(Date.now()-1*86400000).toISOString(), status:'active' },
  { id:'9', name:'Adidas Gazelle Sneakers', description:'Classic Adidas Gazelle low-top sneakers in premium suede. Versatile style that pairs with any outfit. Sizes 38-46. Available in multiple colors.', supplier_price:25000, category:'Shoes', image_url:'🥿', source:'Sneaker World NG', created_at:new Date(Date.now()-8*86400000).toISOString(), status:'active' },
  { id:'10', name:'Chanel No. 5 Perfume 50ml', description:'Iconic Chanel No. 5 eau de parfum. Timeless floral aldehyde fragrance. Perfect gift for her. Original with authenticity certificate.', supplier_price:45000, category:'Perfumes', image_url:'🪷', source:'Luxury Fragrance Hub', created_at:new Date(Date.now()-9*86400000).toISOString(), status:'active' },
  { id:'11', name:'Designer Silk Blouse', description:'Luxurious silk-feel blouse with floral print. Perfect for office wear or casual outings. Multiple colors available. Machine washable. Sizes S-XXL.', supplier_price:12000, category:'Clothing', image_url:'👚', source:'Trendy Lagos Fashion', created_at:new Date(Date.now()-2*86400000).toISOString(), status:'active' },
  { id:'12', name:'Apple Watch Series 9', description:'Apple Watch Series 9 with always-on Retina display, ECG, blood oxygen monitoring. Aluminium case with sport band. GPS and Cellular options available.', supplier_price:185000, category:'Electronics', image_url:'⌚', source:'Tech Galaxy NG', created_at:new Date(Date.now()-3*86400000).toISOString(), status:'active' },
  { id:'13', name:'Leather Crossbody Handbag', description:'Genuine leather crossbody bag with gold-tone hardware. Adjustable strap, multiple compartments. Perfect for everyday use. Available in brown and black.', supplier_price:14000, category:'Bags', image_url:'👛', source:'Leather Works NG', created_at:new Date(Date.now()-10*86400000).toISOString(), status:'active' },
  { id:'14', name:'Digital Air Fryer 5.5L', description:'Large capacity digital air fryer with 8 preset programs. Healthy cooking with 90% less oil. Easy-to-clean non-stick basket. Temperature control 80-200°C.', supplier_price:35000, category:'Kitchen Utensils', image_url:'🥘', source:'Kitchen Plus NG', created_at:new Date(Date.now()-4*86400000).toISOString(), status:'active' },
  { id:'15', name:'Iced Out Gold Wristwatch', description:'Premium iced-out quartz wristwatch. Stainless steel case, gold-plated bracelet. Water resistant to 30m. Comes in luxury gift box.', supplier_price:18000, category:'Accessories', image_url:'🕐', source:'Time Pieces Lagos', created_at:new Date(Date.now()-5*86400000).toISOString(), status:'active' },
  { id:'16', name:'French Lace Fabric (5 Yards)', description:'Premium quality French lace fabric. 5 yards — suitable for a complete outfit. Beautiful pattern, vibrant color, soft texture. Perfect for aso-ebi.', supplier_price:32000, category:'Clothing', image_url:'🧵', source:'Fabric House NG', created_at:new Date(Date.now()-11*86400000).toISOString(), status:'active' },
];

// ============================================
// PRICING: SUPPLIER + ₦2,000 FLAT MARKUP
// ============================================
function getSellingPrice(product) {
  // If already has a selling_price set in admin, use that
  if (product.selling_price && product.selling_price > product.supplier_price) {
    return product.selling_price;
  }
  // Otherwise apply flat ₦2,000 markup
  return (product.supplier_price || 0) + MARKUP_FLAT;
}

// ============================================
// LOAD PRODUCTS
// ============================================
async function loadProducts() {
  // Show loading state
  document.getElementById('shopLoadingState').style.display = 'block';
  document.getElementById('shopGrid').innerHTML = '';

  // Try Supabase first
  if (true) { // Always fetch from Supabase
    const data = await supabaseFetch('products', 'status=eq.active&select=*');
    if (data && data.length > 0) {
      store.products = data;
      console.log(`✅ Loaded ${data.length} products from Supabase`);
    } else {
      store.products = getDemoWithAdminProducts();
    }
  } else {
    store.products = getDemoWithAdminProducts();
  }

  // Ensure all products have selling_price calculated
  store.products = store.products.map(p => ({
    ...p,
    selling_price: getSellingPrice(p),
  }));

  store.filtered = [...store.products];
  document.getElementById('shopLoadingState').style.display = 'none';

  renderHomeGrids();
  renderShopGrid();
  renderAsideCats();
  updateCategoryShowcase();
  animateTrustCounters();
}

function getDemoWithAdminProducts() {
  // Merge admin-saved products with demo products
  const adminSaved = JSON.parse(localStorage.getItem('ayomi_products') || '[]');
  const demoIds = DEMO_PRODUCTS.map(p => p.id);
  const adminExtra = adminSaved.filter(p => !demoIds.includes(p.id));
  return [...adminExtra, ...DEMO_PRODUCTS].filter(p => p.status !== 'deleted');
}

// ============================================
// RENDER HOME PAGE GRIDS
// ============================================
function renderHomeGrids() {
  // New arrivals — most recent 8
  const newArr = [...store.products]
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);
  const newGrid = document.getElementById('homeNewGrid');
  if (newGrid) newGrid.innerHTML = newArr.map((p,i) => productCard(p, i, true)).join('');

  // Trending — random selection of 8
  const trending = [...store.products].sort(() => Math.random() - 0.5).slice(0, 8);
  const trendGrid = document.getElementById('homeTrendingGrid');
  if (trendGrid) trendGrid.innerHTML = trending.map((p,i) => productCard(p, i, false, true)).join('');
}

// ============================================
// PRODUCT CARD HTML
// ============================================
function productCard(product, index = 0, isNew = false, isTrending = false) {
  const price = getSellingPrice(product);
  const isRecentlyAdded = (Date.now() - new Date(product.created_at).getTime()) < 3 * 86400000;
  const badge = isTrending ? `<div class="pc-badge hot">🔥 Hot</div>` :
                isNew || isRecentlyAdded ? `<div class="pc-badge new">✨ New</div>` : '';

  const imgContent = product.image_url && product.image_url.startsWith('http')
    ? `<img src="${product.image_url}" alt="${escHtml(product.name)}" loading="lazy" onerror="this.parentElement.innerHTML='📦'" />`
    : `<span style="font-size:64px">${product.image_url || '📦'}</span>`;

  return `
    <div class="product-card" style="animation-delay:${index * 0.06}s" onclick="openProductDetail('${product.id}')">
      ${badge}
      <button class="pc-wish" onclick="event.stopPropagation();addToWishlist('${product.id}')" title="Add to wishlist">🤍</button>
      <div class="pc-image">${imgContent}</div>
      <div class="pc-body">
        <div class="pc-cat">${product.category}</div>
        <div class="pc-name">${escHtml(product.name)}</div>
        <div class="pc-desc">${escHtml(product.description || '')}</div>
        <div class="pc-foot">
          <div>
            <div class="pc-price">₦${fmt(price)}</div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn-wa-quick" onclick="event.stopPropagation();quickWhatsApp('${product.id}')" title="Order on WhatsApp">💬</button>
            <button class="btn-add-cart" onclick="event.stopPropagation();addToCart('${product.id}')">+ Cart</button>
          </div>
        </div>
      </div>
    </div>`;
}

// ============================================
// SHOP GRID
// ============================================
function applyShopFilters() {
  let filtered = [...store.products];

  // Category filter
  if (store.activeCategory) filtered = filtered.filter(p => p.category === store.activeCategory);

  // Search
  if (store.searchQuery) {
    const q = store.searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Price range
  const fromEl = document.getElementById('priceFrom');
  const toEl = document.getElementById('priceTo');
  const from = fromEl && fromEl.value ? parseInt(fromEl.value) : 0;
  const to = toEl && toEl.value ? parseInt(toEl.value) : Infinity;
  if (from > 0 || to < Infinity) {
    filtered = filtered.filter(p => {
      const price = getSellingPrice(p);
      return price >= from && price <= to;
    });
  }

  // Sort
  const sortVal = document.querySelector('input[name="sortBy"]:checked')?.value || 'newest';
  if (sortVal === 'newest') filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  else if (sortVal === 'price-asc') filtered.sort((a,b) => getSellingPrice(a) - getSellingPrice(b));
  else if (sortVal === 'price-desc') filtered.sort((a,b) => getSellingPrice(b) - getSellingPrice(a));
  else if (sortVal === 'alpha') filtered.sort((a,b) => a.name.localeCompare(b.name));

  store.filtered = filtered;
  store.currentPage = 1;
  renderShopGrid();
  renderPagination();
  updateActiveFiltersDisplay();

  const countEl = document.getElementById('shopCount');
  if (countEl) countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  document.getElementById('emptyShop').style.display = filtered.length === 0 ? 'block' : 'none';
}

function renderShopGrid() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;
  const start = (store.currentPage - 1) * store.perPage;
  const paged = store.filtered.slice(start, start + store.perPage);
  if (paged.length === 0) { grid.innerHTML = ''; return; }
  grid.innerHTML = paged.map((p, i) => productCard(p, i)).join('');
  renderPagination();

  const countEl = document.getElementById('shopCount');
  if (countEl) countEl.textContent = `${store.filtered.length} product${store.filtered.length !== 1 ? 's' : ''}`;
  document.getElementById('emptyShop').style.display = store.filtered.length === 0 ? 'block' : 'none';
}

function renderPagination() {
  const total = Math.ceil(store.filtered.length / store.perPage);
  const el = document.getElementById('shopPagination');
  if (!el || total <= 1) { if(el) el.innerHTML=''; return; }
  let html = '';
  for (let i = 1; i <= total; i++) {
    html += `<button class="pg-btn${i===store.currentPage?' active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  el.innerHTML = html;
}

function goPage(n) {
  store.currentPage = n;
  renderShopGrid();
  document.querySelector('.shop-main')?.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// ASIDE CATEGORY BUTTONS
// ============================================
function renderAsideCats() {
  const CATEGORIES = ['Clothing','Shoes','Perfumes','Kitchen Utensils','Electronics','Bags','Accessories','Other'];
  const EMOJIS = { Clothing:'👗', Shoes:'👟', Perfumes:'🌹', 'Kitchen Utensils':'🍳', Electronics:'📱', Bags:'👜', Accessories:'💍', Other:'🎁' };
  const container = document.getElementById('asideCats');
  if (!container) return;

  let html = `<button class="aside-cat-btn${!store.activeCategory?' active':''}" onclick="setCategoryFilter(null)">
    <span>🛍️ All Products</span>
    <span class="cat-count">${store.products.length}</span>
  </button>`;

  CATEGORIES.forEach(cat => {
    const count = store.products.filter(p => p.category === cat).length;
    html += `<button class="aside-cat-btn${store.activeCategory===cat?' active':''}" onclick="setCategoryFilter('${cat}')">
      <span>${EMOJIS[cat]} ${cat}</span>
      <span class="cat-count">${count}</span>
    </button>`;
  });

  container.innerHTML = html;
}

function setCategoryFilter(cat) {
  store.activeCategory = cat;
  store.currentPage = 1;
  renderAsideCats();
  applyShopFilters();
  const crumb = document.getElementById('shopCrumb');
  if (crumb) crumb.textContent = cat || 'All Products';
}

function clearShopFilters() {
  store.activeCategory = null;
  store.searchQuery = '';
  store.currentPage = 1;
  const fromEl = document.getElementById('priceFrom');
  const toEl = document.getElementById('priceTo');
  if (fromEl) fromEl.value = '';
  if (toEl) toEl.value = '';
  const newest = document.querySelector('input[name="sortBy"][value="newest"]');
  if (newest) newest.checked = true;
  const crumb = document.getElementById('shopCrumb');
  if (crumb) crumb.textContent = 'All Products';
  renderAsideCats();
  applyShopFilters();
}

function updateActiveFiltersDisplay() {
  const container = document.getElementById('activeFilters');
  if (!container) return;
  let chips = '';
  if (store.activeCategory) {
    chips += `<div class="af-chip">${store.activeCategory}<button onclick="setCategoryFilter(null)">✕</button></div>`;
  }
  if (store.searchQuery) {
    chips += `<div class="af-chip">🔍 "${escHtml(store.searchQuery)}"<button onclick="clearSearch()">✕</button></div>`;
  }
  container.innerHTML = chips;
}

// ============================================
// CATEGORY SHOWCASE COUNTS
// ============================================
function updateCategoryShowcase() {
  const cats = ['Clothing','Shoes','Electronics','Perfumes','Bags','Accessories'];
  cats.forEach(cat => {
    const count = store.products.filter(p => p.category === cat).length;
    const el = document.getElementById(`csg-count-${cat}`);
    if (el) el.textContent = `${count} item${count !== 1 ? 's' : ''}`;
  });
}

// ============================================
// SEARCH
// ============================================
function toggleSearch() {
  document.getElementById('searchBar').classList.toggle('open');
  if (document.getElementById('searchBar').classList.contains('open')) {
    setTimeout(() => document.getElementById('searchInput').focus(), 200);
  }
}

function handleSearchInput() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const sug = document.getElementById('searchSuggestions');
  if (!q || q.length < 2) { sug.innerHTML = ''; return; }
  const results = store.products.filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  ).slice(0, 6);
  sug.innerHTML = results.map(p => `
    <div class="sug-item" onclick="quickOpenProduct('${p.id}')">
      <span>${p.image_url && !p.image_url.startsWith('http') ? p.image_url : '📦'}</span>
      <div class="sug-info">
        <strong>${escHtml(p.name)}</strong>
        <small>${p.category}</small>
      </div>
      <span class="sug-price">₦${fmt(getSellingPrice(p))}</span>
    </div>`).join('');
}

function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  store.searchQuery = q;
  store.currentPage = 1;
  toggleSearch();
  showView('shop');
  applyShopFilters();
}

function clearSearch() {
  store.searchQuery = '';
  document.getElementById('searchInput').value = '';
  applyShopFilters();
  updateActiveFiltersDisplay();
}

function quickOpenProduct(id) {
  toggleSearch();
  openProductDetail(id);
}

// ============================================
// PRODUCT DETAIL
// ============================================
function openProductDetail(id) {
  const product = store.products.find(p => p.id === id);
  if (!product) return;
  const price = getSellingPrice(product);

  const imgContent = product.image_url && product.image_url.startsWith('http')
    ? `<img src="${product.image_url}" alt="${escHtml(product.name)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.style.fontSize='96px';this.parentElement.textContent='📦'" />`
    : `<span style="font-size:96px">${product.image_url || '📦'}</span>`;

  // Open as modal on shop page, full page otherwise
  document.getElementById('modalContent').innerHTML = `
    <div class="product-detail-layout">
      <div class="pdl-image">${imgContent}</div>
      <div class="pdl-info">
        <div class="pdl-cat">${product.category}</div>
        <h1 class="pdl-name">${escHtml(product.name)}</h1>
        <div class="pdl-price">₦${fmt(price)}</div>
        <p class="pdl-desc">${escHtml(product.description || '')}</p>
        <div class="pdl-source">🏪 Source: ${escHtml(product.source || 'Verified Nigerian Supplier')}</div>
        <div class="pdl-actions">
          <button class="btn-wa-order" onclick="orderOnWhatsApp('${product.id}')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Order on WhatsApp
          </button>
          <button class="btn-add-cart-lg" onclick="addToCart('${product.id}')">🛒 Add to Cart</button>
        </div>
      </div>
    </div>`;

  openModal();

  // Related products
  const related = store.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
}

function openModal() {
  document.getElementById('modalOverlay').classList.add('show');
  document.getElementById('productModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('productModal').classList.remove('show');
  document.body.style.overflow = '';
}

// ============================================
// CART
// ============================================
function addToCart(id) {
  const product = store.products.find(p => p.id === id);
  if (!product) return;
  const price = getSellingPrice(product);
  const existing = store.cart.find(c => c.id === id);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else store.cart.push({ id, name: product.name, price, image: product.image_url, category: product.category, qty: 1 });
  saveCart();
  renderCart();
  showToast(`✓ ${product.name} added to cart`, 'success');
}

function removeFromCart(id) {
  store.cart = store.cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
}

function updateQty(id, delta) {
  const item = store.cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveCart();
  renderCart();
}

function clearCart() {
  store.cart = [];
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('ayomi_cart', JSON.stringify(store.cart));
  const total = store.cart.reduce((a, c) => a + (c.qty || 1), 0);
  document.getElementById('cartBadge').textContent = total;
}

function renderCart() {
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  if (!body) return;

  if (store.cart.length === 0) {
    body.innerHTML = `<div class="cart-empty-state"><div class="ces-icon">🛒</div><h4>Your cart is empty</h4><p>Add products to start your order</p><button class="btn-gold" onclick="showView('shop');toggleCart()">Browse Products</button></div>`;
    foot.style.display = 'none';
    return;
  }

  foot.style.display = 'block';
  const subtotal = store.cart.reduce((a, c) => a + c.price * (c.qty || 1), 0);
  document.getElementById('cartSubtotal').textContent = `₦${fmt(subtotal)}`;
  document.getElementById('cartTotal').textContent = `₦${fmt(subtotal)}`;

  body.innerHTML = store.cart.map(item => {
    const imgContent = item.image && item.image.startsWith('http')
      ? `<img src="${item.image}" alt="${escHtml(item.name)}" onerror="this.parentElement.textContent='📦'">`
      : item.image || '📦';
    return `<div class="cart-item">
      <div class="ci-img">${imgContent}</div>
      <div class="ci-info">
        <strong>${escHtml(item.name)}</strong>
        <span>₦${fmt(item.price)}</span>
        <div class="ci-qty">
          <button onclick="updateQty('${item.id}',-1)">−</button>
          <span>${item.qty || 1}</span>
          <button onclick="updateQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="ci-remove" onclick="removeFromCart('${item.id}')">✕</button>
    </div>`;
  }).join('');
}

function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('show');
  document.body.style.overflow = document.getElementById('cartDrawer').classList.contains('open') ? 'hidden' : '';
}

function whatsappCheckout() {
  if (store.cart.length === 0) return;
  const lines = store.cart.map(c => `• ${c.name} — ₦${fmt(c.price)} × ${c.qty || 1} = ₦${fmt(c.price * (c.qty || 1))}`).join('\n');
  const total = store.cart.reduce((a, c) => a + c.price * (c.qty || 1), 0);
  const msg = `Hello Ayomi Collection! 🛍️\n\nI'd like to order the following:\n\n${lines}\n\n*Total: ₦${fmt(total)}*\n\nPlease confirm availability and delivery details. Thank you! 😊`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

function orderOnWhatsApp(id) {
  const product = store.products.find(p => p.id === id);
  if (!product) return;
  const price = getSellingPrice(product);
  const msg = `Hello Ayomi Collection! 👋\n\nI'm interested in ordering:\n\n*${product.name}*\nCategory: ${product.category}\nPrice: ₦${fmt(price)}\n\nPlease confirm availability and delivery details. Thank you!`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  closeModal();
}

function quickWhatsApp(id) {
  const product = store.products.find(p => p.id === id);
  if (!product) return;
  const price = getSellingPrice(product);
  const msg = `Hi! I'm interested in *${product.name}* (₦${fmt(price)}) from Ayomi Collection. Is it available?`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

function addToWishlist(id) {
  showToast('❤️ Added to wishlist!', 'info');
}

// ============================================
// VIEW ROUTING
// ============================================
function showView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${view}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (view === 'shop') {
    applyShopFilters();
    renderAsideCats();
  }
  if (view === 'home') {
    renderHomeGrids();
    animateTrustCounters();
  }
}

function goCategory(cat) {
  store.activeCategory = cat;
  store.currentPage = 1;
  showView('shop');
  renderAsideCats();
  applyShopFilters();
  const crumb = document.getElementById('shopCrumb');
  if (crumb) crumb.textContent = cat;
  document.getElementById('mobileMenu').classList.remove('open');
}

// ============================================
// MOBILE NAV
// ============================================
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}

function toggleShopAside() {
  document.getElementById('shopAside').classList.toggle('mobile-open');
}

function scrollToContact() {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  if (document.getElementById('view-home').classList.contains('active')) return;
  showView('home');
  setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 60) nav?.classList.add('scrolled');
  else nav?.classList.remove('scrolled');
}, { passive: true });

// ============================================
// TRUST COUNTER ANIMATION
// ============================================
function animateTrustCounters() {
  document.querySelectorAll('.trust-num').forEach(el => {
    const target = parseInt(el.dataset.target || '0');
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 50));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 25);
  });
}

// ============================================
// TOAST
// ============================================
function showToast(msg, type = 'info') {
  const box = document.getElementById('toastBox');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-30px)'; setTimeout(() => t.remove(), 400); }, 3200);
}

// ============================================
// UTILS
// ============================================
function fmt(n) { return Number(n || 0).toLocaleString('en-NG'); }
function escHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ============================================
// REAL-TIME SUPABASE SUBSCRIPTION
// (Listens for new products added via admin/WhatsApp parser)
// ============================================
function setupRealtimeUpdates() {
  // Supabase configured, polling enabled
  // Poll every 30 seconds for new products
  setInterval(async () => {
    const data = await supabaseFetch('products', 'status=eq.active&select=*');
    if (data && data.length > store.products.length) {
      const newCount = data.length - store.products.length;
      store.products = data.map(p => ({ ...p, selling_price: getSellingPrice(p) }));
      store.filtered = [...store.products];
      renderHomeGrids();
      applyShopFilters();
      updateCategoryShowcase();
      renderAsideCats();
      showToast(`✨ ${newCount} new product${newCount>1?'s':''} added!`, 'info');
    }
  }, 30000);
}

// ============================================
// INIT
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  // Hide loader
  setTimeout(() => document.getElementById('loader').classList.add('out'), 2200);

  // Load products from Supabase or demo
  loadProducts();

  // Init cart
  const total = store.cart.reduce((a,c) => a+(c.qty||1), 0);
  document.getElementById('cartBadge').textContent = total;
  renderCart();

  // Show home
  showView('home');

  // Start real-time updates if Supabase configured
  setupRealtimeUpdates();

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); }
    if (e.ctrlKey && e.key === 'k') { e.preventDefault(); toggleSearch(); }
  });
});
