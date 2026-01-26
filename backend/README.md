# V.A.Y Studio Backend

Backend server for V.A.Y Studio florist website with Stripe payment integration.

## Features

- 💳 Stripe payment processing with Payment Intents API
- 📧 Automated email notifications for orders
- 🗄️ SQLite (dev) / PostgreSQL (production) database
- 🔒 Secure webhook signature verification
- 🌐 CORS-enabled REST API
- 📊 Order management endpoints

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

**Required variables:**
- `STRIPE_SECRET_KEY` - Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- `STRIPE_PUBLISHABLE_KEY` - Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- `SMTP_USER` - Your Gmail address
- `SMTP_PASSWORD` - Gmail App Password (not your regular password!)

**How to get Gmail App Password:**
1. Go to your Google Account settings
2. Enable 2-factor authentication if not already enabled
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail"
5. Use this password in your `.env` file

### 4. Run Development Server

```bash
python app.py
```

Server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Get Stripe Config
```
GET /api/config
```
Returns Stripe publishable key for frontend.

### Create Payment Intent
```
POST /api/create-payment-intent
Content-Type: application/json

{
  "amount": 100.50,
  "customer_name": "John Doe",
  "customer_phone": "555-1234",
  "delivery_date": "2026-02-14"
}
```

### Confirm Order
```
POST /api/confirm-order
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_phone": "555-1234",
  "customer_email": "john@example.com",
  "delivery_address": "123 Main St",
  "delivery_date": "2026-02-14",
  "delivery_time": "14:00",
  "items": [...],
  "total_amount": 100.50,
  "payment_method": "card",
  "payment_intent_id": "pi_xxx"
}
```

### Get Orders (Admin)
```
GET /api/orders?limit=50&offset=0
```

### Stripe Webhook
```
POST /webhook/stripe
```
Handles Stripe payment events (configured in Stripe Dashboard).

## Testing with Stripe

Use these test card numbers:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

Use any future expiry date and any 3-digit CVC.

## Deployment to Railway

1. Create account at [Railway.app](https://railway.app)
2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
3. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```
4. Add environment variables in Railway dashboard
5. Railway will automatically provision PostgreSQL database

## Database Schema

### Orders Table
- `id` - Primary key
- `customer_name` - Customer name
- `customer_phone` - Contact phone
- `customer_email` - Email (optional)
- `delivery_address` - Delivery address
- `delivery_date` - Delivery date
- `delivery_time` - Delivery time
- `items_json` - Order items (JSON)
- `total_amount` - Total price
- `payment_method` - Payment type (card/zelle/paypal/cash)
- `payment_status` - Status enum
- `stripe_payment_intent_id` - Stripe PI ID
- `stripe_charge_id` - Stripe charge ID
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp
- `notes` - Additional notes

## Security Notes

- Never commit `.env` file to git
- Use HTTPS in production
- Implement proper authentication for admin endpoints
- Rotate API keys regularly
- Use Stripe webhook secret for signature verification

## Support

For issues or questions, contact: florist.vay.studio@gmail.com
