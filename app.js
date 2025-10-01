// ---------------------- Данные товаров (пример) ----------------------
const products = [
  { id: 1, title: 'Товар 1', price: 1200, img: 'assets/products/product1.jpg' },
  { id: 2, title: 'Товар 2', price: 850, img: 'assets/products/product2.jpg' },
  { id: 3, title: 'Товар 3', price: 430, img: 'assets/products/product3.jpg' },
  { id: 4, title: 'Товар 4', price: 2999, img: 'assets/products/product4.jpg' }
];
// ---------------------------------------------------------------------

// DOM элементы
const catalogEl = document.getElementById('catalog');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const openCartBtn = document.getElementById('open-cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalModalEl = document.getElementById('cart-total-modal');
const cartQtyModalEl = document.getElementById('cart-qty-modal');
const clearCartBtn = document.getElementById('clear-cart-btn');
const checkoutBtn = document.getElementById('checkout-btn');

const orderModal = document.getElementById('order-modal');
const closeOrderBtn = document.getElementById('close-order-btn');
const orderForm = document.getElementById('order-form');
const orderResult = document.getElementById('order-result');

// Ключ для localStorage
const STORAGE_KEY = 'myshop_cart_v1';

// Структура корзины: { productId: { ...product, qty: number } }
let cart = {};

// ---------------------- Инициализация каталога ----------------------
function renderCatalog() {
  catalogEl.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="title">${p.title}</div>
      <div class="price">${p.price} ₽</div>
      <div class="actions">
        <button data-add="${p.id}">Добавить в корзину</button>
        <button class="secondary" data-view="${p.id}">Подробнее</button>
      </div>
    `;
    catalogEl.appendChild(card);
  });
}
renderCatalog();

// ---------------------- Работа с localStorage ----------------------
function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
function loadCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    cart = JSON.parse(raw) || {};
  } catch(e) {
    cart = {};
  }
}
loadCart();

// ---------------------- Утилиты подсчёта ----------------------
function calculateTotals() {
  let total = 0, qty = 0;
  Object.values(cart).forEach(item => {
    total += item.price * item.qty;
    qty += item.qty;
  });
  return { total, qty };
}
function updateCartUI() {
  const { total, qty } = calculateTotals();
  cartCountEl.textContent = qty;
  cartTotalEl.textContent = total;
  cartTotalModalEl.textContent = total;
  cartQtyModalEl.textContent = qty;
}

// ---------------------- Добавление / удаление / изменение кол-ва ----------------------
function addToCart(productId, amount = 1) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  if (!cart[productId]) {
    cart[productId] = { ...product, qty: 0 };
  }
  cart[productId].qty += amount;
  if (cart[productId].qty < 1) delete cart[productId];
  saveCart();
  updateCartUI();
  renderCartItems();
}

function removeFromCart(productId) {
  if (cart[productId]) {
    delete cart[productId];
    saveCart();
    updateCartUI();
    renderCartItems();
  }
}

function setQty(productId, qty) {
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }
  if (cart[productId]) {
    cart[productId].qty = qty;
    saveCart();
    updateCartUI();
    renderCartItems();
  }
}

// ---------------------- Рендер корзины (в модальном окне) ----------------------
function renderCartItems() {
  cartItemsEl.innerHTML = '';
  if (Object.keys(cart).length === 0) {
    cartItemsEl.innerHTML = '<p>Корзина пуста.</p>';
    return;
  }
  Object.values(cart).forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div class="meta">
        <div class="title">${item.title}</div>
        <div>${item.price} ₽</div>
      </div>
      <div class="qty-control">
        <button data-decrease="${item.id}">−</button>
        <input type="number" min="1" value="${item.qty}" data-qty="${item.id}" style="width:60px;padding:6px;border-radius:6px;border:1px solid #ddd;">
        <button data-increase="${item.id}">+</button>
      </div>
      <div><button class="secondary" data-remove="${item.id}">Удалить</button></div>
    `;
    cartItemsEl.appendChild(div);
  });
}

// ---------------------- События (делегирование) ----------------------
// Добавить товар из каталога
document.body.addEventListener('click', (e) => {
  const addId = e.target.getAttribute('data-add');
  if (addId) {
    addToCart(Number(addId));
    return;
  }
  const viewId = e.target.getAttribute('data-view');
  if (viewId) {
    alert('Здесь могло быть подробное описание товара (в demo оно упрощено).');
    return;
  }
  const removeId = e.target.getAttribute('data-remove');
  if (removeId) {
    removeFromCart(Number(removeId));
    return;
  }
  const decId = e.target.getAttribute('data-decrease');
  if (decId) {
    const id = Number(decId);
    const current = cart[id] ? cart[id].qty : 0;
    setQty(id, current - 1);
    return;
  }
  const incId = e.target.getAttribute('data-increase');
  if (incId) {
    const id = Number(incId);
    const current = cart[id] ? cart[id].qty : 0;
    setQty(id, current + 1);
    return;
  }
});

// Обработка изменения значения в input количества (в корзине)
cartItemsEl.addEventListener('change', (e) => {
  const id = e.target.getAttribute('data-qty');
  if (!id) return;
  let val = parseInt(e.target.value, 10) || 0;
  setQty(Number(id), val);
});

// Открыть / закрыть корзину
openCartBtn.addEventListener('click', () => {
  cartModal.setAttribute('aria-hidden', 'false');
  renderCartItems();
});
closeCartBtn.addEventListener('click', () => cartModal.setAttribute('aria-hidden', 'true'));

// Очистка корзины
clearCartBtn.addEventListener('click', () => {
  if (!confirm('Очистить корзину?')) return;
  cart = {};
  saveCart();
  updateCartUI();
  renderCartItems();
});

// Перейти к оформлению (показываем форму заказа)
checkoutBtn.addEventListener('click', () => {
  cartModal.setAttribute('aria-hidden', 'true');
  orderModal.setAttribute('aria-hidden', 'false');
});

// Закрыть форму заказа
closeOrderBtn.addEventListener('click', () => orderModal.setAttribute('aria-hidden', 'true'));

// Обработка отправки формы заказа
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // Здесь обычно отправка на сервер; для задания просто показываем сообщение
  orderResult.textContent = 'Заказ создан!';
  // очищаем корзину
  cart = {};
  saveCart();
  updateCartUI();
  renderCartItems();
  // можно закрыть модал через несколько секунд
  setTimeout(() => {
    orderModal.setAttribute('aria-hidden', 'true');
    orderResult.textContent = '';
    orderForm.reset();
  }, 2000);
});

// Инициализация UI при загрузке
updateCartUI();
renderCartItems();
