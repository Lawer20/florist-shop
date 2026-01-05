// Data is now loaded from js/data.js


/* --- State --- */
let currentProduct = null;
let currentTotal = 0;
let cart = [];

/* --- LocalStorage Helpers --- */
function saveCartToStorage() {
    try {
        localStorage.setItem('vita-flowers-cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
    }
}

function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem('vita-flowers-cart');
        if (saved) {
            cart = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load cart from localStorage:', e);
        cart = [];
    }
}

function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartCount();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from storage first
    loadCartFromStorage();

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

    // Sticky Header Scroll Logic
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('solid');
        } else {
            header.classList.remove('solid');
        }
    });
});

// Renaming to generic render function we can reuse
function renderProductGrid(container, items) {
    if (!container) return;

    container.innerHTML = items.map(product => `
        <div class="product-card" onclick="openModal(${product.id})" style="cursor: pointer;">
            <div class="img-wrapper">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="btn btn-secondary" style="color: #333; border-color: #333;" onclick="event.stopPropagation(); openModal(${product.id})">Customize</button>
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
    saveCartToStorage();
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
    saveCartToStorage();
    updateCartCount();
    renderCart();
}

/* --- Checkout Logic --- */

// Google Sheets Web App URL
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxh4CXrWsPyL2uVF3aaY66M-b4b2BCUycpqqkYlAQY7Nfldjvfdb0QuZ6QUUfC-6g7M/exec';

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

async function sendOrderToGoogleSheets(orderData) {
    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        // Note: no-cors mode means we can't read the response, but the request will succeed
        return { success: true };
    } catch (error) {
        console.error('Error sending to Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

function processCheckout(event) {
    event.preventDefault();

    // Form validation
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const paymentMethodEl = document.querySelector('input[name="payment"]:checked');

    if (!name) {
        alert('Please enter your name.');
        document.getElementById('cust-name').focus();
        return;
    }

    if (!phone) {
        alert('Please enter your phone number.');
        document.getElementById('cust-phone').focus();
        return;
    }

    if (!address) {
        alert('Please enter your delivery address.');
        document.getElementById('cust-address').focus();
        return;
    }

    if (!paymentMethodEl) {
        alert('Please select a payment method.');
        return;
    }

    const paymentMethod = paymentMethodEl.value;
    const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    // Prepare order data for Google Sheets
    const orderData = {
        name: name,
        phone: phone,
        address: address,
        items: cart.map(item => ({
            product: item.product.title,
            addons: item.addons.map(a => a.name),
            price: item.totalPrice
        })),
        total: grandTotal,
        paymentMethod: paymentMethod
    };

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    // Send to Google Sheets
    sendOrderToGoogleSheets(orderData).then(result => {
        // Re-enable button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Show payment instructions
        let message = `Thank you, ${name}!\n\nOrder Total: $${grandTotal.toFixed(2)}\nDelivery to: ${address}\n\n`;

        if (paymentMethod === 'zelle') {
            message += `Please send Zelle payment to: 734-858-8724\nUse your Order Phone Number (${phone}) as the note.`;
        } else if (paymentMethod === 'paypal') {
            message += `Please send PayPal payment to: troxymchukviktoria@gmail.com\nUse your Name as the note.`;
        } else {
            message += `Please have cash ready upon delivery.`;
        }

        message += '\n\n✅ Your order has been submitted successfully!';

        alert(message);

        // Clear cart properly and close
        clearCart();
        closeModal('checkout-modal');

        // Reset form
        event.target.reset();
    });
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
