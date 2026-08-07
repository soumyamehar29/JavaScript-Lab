const cartItems = [];

const cartForm = document.getElementById('cartForm');
const itemNameInput = document.getElementById('itemName');
const itemPriceInput = document.getElementById('itemPrice');
const cartItemsList = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const discountRateEl = document.getElementById('discountRate');
const discountAmountEl = document.getElementById('discountAmount');
const totalEl = document.getElementById('total');

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDiscountRate(total) {
  if (total >= 4100) return 0.5;
  if (total >= 3100) return 0.4;
  if (total >= 2100) return 0.3;
  if (total >= 1100) return 0.2;
  if (total >= 1000) return 0.1;
  return 0;
}

function getItemDiscount(item, rate) {
  return item.price * item.quantity * rate;
}

function updateQuantity(index, delta) {
  const item = cartItems[index];
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cartItems.splice(index, 1);
  }

  renderCart();
}

function renderCart() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountRate = getDiscountRate(subtotal);
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  if (cartItems.length === 0) {
    cartItemsList.innerHTML = '<li class="empty">Your cart is empty.</li>';
  } else {
    cartItemsList.innerHTML = cartItems
      .map(
        (item, index) => {
          const itemDiscount = getItemDiscount(item, discountRate);
          return `
            <li class="cart-item">
              <div class="item-info">
                <span>${item.name}</span>
                <strong>${formatCurrency(item.price)}</strong>
                <small>Qty ${item.quantity} · Discount ${formatCurrency(itemDiscount)}</small>
              </div>
              <div class="item-actions">
                <div class="quantity-control">
                  <button type="button" data-action="decrease" data-index="${index}">-</button>
                  <span>${item.quantity}</span>
                  <button type="button" data-action="increase" data-index="${index}">+</button>
                </div>
                <button type="button" class="remove-btn" data-action="remove" data-index="${index}">Remove</button>
              </div>
            </li>
          `;
        }
      )
      .join('');
  }

  subtotalEl.textContent = formatCurrency(subtotal);
  discountRateEl.textContent = `${(discountRate * 100).toFixed(0)}%`;
  discountAmountEl.textContent = formatCurrency(discountAmount);
  totalEl.textContent = formatCurrency(total);
}

cartItemsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const index = Number(button.dataset.index);

  if (action === 'decrease') {
    updateQuantity(index, -1);
  } else if (action === 'increase') {
    updateQuantity(index, 1);
  } else if (action === 'remove') {
    cartItems.splice(index, 1);
    renderCart();
  }
});

cartForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = itemNameInput.value.trim();
  const price = Number(itemPriceInput.value);

  if (!name || Number.isNaN(price) || price <= 0) {
    alert('Please enter a valid item and price.');
    return;
  }

  cartItems.push({ name, price, quantity: 1 });
  cartForm.reset();
  itemNameInput.focus();
  renderCart();
});

renderCart();
