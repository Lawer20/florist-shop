// Data is now loaded from js/data.js

// Backend API Configuration
const BACKEND_API_URL = 'https://florist-shop-production.up.railway.app';

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
document.addEventListener('DOMContentLoaded', async () => {
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
    initDatePickers(); // Initialize date restrictions

    // Initialize Stripe for card payments (from card_payment.js module)
    if (typeof initStripe !== 'undefined') {
        await initStripe();
    }

    // Sticky Header Scroll Logic
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            const isScrolled = window.scrollY > 50;

            // Allow resizing on all pages
            header.classList.toggle('scrolled', isScrolled);

            // Only toggle transparent/solid color on homepage (or where specified)
            if (header.dataset.scroll === 'toggle') {
                header.classList.toggle('solid', isScrolled);
            }
        });
    }
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

/* --- Date/Time Picker Initialization (Flatpickr) --- */
function initDatePickers() {
    const dateInput = document.getElementById('cust-date');
    if (dateInput && typeof flatpickr !== 'undefined') {
        // Calculate tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Initialize Flatpickr with custom options
        flatpickr(dateInput, {
            minDate: tomorrow,
            defaultDate: tomorrow,
            dateFormat: "m/d/Y",
            disableMobile: true, // Use custom picker on mobile too
            animate: true,
            locale: {
                firstDayOfWeek: 0 // Sunday
            },
            onChange: function (selectedDates, dateStr) {
                // Optional: Add any callback logic here
            }
        });
    } else if (dateInput) {
        // Fallback for when Flatpickr is not loaded
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
        dateInput.value = minDate;
    }
}


/* --- Size Logic --- */
const SIZES = [
    { id: 'standard', name: 'Standard (12 Stems)', multiplier: 1.0 },
    { id: 'deluxe', name: 'Deluxe (24 Stems)', multiplier: 1.7 },
    { id: 'premium', name: 'Premium (36 Stems)', multiplier: 2.4 }
];

let currentSize = SIZES[0];

function openModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    // Reset State
    currentSize = SIZES[0]; // Reset to Standard
    currentTotal = currentProduct.price;

    // UI Updates
    document.getElementById('modal-product-title').textContent = `Customize: ${currentProduct.title}`;

    renderSizes();
    renderAddons();
    updateTotal(); // Calc total with default size

    document.getElementById('custom-modal').classList.remove('hidden');
}

function renderSizes() {
    const list = document.getElementById('size-options');
    if (!list) return;

    list.innerHTML = SIZES.map(size => {
        const price = (currentProduct.price * size.multiplier).toFixed(0);
        const isSelected = size.id === currentSize.id ? 'active' : '';

        return `
        <div class="size-option ${isSelected}" onclick="selectSize('${size.id}')">
            <span class="size-name">${size.name}</span>
            <span class="size-price">$${price}</span>
        </div>
        `;
    }).join('');
}

function selectSize(sizeId) {
    currentSize = SIZES.find(s => s.id === sizeId);

    // Update visual selection
    document.querySelectorAll('.size-option').forEach(el => el.classList.remove('active'));
    // Simple way to find the clicked one, or re-render. Re-render is safer for state sync but let's just re-render to be safe and fast? 
    // Actually re-rendering sizes is fine.
    renderSizes();

    updateTotal();
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

    const basePrice = currentProduct.price * currentSize.multiplier;
    currentTotal = basePrice + addonsNative;
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
        size: currentSize, // Store selected size
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
                <span class="cart-item-size" style="font-size: 0.85rem; color: #666; display:block;">Size: ${item.size ? item.size.name : 'Standard'}</span>
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

// Google Sheets Web App URL (Version 5 - Specific Fix)
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby89vSJM_7ttQFRljua3DlD4wb14lHz4xPcVDVa101lA_twikPdg4n9Erdh8FsQJNPG/exec';

/* --- Stripe Initialization --- */
async function initStripe() {
    try {
        // Check if Stripe.js is loaded
        if (typeof Stripe === 'undefined') {
            console.warn('Stripe.js not loaded. Card payments will not be available.');
            return;
        }

        // Get Stripe publishable key from backend
        const response = await fetch(`${BACKEND_API_URL}/api/config`);
        if (!response.ok) {
            console.warn('Could not fetch Stripe config. Using fallback mode.');
            return;
        }

        const config = await response.json();
        if (!config.stripePublishableKey) {
            console.warn('No Stripe key available');
            return;
        }

        // Initialize Stripe
        stripe = Stripe(config.stripePublishableKey);
        stripeElements = stripe.elements();
        console.log('✅ Stripe initialized successfully');
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        // Card payments will be disabled but other payment methods work
    }
}

function openCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    closeModal('cart-modal');

    // Calculate total for checkout view
    const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    document.getElementById('checkout-total').textContent = `$${grandTotal.toFixed(2)}`;

    // Reset payment method selection
    const cardRadio = document.querySelector('input[name="payment"][value="card"]');
    if (cardRadio) cardRadio.checked = true;

    document.getElementById('checkout-modal').classList.remove('hidden');

    // Initialize card element if Stripe is available and card payment is selected
    setTimeout(() => {
        initCardElement();
    }, 100);
}

async function sendOrderToGoogleSheets(orderData) {
    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'text/plain',
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
    // Checkout process started
    try {
        // Form validation
        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const address = document.getElementById('cust-address').value.trim();

        // Safety check for stale HTML
        const dateEl = document.getElementById('cust-date');
        if (!dateEl) {
            alert('Please refresh the page (Ctrl+F5). Your browser is using an old version of the site.');
            return;
        }

        const date = dateEl.value;
        const time = document.getElementById('cust-time').value;
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

        if (!date) {
            alert('Please select a preferred date.');
            document.getElementById('cust-date').focus();
            return;
        }

        // Validate date is not today or in the past (extra check beyond HTML min)
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate <= today) {
            alert('Same-day orders are not available. Please select a date starting from tomorrow.');
            document.getElementById('cust-date').focus();
            return;
        }

        if (!time) {
            alert('Please select a delivery time.');
            document.getElementById('cust-time').focus();
            return;
        }

        if (!paymentMethodEl) {
            alert('Please select a payment method.');
            return;
        }

        const paymentMethod = paymentMethodEl.value;
        const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = paymentMethod === 'card' ? 'Processing payment...' : 'Submitting...';
        submitBtn.disabled = true;

        // Route to appropriate payment handler
        if (paymentMethod === 'card' && typeof processCardPayment !== 'undefined') {
            // Prepare order data for card payment
            const orderData = {
                name: name,
                phone: phone,
                email: document.getElementById('cust-email') ? document.getElementById('cust-email').value.trim() : '',
                address: address,
                date: date,
                time: time
            };

            // Process card payment through Stripe
            processCardPayment(orderData, cart).then(result => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                if (result.success) {
                    // Show success modal
                    showSuccessModal(name, grandTotal, 'card', phone);

                    // Clear cart and close checkout
                    clearCart();
                    closeModal('checkout-modal');
                    event.target.reset();
                } else {
                    alert(`Payment failed: ${result.error}\n\nPlease try again or choose a different payment method.`);
                }
            }).catch(err => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('Payment error: ' + err.message);
            });
        } else {
            // Handle traditional payment methods (Zelle/PayPal/Cash) via Google Sheets
            const orderData = {
                name: name,
                phone: phone,
                address: address,
                date: date,
                time: time,
                // Script expects 'items' as an array of objects
                items: cart.map(item => ({
                    product: `${item.product.title} [${item.size ? item.size.name : 'Standard'}]`,
                    // Script logic: `${item.product}${addons} ($${item.price.toFixed(2)})`
                    // We should pass 'addons' as array of strings if script expects it, or handle here.
                    // Script: const addons = item.addons.length > 0 ? ...
                    addons: item.addons.map(a => a.name),
                    price: item.totalPrice
                })),
                total: grandTotal,
                paymentMethod: paymentMethod,
                timestamp: new Date().toISOString()
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

                // Show Success Modal instead of Alert
                showSuccessModal(name, parseFloat(grandTotal), paymentMethod, phone);

                // Clear cart properly and close checkout
                clearCart();
                closeModal('checkout-modal');

                // Reset form
                event.target.reset();
            });
        }

    } catch (err) {
        alert('Unexpected error in checkout: ' + err.message);
        console.error(err);
    }
}


function showSuccessModal(name, total, paymentMethod, phone) {
    const intro = document.getElementById('success-intro');
    const instructions = document.getElementById('payment-instructions');

    intro.textContent = `Thank you, ${name}! Your order for $${total.toFixed(2)} has been submitted successfully.`;

    let payHtml = '';
    if (paymentMethod === 'zelle') {
        payHtml = `
            <h4>Zelle Payment</h4>
            <p>Please send <strong>$${total.toFixed(2)}</strong> to:</p>
            <p><strong>Phone: 734-858-8724</strong></p>
            <p style="font-size: 0.85rem; margin-top: 10px; opacity: 0.8;">Note: Use your phone number (${phone}) so we can identify your order.</p>
        `;
    } else if (paymentMethod === 'paypal') {
        payHtml = `
            <h4>PayPal Payment</h4>
            <p>Please send <strong>$${total.toFixed(2)}</strong> to:</p>
            <p><strong>Email: florist.vay.studio@gmail.com</strong></p>
            <p style="font-size: 0.85rem; margin-top: 10px; opacity: 0.8;">Note: Use your name (${name}) so we can identify your order.</p>
        `;
    } else {
        payHtml = `
            <h4>Cash on Delivery</h4>
            <p>Please have <strong>$${total.toFixed(2)}</strong> ready in cash upon delivery.</p>
        `;
    }

    instructions.innerHTML = payHtml;
    document.getElementById('success-modal').classList.remove('hidden');
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
