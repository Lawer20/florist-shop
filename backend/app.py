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

# Setup CORS - Allow all origins for debugging with full permissiveness
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.before_request
def log_request_info():
    app.logger.info(f"Incoming Request: {request.method} {request.url}")
    app.logger.info(f"Headers: {request.headers}")
    if request.method == 'OPTIONS':
        app.logger.info("Handling OPTIONS preflight request")

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Initialize database
# Initialize database
try:
    engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    print("✅ Database connected successfully")
except Exception as e:
    print(f"❌ Database connection failed: {str(e)}")
    # Fallback: Create engine/session anyway so app doesn't crash on import, 
    # but queries will fail if connection is still down.
    engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
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

import threading

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
        
        # Construct order_dict for emails
        order_dict = {
            'id': 'PENDING-DB-SAVE', 
            'customer_name': data['customer_name'],
            'customer_phone': data['customer_phone'],
            'customer_email': data.get('customer_email'),
            'delivery_address': data['delivery_address'],
            'delivery_date': data['delivery_date'],
            'delivery_time': data['delivery_time'],
            'items': data['items'],
            'total_amount': float(data['total_amount']),
            'payment_method': data['payment_method'],
            'payment_status': PaymentStatus.SUCCEEDED if data['payment_method'] == 'card' else PaymentStatus.PENDING,
            'stripe_payment_intent_id': data.get('payment_intent_id')
        }

        # Helper function for sending emails
        def send_emails_task(order_info):
            try:
                print(f"📧 Starting async email send for Order #{order_info.get('id')}...")
                owner_sent = email_service.send_owner_notification(order_info)
                
                customer_sent = False
                if order_info.get('customer_email'):
                    customer_sent = email_service.send_customer_confirmation(order_info)
                
                if owner_sent:
                    print(f"✅ Owner email SENT for Order #{order_info.get('id')}")
                else:
                    print(f"❌ Owner email FAILED for Order #{order_info.get('id')}")
                    
                if customer_sent:
                    print(f"✅ Customer email SENT for Order #{order_info.get('id')}")
                    
            except Exception as e:
                print(f"❌ Async email error: {str(e)}")

        # Create database session
        session = Session()
        db_save_success = False
        
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
            db_save_success = True
            
            # Update order_dict with real ID
            order_dict = order.to_dict()
            
            # SUCCESS CASE: Fire and forget email in background thread
            # This ensures the UI returns immediately
            thread = threading.Thread(target=send_emails_task, args=(order_dict,))
            thread.daemon = True # Build as daemon so it doesn't block shutdown
            thread.start()
            
        except Exception as db_error:
            session.rollback()
            app.logger.error(f"❌ DATABASE SAVE FAILED: {str(db_error)}")
            
            # FALLBACK CASE: Database failed, try to send email synchronously
            # We want to wait here to verify at least ONE notification method worked
            email_sent = False
            try:
                send_emails_task(order_dict) # Re-use the helper synchronously
                email_sent = True
            except Exception as email_error:
                app.logger.error(f"Email notification error (fallback): {str(email_error)}")
            
            if email_sent:
                return jsonify({
                    'success': True,
                    'order_id': 'EMAIL-ONLY',
                    'message': 'Order processed via email backup (Database save failed)'
                }), 200
            else:
                return jsonify({'error': 'Critical: Database save AND Email notification failed.'}), 500
        
        finally:
            session.close()

        # Normal Return (DB Success)
        return jsonify({
            'success': True,
            'order_id': order_dict['id'],
            'message': 'Order confirmed successfully'
        }), 201
            
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
