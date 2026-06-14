// Data is now loaded from js/data.js

// Backend API Configuration
// Backend API Configuration
// NOTE: BACKEND_API_URL is defined in card_payment.js which loads before this file
// const BACKEND_API_URL = 'https://florist-shop-production.up.railway.app';

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
        const featuredProducts = products.filter(p => p.featured && !p.hidden);
        renderProductGrid(grid, featuredProducts);
    }

    initMobileMenu();
    updateCartCount();
    initDatePickers(); // Initialize date restrictions
    initSeasonalSection(); // Initialize seasonal section
    initWeddingSection(); // Initialize wedding section
    initScrollToTop(); // Initialize scroll-to-top button

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

    container.innerHTML = items.map(product => {
        let displayPrice;

        // Calculate lowest price for display
        if (product.sizes && product.sizes.length > 0) {
            displayPrice = Math.min(...product.sizes.map(s => s.price));
        } else {
            // Fallback to base price
            displayPrice = product.price;
        }

        return `
        <div class="product-card" onclick="openModal(${product.id})" style="cursor: pointer;">
            <div class="img-wrapper">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p class="price">From $${displayPrice.toFixed(2)}</p>
                <button class="btn btn-secondary" style="color: #333; border-color: #333;" onclick="event.stopPropagation(); openModal(${product.id})">Customize</button>
            </div>
        </div>
        `;
    }).join('');
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
    { id: 'small', name: 'Small (12 Stems)', multiplier: 1.0 },
    { id: 'medium', name: 'Medium (24 Stems)', multiplier: 1.7 },
    { id: 'large', name: 'Large (36 Stems)', multiplier: 2.4 }
];

let currentSizesOptions = [];
let currentSize = null;

function openModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    // Reset State
    currentSizesOptions = currentProduct.sizes || SIZES;

    // Default to Medium (Index 1) if available, otherwise 0
    const defaultIndex = 1;
    currentSize = currentSizesOptions[defaultIndex] || currentSizesOptions[0];

    // Calculate initial total
    if (currentSize.price) {
        currentTotal = currentSize.price;
    } else {
        currentTotal = currentProduct.price * (currentSize.multiplier || 1.7);
    }

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

    list.innerHTML = currentSizesOptions.map(size => {
        let price;
        if (size.price) {
            price = size.price.toFixed(0);
        } else {
            price = (currentProduct.price * size.multiplier).toFixed(0);
        }

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
    currentSize = currentSizesOptions.find(s => s.id === sizeId);

    // Update visual selection
    document.querySelectorAll('.size-option').forEach(el => el.classList.remove('active'));
    // Simple way to find the clicked one, or re-render. Re-render is safer for state sync but let's just re-render to be safe and fast? 
    // Actually re-rendering sizes is fine.
    renderSizes();

    updateTotal();
}


function renderAddons() {
    const list = document.getElementById('addons-list');
    if (!list) return;
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
    if (modalId === 'cart-modal') {
        updateCartCount();
    }
}

function updateTotal() {
    let addonsNative = 0;
    const checkboxes = document.querySelectorAll('#addons-list input[type="checkbox"]:checked');

    checkboxes.forEach(cb => {
        const addon = addOns.find(a => a.id === cb.value);
        if (addon) addonsNative += addon.price;
    });

    let basePrice;
    if (currentSize.price) {
        basePrice = currentSize.price;
    } else {
        basePrice = currentProduct.price * currentSize.multiplier;
    }

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
    updateCartCount(true);

    // Close Modal
    closeModal('custom-modal');

    // Open Cart directly
    openCart();
}

function updateCartCount(animate = false) {
    const count = cart.length;
    const el = document.getElementById('cart-count');
    el.textContent = count;
    if (animate) {
        el.classList.remove('bounce');
        void el.offsetWidth;
        el.classList.add('bounce');
    }
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
// initStripe is now handled by card_payment.js


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
        const email = document.getElementById('cust-email') ? document.getElementById('cust-email').value.trim() : '';
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

        // Email is critical now for notifications
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address.');
            if (document.getElementById('cust-email')) document.getElementById('cust-email').focus();
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
                email: email,
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
            // Handle traditional payment methods (Zelle/Cash) via Google Sheets
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


/* --- Seasonal Section --- */
function initSeasonalSection() {
    const section = document.getElementById('seasonal-section');
    if (!section) return;

    // Hide if not active or no items
    if (!seasonalCollection || !seasonalCollection.active || !seasonalCollection.items || seasonalCollection.items.length === 0) {
        section.style.display = 'none';
        return;
    }

    // Update title/subtitle from config
    const titleEl = document.getElementById('seasonal-title');
    const subtitleEl = document.getElementById('seasonal-subtitle');
    if (titleEl) titleEl.textContent = seasonalCollection.title;
    if (subtitleEl) subtitleEl.textContent = seasonalCollection.subtitle;

    // Render cards
    const cardsContainer = document.getElementById('seasonal-cards');
    if (!cardsContainer) return;

    cardsContainer.innerHTML = seasonalCollection.items.map(product => {
        const startingPrice = product.sizes ? product.sizes[0].price : product.price;
        const imgStyle = product.id === 107
            ? 'style="object-fit: contain; background: #fdf8f2; padding: 4px;"'
            : '';
        return `
        <div class="seasonal-card" onclick="openModal(${product.id})">
            <div class="seasonal-card-ribbon">${product.seasonTag || 'Seasonal'}</div>
            <div class="seasonal-card-img">
                <img src="${product.image}" alt="${product.title}" loading="lazy" ${imgStyle}>
            </div>
            <div class="seasonal-card-body">
                <h3>${product.title}</h3>
                <p class="seasonal-card-price">From $${startingPrice.toFixed(2)}</p>
                <button class="btn-seasonal-card" onclick="event.stopPropagation(); openModal(${product.id})">Customize</button>
            </div>
        </div>
        `;
    }).join('');

    // Show section
    section.style.display = 'block';
}

/* --- Wedding Section --- */
let _weddingIsScrolling = false;

function initWeddingSection() {
    const section = document.getElementById('wedding-section');
    if (!section) return;
    if (!weddingCollection || !weddingCollection.active || !weddingCollection.items || weddingCollection.items.length === 0) {
        section.style.display = 'none';
        return;
    }

    const cardsContainer = document.getElementById('wedding-cards');
    if (!cardsContainer) return;

    const buildCard = (product) => {
        const price = product.sizes ? product.sizes[0].price : product.price;
        return `
        <div class="wedding-card" onclick="openModal(${product.id})">
            <div class="wedding-card-img">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="wedding-card-body">
                <h3>${product.title}</h3>
                <p class="wedding-card-price">From $${price.toFixed(2)}</p>
                <button class="btn-wedding-card" onclick="event.stopPropagation(); openModal(${product.id})">Add to Cart</button>
            </div>
        </div>
        `;
    };

    const items = weddingCollection.items;

    // For a smooth CSS marquee, we need enough elements so the duplication covers the screen width twice
    // We'll duplicate the original array a few times to ensure it's wide enough for all screens
    const originalCardsHTML = items.map(buildCard).join('');

    // Create 4 sets of the cards to ensure continuous scrolling
    cardsContainer.innerHTML =
        originalCardsHTML +
        originalCardsHTML +
        originalCardsHTML +
        originalCardsHTML;
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
            <p><strong>📧 florist.vay.studio@gmail.com</strong></p>
            <p style="font-size: 0.85rem; margin-top: 10px; opacity: 0.8;">Note: Use your phone number (${phone}) so we can identify your order.</p>
        `;
    } else if (paymentMethod === 'card') {
        payHtml = `
            <h4>Payment Successful</h4>
            <p>Your card has been charged <strong>$${total.toFixed(2)}</strong>.</p>
            <p>We have received your order and will begin preparing it shortly.</p>
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

/* --- Scroll-to-Top Button --- */
function initScrollToTop() {
    const btn = document.getElementById('scroll-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* --- Information Modals (Delivery & Privacy) --- */
function openDeliveryModal() {
    let modal = document.getElementById('delivery-info-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'delivery-info-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeModal('delivery-info-modal')"></div>
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Delivery Information</h3>
                    <button class="close-btn" onclick="closeModal('delivery-info-modal')">&times;</button>
                </div>
                <div class="modal-body" style="line-height: 1.6; color: #4A4A4A;">
                    <h4 style="font-family: var(--font-heading); margin-bottom: 5px; color: var(--color-heading); font-size: 1.2rem;">🚀 Delivery Areas & Rates</h4>
                    <p style="margin-bottom: 15px;">We hand-deliver fresh arrangements to Chicago and surrounding suburbs:</p>
                    <ul style="margin-left: 20px; margin-bottom: 20px;">
                        <li><strong>Elmwood Park (Local):</strong> Free Delivery</li>
                        <li><strong>Surrounding Suburbs (within 10 miles):</strong> $10.00</li>
                        <li><strong>Greater Chicago Area:</strong> $20.00</li>
                    </ul>
                    
                    <h4 style="font-family: var(--font-heading); margin-bottom: 5px; color: var(--color-heading); font-size: 1.2rem;">📅 Schedule & Policies</h4>
                    <ul style="margin-left: 20px; margin-bottom: 20px;">
                        <li>Deliveries are available <strong>Monday - Sunday, 9:00 AM to 7:00 PM</strong>.</li>
                        <li>All orders must be placed <strong>at least 1 day in advance</strong>.</li>
                        <li>For same-day inquiries, please contact us by phone: <a href="tel:+17348588724" style="color: var(--color-primary-dark); font-weight:600;">734-858-8724</a>.</li>
                    </ul>
                    <p style="font-size: 0.9rem; font-style: italic; color: #777;">Note: During peak holidays (Valentine's Day, Mother's Day), we recommend placing orders 3-5 days in advance.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal('delivery-info-modal')">Got it, thanks!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
}

function openPrivacyModal() {
    let modal = document.getElementById('privacy-policy-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'privacy-policy-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeModal('privacy-policy-modal')"></div>
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Privacy Policy</h3>
                    <button class="close-btn" onclick="closeModal('privacy-policy-modal')">&times;</button>
                </div>
                <div class="modal-body" style="line-height: 1.6; color: #4A4A4A; max-height: 350px; overflow-y: auto; padding-right: 10px;">
                    <p style="margin-bottom: 15px;">At V.A.Y Studio, we respect your privacy. This policy outlines how we handle your personal information.</p>
                    
                    <h4 style="font-family: var(--font-heading); margin-top: 15px; margin-bottom: 5px; color: var(--color-heading); font-size: 1.1rem;">Information Collection</h4>
                    <p style="margin-bottom: 15px;">We collect info you provide when placing an order: name, phone, email, and delivery address. Payment details are processed securely through Stripe and never stored on our servers.</p>
                    
                    <h4 style="font-family: var(--font-heading); margin-top: 15px; margin-bottom: 5px; color: var(--color-heading); font-size: 1.1rem;">Information Usage</h4>
                    <p style="margin-bottom: 15px;">Your data is used solely to process orders, deliver flowers, and contact you if issues arise. We never sell or share your data with third parties, except as required for delivery or payment processing.</p>
                    
                    <h4 style="font-family: var(--font-heading); margin-top: 15px; margin-bottom: 5px; color: var(--color-heading); font-size: 1.1rem;">Cookies & Tracking</h4>
                    <p style="margin-bottom: 15px;">We use basic cookies to keep track of your cart items and use Google Analytics to analyze website traffic and performance.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal('privacy-policy-modal')">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
}
