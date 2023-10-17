import hashlib
import secrets
import string

"""
hash(password, salt)
    Used to encrypt password by hashing it with salt
"""
def hash(password, salt):
    password += salt
    password = hashlib.sha256(password.encode()).hexdigest()
    return password


"""
generateKey()
    Used to generate random strings for salt and token authentication.
"""
def generateKey(length=40):
    alphabet = string.ascii_letters + string.digits  # You can customize the character set if needed
    random_string = ''.join(secrets.choice(alphabet) for _ in range(length))
    return random_string