import requests
import json

# TUS DATOS DEL DASHBOARD
PHONE_NUMBER_ID = "865259133343734"
ACCESS_TOKEN = "EAAZCGIZCqBjxkBQBInDOFhAFGZBfYskzuRb0X9zNoMyCuEYjFIpagRVBTzVBFC6Ph92jJG9szzNVoaXOmfxtNGLAbGYUSfkM0xz6HhIK09fceg9JK7dh1AdFohPgW4uaMZCvvZBwLnzVLZA2Ee8H8ivZCd4xXvdJQO6JOOYslZAQgYh7MlYXrsEwLPRTzuAZBdejK2gZDZD"
# NOTA: Agregué el '9' después del 54 por ser celular de Argentina
RECIPIENT_NUMBER = "5493517670440" 

url = f"https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages"

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

data = {
    "messaging_product": "whatsapp",
    "to": RECIPIENT_NUMBER,
    "type": "template",
    "template": {
        "name": "hello_world",
        "language": {
            "code": "en_US"
        }
    }
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print("Respuesta:", response.json())
    
    if response.status_code == 200:
        print("✅ ¡EXITO! Mensaje enviado. Revisa tu WhatsApp.")
    else:
        print("❌ Error: Revisa el token o el número.")

except Exception as e:
    print(f"Error de conexión: {e}")
