from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import enum

Base = declarative_base()

class PaymentStatus(enum.Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    REFUNDED = "refunded"

class Order(Base):
    """Order model for storing customer orders"""
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Customer Information
    customer_name = Column(String(200), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(200), nullable=True)
    
    # Delivery Information
    delivery_address = Column(Text, nullable=False)
    delivery_date = Column(String(50), nullable=False)
    delivery_time = Column(String(50), nullable=False)
    
    # Order Details (stored as JSON string)
    items_json = Column(Text, nullable=False)  # JSON string of cart items
    
    # Payment Information
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)  # 'card', 'zelle', 'paypal', 'cash'
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Stripe-specific fields
    stripe_payment_intent_id = Column(String(200), nullable=True)
    stripe_charge_id = Column(String(200), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Additional notes
    notes = Column(Text, nullable=True)
    
    def to_dict(self):
        """Convert order to dictionary"""
        return {
            'id': self.id,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'delivery_address': self.delivery_address,
            'delivery_date': self.delivery_date,
            'delivery_time': self.delivery_time,
            'items': self.items_json,
            'total_amount': self.total_amount,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status.value if self.payment_status else None,
            'stripe_payment_intent_id': self.stripe_payment_intent_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'notes': self.notes
        }
    
    def __repr__(self):
        return f"<Order {self.id}: {self.customer_name} - ${self.total_amount}>"
