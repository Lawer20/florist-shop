#!/usr/bin/env python3
"""
Тестовий скрипт для перевірки Stripe платежів через Railway backend
"""
import json
import urllib.request
import urllib.error

BACKEND_URL = 'https://florist-shop-production.up.railway.app'

def test_health():
    """Перевірка здоров'я сервера"""
    print("🔍 Перевірка здоров'я сервера...")
    try:
        response = urllib.request.urlopen(f'{BACKEND_URL}/health')
        data = json.loads(response.read().decode())
        print(f"✅ Сервер здоровий: {data}")
        return True
    except Exception as e:
        print(f"❌ Помилка: {e}")
        return False

def test_config():
    """Перевірка конфігурації Stripe"""
    print("\n🔍 Перевірка Stripe конфігурації...")
    try:
        response = urllib.request.urlopen(f'{BACKEND_URL}/api/config')
        data = json.loads(response.read().decode())
        key = data.get('stripePublishableKey', '')
        if key.startswith('pk_test_'):
            print(f"✅ Stripe test key отримано: {key[:20]}...")
            return True
        elif key.startswith('pk_live_'):
            print(f"⚠️  Використовується LIVE key (будьте обережні!): {key[:20]}...")
            return True
        else:
            print(f"❌ Невалідний Stripe key: {key}")
            return False
    except Exception as e:
        print(f"❌ Помилка: {e}")
        return False

def test_payment_intent():
    """Тест створення payment intent"""
    print("\n🔍 Тест створення payment intent...")
    try:
        payload = {
            "amount": 100.00,
            "customer_name": "Test User",
            "customer_phone": "+1234567890",
            "delivery_date": "2026-02-15"
        }
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f'{BACKEND_URL}/api/create-payment-intent',
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        response = urllib.request.urlopen(req)
        result = json.loads(response.read().decode())
        
        if 'clientSecret' in result and 'paymentIntentId' in result:
            print(f"✅ Payment Intent створено:")
            print(f"   ID: {result['paymentIntentId']}")
            print(f"   Secret: {result['clientSecret'][:30]}...")
            return True
        else:
            print(f"❌ Відповідь не містить потрібних полів: {result}")
            return False
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"❌ HTTP Error {e.code}: {error_body}")
        return False
    except Exception as e:
        print(f"❌ Помилка: {e}")
        return False

def main():
    print("="*60)
    print("🧪 ТЕСТУВАННЯ STRIPE ІНТЕГРАЦІЇ З RAILWAY BACKEND")
    print("="*60)
    
    results = []
    
    # Тест 1: Health check
    results.append(("Health Check", test_health()))
    
    # Тест 2: Config
    results.append(("Stripe Config", test_config()))
    
    # Тест 3: Payment Intent
    results.append(("Payment Intent", test_payment_intent()))
    
    # Підсумки
    print("\n" + "="*60)
    print("📊 РЕЗУЛЬТАТИ ТЕСТУВАННЯ")
    print("="*60)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:.<40} {status}")
    
    all_passed = all(result for _, result in results)
    
    print("\n" + "="*60)
    if all_passed:
        print("✅ ВСІ ТЕСТИ ПРОЙДЕНО!")
        print("🎉 Railway backend працює ідеально!")
        print("\n📝 Наступний крок: Відновити Netlify або мігрувати frontend")
    else:
        print("❌ ДЕЯКІ ТЕСТИ НЕ ПРОЙДЕНО")
        print("🔧 Перевірте налаштування Railway environment variables")
    print("="*60)

if __name__ == '__main__':
    main()
