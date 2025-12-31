// Data is now loaded from js/data.js


/* --- State --- */
let currentProduct = null;
let currentTotal = 0;
let cart = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // If we are on the homepage, render featured ONLY
    const grid = document.getElementById('product-grid');
    if (grid) {
        // Simple check: if this is homepage vs shop page
        // For now, index.html will use 'product-grid' and we filter for featured
        const featuredProducts = products.filter(p => p.featured);
        renderProductGrid(grid, featuredProducts);
    }

    initMobileMenu();
    updateCartCount();
});

// Renaming to generic render function we can reuse
function renderProductGrid(container, items) {
    if (!container) return;

    container.innerHTML = items.map(product => `
        <div class="product-card">
            <div class="img-wrapper">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="btn btn-secondary" style="color: #333; border-color: #333;" onclick="openModal(${product.id})">Customize</button>
            </div>
        </div>
    `).join('');
}

function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.main-nav');

    if (btn && nav) {
        btn.addEventListener('click', () => {
            nav.classList.toggle('open');
            btn.classList.toggle('open'); // for hamburger animation if needed
        });
    }
}

/* --- Modal Logic --- */

function openModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    // Reset State
    currentTotal = currentProduct.price;

    // UI Updates
    document.getElementById('modal-product-title').textContent = `Customize: ${currentProduct.title}`;

    renderAddons();
    updateTotalDisplay();

    document.getElementById('custom-modal').classList.remove('hidden');
}

function renderAddons() {
    const list = document.getElementById('addons-list');
    list.innerHTML = addOns.map(addon => `
        <label class="addon-option">
            <input type="checkbox" value="${addon.id}" onchange="updateTotal()">
            ${addon.image ? `<img src="${addon.image}" alt="${addon.name}" class="addon-img">` : ''}
            <div style="flex-grow:1; display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span class="addon-label">${addon.name}</span>
                <span class="addon-price">+$${addon.price.toFixed(0)}</span>
            </div>
        </label>
    `).join('');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function updateTotal() {
    let addonsNative = 0;
    const checkboxes = document.querySelectorAll('#addons-list input[type="checkbox"]:checked');

    checkboxes.forEach(cb => {
        const addon = addOns.find(a => a.id === cb.value);
        if (addon) addonsNative += addon.price;
    });

    currentTotal = currentProduct.price + addonsNative;
    updateTotalDisplay();
}

function updateTotalDisplay() {
    document.getElementById('modal-total-price').textContent = `$${currentTotal.toFixed(2)}`;
}

/* --- Cart Logic --- */

function confirmAddToCart() {
    // Collect Details
    const checkboxes = document.querySelectorAll('#addons-list input[type="checkbox"]:checked');
    const selectedAddons = Array.from(checkboxes).map(cb => {
        return addOns.find(a => a.id === cb.value);
    });

    const cartItem = {
        id: Date.now(), // simple unique id
        product: currentProduct,
        addons: selectedAddons,
        totalPrice: currentTotal
    };

    cart.push(cartItem);
    updateCartCount();

    // Close Modal
    closeModal('custom-modal');

    // Open Cart directly
    openCart();
}

function updateCartCount() {
    const count = cart.length;
    document.getElementById('cart-count').textContent = count;
}

function openCart() {
    renderCart();
    document.getElementById('cart-modal').classList.remove('hidden');
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        totalEl.textContent = '$0.00';
        return;
    }

    let grandTotal = 0;

    container.innerHTML = cart.map((item, index) => {
        grandTotal += item.totalPrice;

        const addonNames = item.addons.map(a => a.name).join(', ');
        const addonText = addonNames ? `+ ${addonNames}` : '';

        return `
        <div class="cart-item">
            <img src="${item.product.image}" class="cart-item-img" alt="${item.product.title}">
            <div class="cart-item-details">
                <span class="cart-item-title">${item.product.title}</span>
                ${addonText ? `<span class="cart-item-addons">${addonText}</span>` : ''}
                <div style="display:flex; justify-content:space-between; margin-top:5px;">
                     <span class="cart-item-price">$${item.totalPrice.toFixed(2)}</span>
                     <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    totalEl.textContent = `$${grandTotal.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
}

/* --- Checkout Logic --- */

function openCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    closeModal('cart-modal');

    // Calculate total for checkout view
    const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    document.getElementById('checkout-total').textContent = `$${grandTotal.toFixed(2)}`;

    document.getElementById('checkout-modal').classList.remove('hidden');
}

function processCheckout(event) {
    event.preventDefault();

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    let message = `Thank you, ${name}!\n\nOrder Total: $${grandTotal.toFixed(2)}\nDelivery to: ${address}\n\n`;

    if (paymentMethod === 'zelle') {
        message += `Please send Zelle payment to: 734-858-8724\nUse your Order Phone Number (${phone}) as the note.`;
    } else if (paymentMethod === 'paypal') {
        message += `Please send PayPal payment to: troxymchukviktoria@gmail.com\nUse your Name as the note.`;
    } else {
        message += `Please have cash ready upon delivery.`;
    }

    alert(message);

    // Clear cart and close
    updateCartCount();
    closeModal('checkout-modal');
}

/* --- PWA Service Worker Registration --- */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
