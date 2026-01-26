"""
Test script for Stripe integration
Run this to verify Stripe API connectivity and payment intent creation
"""

import os
from dotenv import load_dotenv
from stripe_service import StripeService

# Load environment variables
load_dotenv()

def test_stripe_connection():
    """Test Stripe API connection and payment intent creation"""
    
    print("🧪 Testing Stripe Integration\n")
    print("="*50)
    
    # Get Stripe API key
    api_key = os.getenv('STRIPE_SECRET_KEY')
    
    if not api_key:
        print("❌ ERROR: STRIPE_SECRET_KEY not found in .env file")
        print("Please create a .env file and add your Stripe secret key")
        return
    
    if not api_key.startswith('sk_test_'):
        print("⚠️  WARNING: Not using test API key!")
        print("   Make sure you're using test keys for development")
        print(f"   Current key starts with: {api_key[:7]}")
    
    # Initialize Stripe service
    stripe_service = StripeService(api_key)
    print(f"✅ Stripe service initialized")
    print(f"   Key: {api_key[:12]}...")
    
    # Test payment intent creation
    print("\n📝 Creating test payment intent...")
    
    try:
        payment_intent = stripe_service.create_payment_intent(
            amount=50.00,  # $50.00
            currency='usd',
            metadata={
                'test': 'true',
                'customer_name': 'Test Customer',
                'source': 'backend_test_script'
            }
        )
        
        print(f"✅ Payment Intent created successfully!")
        print(f"   ID: {payment_intent.id}")
        print(f"   Amount: ${payment_intent.amount / 100:.2f}")
        print(f"   Status: {payment_intent.status}")
        print(f"   Client Secret: {payment_intent.client_secret[:20]}...")
        
        # Test retrieving the payment intent
        print("\n📥 Retrieving payment intent...")
        retrieved = stripe_service.retrieve_payment_intent(payment_intent.id)
        print(f"✅ Successfully retrieved payment intent")
        print(f"   Status: {retrieved.status}")
        
        # Cancel the test payment intent
        print("\n🚫 Canceling test payment intent...")
        cancelled = stripe_service.cancel_payment_intent(payment_intent.id)
        print(f"✅ Payment intent cancelled")
        print(f"   Status: {cancelled.status}")
        
        print("\n" + "="*50)
        print("✨ All Stripe tests passed!")
        print("\nYou can now use the following test card numbers:")
        print("  Success: 4242 4242 4242 4242")
        print("  Decline: 4000 0000 0000 0002")
        print("  Any future expiry date and any 3-digit CVC")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check your Stripe API key in .env file")
        print("2. Make sure you have internet connection")
        print("3. Verify your Stripe account is active")
        return

if __name__ == '__main__':
    test_stripe_connection()
