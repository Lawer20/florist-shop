import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import json

class EmailService:
    """Service for sending email notifications"""
    
    def __init__(self, smtp_host, smtp_port, smtp_user, smtp_password, notification_email, resend_api_key=None):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password
        self.notification_email = notification_email
        self.resend_api_key = resend_api_key
    
    def send_email(self, to_email, subject, html_content):
        """Send an HTML email via Resend API (preferred) or SMTP (fallback)"""
        
        # 1. Try Resend API first (Http is reliable on Railway)
        if self.resend_api_key:
            try:
                import requests
                print(f"📧 Sending via Resend API to {to_email}...")
                
                # Production Email Sending
                # Now that vay-flowers.com is verified, we can send to anyone.
                
                resp = requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {self.resend_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": "V.A.Y Studio <orders@vay-flowers.com>", 
                        "to": [to_email],
                        "subject": subject,
                        "html": html_content
                    },
                    timeout=10
                )
                
                if resp.status_code in [200, 201, 202]:
                    print(f"✅ Resend Success: {resp.json().get('id')}")
                    return True
                else:
                    print(f"⚠️ Resend Failed: {resp.text} - Falling back to SMTP...")
            except Exception as e:
                 print(f"⚠️ Resend Error: {str(e)} - Falling back to SMTP...")

        # 2. SMTP Fallback (Legacy)
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Force IPv4 resolution to avoid [Errno 101] Network is unreachable
            import socket
            smtp_ip = socket.gethostbyname(self.smtp_host)
            
            # Use appropriate logic based on port
            timeout = 30 
            
            port = int(self.smtp_port)
            if port == 465:
                with smtplib.SMTP_SSL(smtp_ip, port, timeout=timeout) as server:
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(smtp_ip, port, timeout=timeout) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)
                 
            print(f"✅ SMTP Email sent successfully to {to_email}")   
            return True
        except Exception as e:
            print(f"❌ SMTP Email error: {str(e)}")
            return False
    
    def send_customer_confirmation(self, order_data):
        """Send order confirmation to customer"""
        customer_email = order_data.get('customer_email') or order_data.get('email')
        if not customer_email:
            return False
        
        # Get items from order data (handle both 'items' and 'items_json' keys for compatibility)
        items_data = order_data.get('items') or order_data.get('items_json')
        items_json = json.loads(items_data) if isinstance(items_data, str) else items_data
        
        items_html = ""
        for item in items_json:
            items_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{item['product']}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item['price']:.2f}</td>
            </tr>
            """
        
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #D8A7B1 0%, #B08BA6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: white; padding: 30px; border: 1px solid #eee; }}
                .footer {{ background: #f8f8f8; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #666; font-size: 14px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                .total {{ font-weight: bold; font-size: 18px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">V.A.Y Studio</h1>
                    <p style="margin: 10px 0 0;">Thank you for your order!</p>
                </div>
                <div class="content">
                    <h2 style="color: #D8A7B1;">Order Confirmation</h2>
                    <p>Dear {order_data['customer_name']},</p>
                    <p>We've received your order and we're getting started on creating your beautiful arrangement!</p>
                    
                    <h3>Order Details:</h3>
                    <table>
                        <thead>
                            <tr style="background: #f8f8f8;">
                                <th style="padding: 10px; text-align: left;">Item</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                            <tr class="total">
                                <td style="padding: 15px 10px;">Total</td>
                                <td style="padding: 15px 10px; text-align: right;">${order_data['total_amount']:.2f}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3>Delivery Information:</h3>
                    <p><strong>Address:</strong> {order_data['delivery_address']}</p>
                    <p><strong>Date:</strong> {order_data['delivery_date']}</p>
                    <p><strong>Time:</strong> {order_data['delivery_time']}</p>
                    <p><strong>Payment Method:</strong> {order_data['payment_method'].title()}</p>
                    
                    <p>If you have any questions, please contact us at {self.smtp_user} or call 734-858-8724.</p>
                </div>
                <div class="footer">
                    <p>V.A.Y Studio | 2410 N 77th AVE, Elmwood Park, IL</p>
                    <p>© 2025 V.A.Y Studio. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(customer_email, "Order Confirmation - V.A.Y Studio", html)
    
    def send_owner_notification(self, order_data):
        """Send order notification to shop owner"""
        # Get items from order data (handle both 'items' and 'items_json' keys for compatibility)
        items_data = order_data.get('items') or order_data.get('items_json')
        items_json = json.loads(items_data) if isinstance(items_data, str) else items_data
        
        items_html = ""
        for item in items_json:
            addons = ', '.join(item.get('addons', [])) if item.get('addons') else 'None'
            items_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{item['product']}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{addons}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item['price']:.2f}</td>
            </tr>
            """
        
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 700px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #D8A7B1; color: white; padding: 20px; text-align: center; }}
                .content {{ background: white; padding: 30px; border: 1px solid #eee; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                .alert {{ background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🌸 New Order Received!</h1>
                </div>
                <div class="content">
                    <div class="alert">
                        <strong>⚡ Action Required:</strong> New order #{order_data.get('id', 'N/A')} needs processing
                    </div>
                    
                    <h2>Customer Information:</h2>
                    <p><strong>Name:</strong> {order_data['customer_name']}</p>
                    <p><strong>Phone:</strong> {order_data['customer_phone']}</p>
                    <p><strong>Email:</strong> {order_data.get('customer_email', 'Not provided')}</p>
                    
                    <h2>Delivery Details:</h2>
                    <p><strong>Address:</strong> {order_data['delivery_address']}</p>
                    <p><strong>Date:</strong> {order_data['delivery_date']}</p>
                    <p><strong>Time:</strong> {order_data['delivery_time']}</p>
                    
                    <h2>Order Items:</h2>
                    <table>
                        <thead>
                            <tr style="background: #f8f8f8;">
                                <th style="padding: 10px; text-align: left;">Product</th>
                                <th style="padding: 10px; text-align: left;">Add-ons</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                            <tr style="font-weight: bold; background: #f0f0f0;">
                                <td colspan="2" style="padding: 15px 10px;">Total</td>
                                <td style="padding: 15px 10px; text-align: right; font-size: 18px;">${order_data['total_amount']:.2f}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h2>Payment Information:</h2>
                    <p><strong>Method:</strong> {order_data['payment_method'].title()}</p>
                    <p><strong>Status:</strong> {order_data.get('payment_status', 'pending').title()}</p>
                    {f"<p><strong>Stripe Payment ID:</strong> {order_data.get('stripe_payment_intent_id')}</p>" if order_data.get('stripe_payment_intent_id') else ''}
                    
                    <p style="margin-top: 30px; color: #666; font-size: 14px;">
                        Order received at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(self.notification_email, f"🌸 New Order #{order_data.get('id', 'N/A')} - V.A.Y Studio", html)
