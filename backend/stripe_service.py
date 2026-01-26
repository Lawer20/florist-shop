import stripe
from config import Config

class StripeService:
    """Service for handling Stripe payment operations"""
    
    def __init__(self, api_key):
        self.api_key = api_key
        stripe.api_key = api_key
    
    def create_payment_intent(self, amount, currency='usd', metadata=None):
        """
        Create a Stripe Payment Intent
        
        Args:
            amount: Amount in cents (e.g., 5000 for $50.00)
            currency: Currency code (default: 'usd')
            metadata: Optional dictionary of metadata
            
        Returns:
            Payment Intent object
        """
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Stripe expects amount in cents
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            return payment_intent
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {str(e)}")
    
    def verify_webhook_signature(self, payload, signature, webhook_secret):
        """
        Verify Stripe webhook signature
        
        Args:
            payload: Raw request body
            signature: Stripe-Signature header value
            webhook_secret: Webhook secret from Stripe dashboard
            
        Returns:
            Event object if signature is valid
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
            return event
        except ValueError as e:
            # Invalid payload
            raise Exception("Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            raise Exception("Invalid signature")
    
    def retrieve_payment_intent(self, payment_intent_id):
        """
        Retrieve a Payment Intent by ID
        
        Args:
            payment_intent_id: The Payment Intent ID
            
        Returns:
            Payment Intent object
        """
        try:
            return stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {str(e)}")
    
    def cancel_payment_intent(self, payment_intent_id):
        """
        Cancel a Payment Intent
        
        Args:
            payment_intent_id: The Payment Intent ID
            
        Returns:
            Cancelled Payment Intent object
        """
        try:
            return stripe.PaymentIntent.cancel(payment_intent_id)
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {str(e)}")
    
    def create_refund(self, payment_intent_id, amount=None):
        """
        Create a refund for a payment
        
        Args:
            payment_intent_id: The Payment Intent ID
            amount: Amount to refund in cents (None for full refund)
            
        Returns:
            Refund object
        """
        try:
            refund_params = {'payment_intent': payment_intent_id}
            if amount:
                refund_params['amount'] = int(amount * 100)
            
            return stripe.Refund.create(**refund_params)
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {str(e)}")
