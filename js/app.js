// Данные товаров
const products = [
  { id: 1, title: 'Товар 1', price: 11, img: "1.png" },
  { id: 2, title: 'Товар 2', price: 111, img: "2.png" },
  { id: 3, title: 'Товар 3', price: 1111, img: "3.jpg" },
  { id: 4, title: 'Товар 4', price: 11111, img: "4.png" },
  { id: 5, title: 'Товар 5', price: 22, img: "5.png" },
  { id: 6, title: 'Товар 6', price: 222, img: "6.jpg" },
  { id: 7, title: 'Товар 7', price: 2222, img: "7.jpg" },
  { id: 8, title: 'Товар 8', price: 22222, img: "8.png" },
  { id: 9, title: 'Товар 9', price: 33, img: "9.jpg" },
  { id: 10, title: 'Товар 10', price: 333, img: "10.png" },
  { id: 11, title: 'Товар 11', price: 3333, img: "11.jpg" },
  { id: 12, title: 'Товар 12', price: 33333, img: "12.png" }
];

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

// Возвращает true, если корзина пуста
function isCartEmpty() {
  if (!cart) return true;
  if (Array.isArray(cart)) {
    return cart.length === 0;
  }
  // Если cart — объект: проверяем количество ключей
  return Object.keys(cart).length === 0;
}

// Каталог
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
      </div>
    `;
    catalogEl.appendChild(card);
  });
}
renderCatalog();

// Работа с localStorage
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

// Подсчёт
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

// Добавление / удаление / изменение количества
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

// Корзина
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
    <div>Количество: ${item.qty}</div>
    <div>Сумма: ${item.price * item.qty} ₽</div>
  </div>
  <div class="qty-control">
    <button data-decrease="${item.id}">−</button>
    <span>${item.qty}</span>
    <button data-increase="${item.id}">+</button>
  </div>
  <div><button class="secondary" data-remove="${item.id}">Удалить</button></div>
`;

    cartItemsEl.appendChild(div);
  });
}

// Добавить товар из каталога
document.body.addEventListener('click', (e) => {
  const addId = e.target.getAttribute('data-add');
  if (addId) {
    addToCart(Number(addId));
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

// Перейти к оформлению
checkoutBtn.addEventListener('click', () => {
  // Сначала проверяем корзину
  if (Object.keys(cart).length === 0) {
  alert('Корзина пуста! Добавьте товары перед оформлением.');
  return;
}

  // Если корзина не пустая — открываем окно оформления заказа
  cartModal.setAttribute('aria-hidden', 'true');
  orderModal.setAttribute('aria-hidden', 'false');
});

// Закрыть форму заказа
closeOrderBtn.addEventListener('click', () => orderModal.setAttribute('aria-hidden', 'true'));

// Обработка отправки формы заказа
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Проверяем корзину
  if (Object.keys(cart).length === 0) {
  alert('Корзина пуста! Добавьте товары перед оформлением.');
  return;
    }

  // Проверяем телефон
  const phone = document.getElementById('phone').value.trim();
  const digits = phone.replace(/\D/g, ''); // оставляем только цифры

  if (digits.length < 10 || digits.length > 11) {
    alert('Введите корректный номер телефона (10–11 цифр).');
    return;
  }

  // показываем сообщение
  orderResult.textContent = 'Заказ создан!';
  // очищаем корзину
  cart = {};
  saveCart();
  updateCartUI();
  renderCartItems();
  setTimeout(() => {
    orderModal.setAttribute('aria-hidden', 'true');
    orderResult.textContent = '';
    orderForm.reset();
  }, 2000);
});

// Инициализация UI при загрузке
updateCartUI();
renderCartItems();
