import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

# Генерируем пару ключей
private_key = ec.generate_private_key(ec.SECP256R1())
public_key = private_key.public_key()

# Получаем raw ключи в байтах
private_numbers = private_key.private_numbers()
public_numbers = public_key.public_numbers()

private_raw = private_numbers.private_value.to_bytes(32, 'big')
public_raw = public_numbers.x.to_bytes(32, 'big') + public_numbers.y.to_bytes(32, 'big')

# Конвертируем в base64url (формат VAPID)
def to_base64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

public_vapid = to_base64url(public_raw)
private_vapid = to_base64url(private_raw)

print("VAPID_PUBLIC_KEY =", public_vapid)
print("VAPID_PRIVATE_KEY =", private_vapid)