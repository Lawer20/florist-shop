/* 
 * Card Payment Module for V.A.Y Studio
 * Handles Stripe integration and card payment processing
 */

// Note: BACKEND_API_URL is defined in main.js
// For local testing use: 'http://localhost:5000'


// Stripe variables
let stripe = null;
let stripeElements = null;
let cardElement = null;
let currentPaymentIntentId = null;

/* --- Stripe Initialization --- */
async function initStripe() {
    try {
        // Check if Stripe.js is loaded
        if (typeof Stripe === 'undefined') {
            console.warn('Stripe.js not loaded. Card payments will not be available.');
            hideCardPaymentOption();
            return false;
        }

        // Get Stripe publishable key from backend
        const response = await fetch(`${BACKEND_API_URL}/api/config`);
        if (!response.ok) {
            console.warn('Could not fetch Stripe config. Card payments disabled.');
            hideCardPaymentOption();
            return false;
        }

        const config = await response.json();
        // DEBUG: Alert key prefix
        const keyPrefix = config.stripePublishableKey ? config.stripePublishableKey.substring(0, 7) : 'NONE';
        alert(`DEBUG: Stripe Config Loaded. Key starts with: ${keyPrefix}`);

        if (!config.stripePublishableKey) {
            console.warn('No Stripe key available');
            hideCardPaymentOption();
            return false;
        }

        // Security Check: Ensure it's a Publishable Key (pk_), not Secret Key (sk_)
        if (config.stripePublishableKey.startsWith('sk_')) {
            console.error('SECURITY ERROR: Secret Key used as Publishable Key!');
            alert('Configuration Error: The site is using a Stripe Secret Key (sk_...) instead of a Publishable Key (pk_...). Please update STRIPE_PUBLISHABLE_KEY in Railway.');
            hideCardPaymentOption();
            return false;
        }

        // Initialize Stripe
        stripe = Stripe(config.stripePublishableKey);
        stripeElements = stripe.elements();
        console.log('✅ Stripe initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        alert(`DEBUG: Error initializing Stripe: ${error.message}`);
        hideCardPaymentOption();
        return false;
    }
}

function hideCardPaymentOption() {
    const cardOption = document.querySelector('input[name="payment"][value="card"]');
    if (cardOption) {
        const paymentOptionDiv = cardOption.closest('.payment-option');
        if (paymentOptionDiv) {
            paymentOptionDiv.style.display = 'none';
        }
    }
}

/* --- Card Element Management --- */
function initCardElement() {
    alert('DEBUG: initCardElement called');
    if (!stripe || !stripeElements) {
        alert('DEBUG: Stripe not ready yet (stripe or stripeElements is null)');
        return;
    }

    const cardContainer = document.getElementById('card-element-container');
    const cardErrors = document.getElementById('card-errors');

    if (!cardContainer) {
        console.warn('Card element container not found in HTML');
        return;
    }

    // Clear existing content
    cardContainer.innerHTML = '';
    if (cardErrors) cardErrors.textContent = '';

    // Only create card element if card payment is selected
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    alert(`DEBUG: Selected payment: ${selectedPayment ? selectedPayment.value : 'None'}`);

    if (selectedPayment && selectedPayment.value === 'card') {
        // Create and mount card element
        if (cardElement) {
            cardElement.unmount();
        }

        try {
            cardElement = stripeElements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#333',
                        fontFamily: 'Montserrat, sans-serif',
                        '::placeholder': {
                            color: '#aab7c4'
                        },
                        padding: '12px'
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a'
                    }
                },
                hidePostalCode: true
            });

            alert('DEBUG: Mounting card element...');
            cardElement.mount(cardContainer);
            cardContainer.classList.remove('hidden');
        } catch (e) {
            alert(`DEBUG: Error mounting card: ${e.message}`);
        }

        // Handle real-time validation errors
        cardElement.on('change', function (event) {
            if (cardErrors) {
                if (event.error) {
                    cardErrors.textContent = event.error.message;
                    cardErrors.style.display = 'block';
                } else {
                    cardErrors.textContent = '';
                    cardErrors.style.display = 'none';
                }
            }
        });

        cardContainer.classList.remove('hidden');
    } else {
        cardContainer.classList.add('hidden');
        if (cardElement) {
            cardElement.unmount();
            cardElement = null;
        }
    }
}

// Handle payment method change
function handlePaymentMethodChange() {
    initCardElement();
}

/* --- Card Payment Processing --- */
async function processCardPayment(orderData, cartData) {
    const grandTotal = cartData.reduce((sum, item) => sum + item.totalPrice, 0);

    try {
        //Step 1: Create Payment Intent
        console.log('Creating payment intent...');
        const piResponse = await fetch(`${BACKEND_API_URL}/api/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: grandTotal,
                customer_name: orderData.name,
                customer_phone: orderData.phone,
                delivery_date: orderData.date
            })
        });

        if (!piResponse.ok) {
            const error = await piResponse.json();
            throw new Error(error.error || 'Failed to create payment intent');
        }

        const { clientSecret, paymentIntentId } = await piResponse.json();
        currentPaymentIntentId = paymentIntentId;
        console.log('Payment intent created:', paymentIntentId);

        // Step 2: Confirm card payment with Stripe
        console.log('Confirming card payment...');
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: orderData.name,
                    phone: orderData.phone,
                    address: {
                        line1: orderData.address
                    }
                }
            }
        });

        if (error) {
            console.error('Payment confirmation error:', error);
            throw new Error(error.message);
        }

        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Payment was not successful');
        }

        console.log('Payment succeeded!');

        // Step 3: Save order to backend database
        console.log('Saving order to database...');
        const confirmResponse = await fetch(`${BACKEND_API_URL}/api/confirm-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_name: orderData.name,
                customer_phone: orderData.phone,
                customer_email: orderData.email || '',
                delivery_address: orderData.address,
                delivery_date: orderData.date,
                delivery_time: orderData.time,
                items: cartData.map(item => ({
                    product: `${item.product.title} [${item.size ? item.size.name : 'Standard'}]`,
                    addons: item.addons.map(a => a.name),
                    price: item.totalPrice
                })),
                total_amount: grandTotal,
                payment_method: 'card',
                payment_intent_id: paymentIntentId,
                timestamp: new Date().toISOString()
            })
        });

        if (!confirmResponse.ok) {
            const error = await confirmResponse.json();
            // Payment succeeded but order save failed - log this for manual review
            console.error('Order save failed but payment succeeded!', error);
            throw new Error('Payment processed but order confirmation failed. Please contact us with your payment confirmation.');
        }

        const result = await confirmResponse.json();
        console.log('Order saved successfully:', result.order_id);

        return {
            success: true,
            orderId: result.order_id,
            paymentIntentId: paymentIntentId
        };

    } catch (error) {
        console.error('Card payment error:', error);
        return {
            success: false,
            error: error.message || 'Payment processing failed'
        };
    }
}

// Export functions to global scope
window.initStripe = initStripe;
window.initCardElement = initCardElement;
window.handlePaymentMethodChange = handlePaymentMethodChange;
window.processCardPayment = processCardPayment;
