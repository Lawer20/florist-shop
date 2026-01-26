from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import json
from datetime import datetime

from config import config
from models import Base, Order, PaymentStatus
from stripe_service import StripeService
from email_service import EmailService

# Initialize Flask app
app = Flask(__name__)

# Load configuration
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config[env])

# Setup CORS
CORS(app, resources={
    r"/api/*": {
        "origins": [
            app.config['FRONTEND_URL'], 
            "https://vay-studio.netlify.app",  # Production frontend
            "http://127.0.0.1:5500", 
            "http://localhost:5500",
            "http://127.0.0.1:8000",
            "http://localhost:8000"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize database
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

# Initialize services
stripe_service = StripeService(app.config['STRIPE_SECRET_KEY'])
email_service = EmailService(
    smtp_host=app.config['SMTP_HOST'],
    smtp_port=app.config['SMTP_PORT'],
    smtp_user=app.config['SMTP_USER'],
    smtp_password=app.config['SMTP_PASSWORD'],
    notification_email=app.config['NOTIFICATION_EMAIL']
)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'environment': env
    }), 200

@app.route('/api/config', methods=['GET'])
def get_config():
    """Return public configuration for frontend"""
    return jsonify({
        'stripePublishableKey': app.config['STRIPE_PUBLISHABLE_KEY']
    }), 200

@app.route('/api/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """Create a Stripe Payment Intent"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'amount' not in data:
            return jsonify({'error': 'Amount is required'}), 400
        
        amount = float(data['amount'])
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        # Extract metadata for tracking
        metadata = {
            'customer_name': data.get('customer_name', ''),
            'customer_phone': data.get('customer_phone', ''),
            'delivery_date': data.get('delivery_date', ''),
            'order_timestamp': datetime.utcnow().isoformat()
        }
        
        # Create payment intent
        payment_intent = stripe_service.create_payment_intent(
            amount=amount,
            currency='usd',
            metadata=metadata
        )
        
        return jsonify({
            'clientSecret': payment_intent.client_secret,
            'paymentIntentId': payment_intent.id
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error creating payment intent: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/confirm-order', methods=['POST'])
def confirm_order():
    """Confirm and save order after successful payment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customer_name', 'customer_phone', 'delivery_address', 
                          'delivery_date', 'delivery_time', 'items', 'total_amount', 
                          'payment_method']
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Create database session
        session = Session()
        
        try:
            # Convert items to JSON string if it's not already
            items_json = json.dumps(data['items']) if isinstance(data['items'], list) else data['items']
            
            # Create new order
            order = Order(
                customer_name=data['customer_name'],
                customer_phone=data['customer_phone'],
                customer_email=data.get('customer_email'),
                delivery_address=data['delivery_address'],
                delivery_date=data['delivery_date'],
                delivery_time=data['delivery_time'],
                items_json=items_json,
                total_amount=float(data['total_amount']),
                payment_method=data['payment_method'],
                payment_status=PaymentStatus.SUCCEEDED if data['payment_method'] == 'card' else PaymentStatus.PENDING,
                stripe_payment_intent_id=data.get('payment_intent_id'),
                notes=data.get('notes', '')
            )
            
            session.add(order)
            session.commit()
            
            # Prepare order data for emails
            order_dict = order.to_dict()
            
            # Send email notifications (async would be better in production)
            try:
                email_service.send_owner_notification(order_dict)
                if data.get('customer_email'):
                    email_service.send_customer_confirmation(order_dict)
            except Exception as email_error:
                app.logger.error(f"Email notification error: {str(email_error)}")
                # Don't fail the order if email fails
            
            return jsonify({
                'success': True,
                'order_id': order.id,
                'message': 'Order confirmed successfully'
            }), 201
            
        except Exception as db_error:
            session.rollback()
            raise db_error
        finally:
            session.close()
            
    except Exception as e:
        app.logger.error(f"Error confirming order: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/webhook/stripe', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events"""
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe_service.verify_webhook_signature(
            payload, 
            sig_header, 
            app.config['STRIPE_WEBHOOK_SECRET']
        )
    except Exception as e:
        app.logger.error(f"Webhook signature verification failed: {str(e)}")
        return jsonify({'error': str(e)}), 400
    
    # Handle different event types
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        app.logger.info(f"Payment succeeded: {payment_intent['id']}")
        
        # Update order status in database
        session = Session()
        try:
            order = session.query(Order).filter_by(
                stripe_payment_intent_id=payment_intent['id']
            ).first()
            
            if order:
                order.payment_status = PaymentStatus.SUCCEEDED
                order.stripe_charge_id = payment_intent.get('latest_charge')
                session.commit()
        except Exception as e:
            session.rollback()
            app.logger.error(f"Error updating order status: {str(e)}")
        finally:
            session.close()
            
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        app.logger.warning(f"Payment failed: {payment_intent['id']}")
        
        # Update order status in database
        session = Session()
        try:
            order = session.query(Order).filter_by(
                stripe_payment_intent_id=payment_intent['id']
            ).first()
            
            if order:
                order.payment_status = PaymentStatus.FAILED
                session.commit()
        except Exception as e:
            session.rollback()
            app.logger.error(f"Error updating order status: {str(e)}")
        finally:
            session.close()
    
    return jsonify({'success': True}), 200

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders (for admin dashboard - add authentication in production)"""
    try:
        session = Session()
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Query orders
        orders = session.query(Order).order_by(
            Order.created_at.desc()
        ).limit(limit).offset(offset).all()
        
        session.close()
        
        return jsonify({
            'orders': [order.to_dict() for order in orders],
            'count': len(orders)
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error fetching orders: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order by ID"""
    try:
        session = Session()
        order = session.query(Order).filter_by(id=order_id).first()
        session.close()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify(order.to_dict()), 200
        
    except Exception as e:
        app.logger.error(f"Error fetching order: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"\n{'='*50}")
    print(f"🌸 V.A.Y Studio Backend Server")
    print(f"{'='*50}")
    print(f"Environment: {env}")
    print(f"Port: {port}")
    print(f"Debug: {debug}")
    print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"{'='*50}\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
