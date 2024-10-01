import logging
from datetime import datetime, timezone

from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt

from app.core.config import settings

# Create logger for the auth service
logger = logging.getLogger("auth_service")
logger.setLevel(logging.DEBUG)


ALGORITHM = "HS256"
security = HTTPBearer()


def decode_jwt(token: str, secret: str) -> dict:
    """Decode a JWT token and verify its expiration."""
    try:
        logging.info("Attempting to decode the JWT token.")
        payload = jwt.decode(
            token=token, key=secret, algorithms=[ALGORITHM], audience="authenticated"
        )

        # Verify expiration time
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(
            tz=timezone.utc
        ):
            logging.warning("Token has expired.")
            return None

        logging.info("JWT successfully decoded.")
        return payload

    except ExpiredSignatureError:
        logging.error("JWT has expired.")
        return None
    except JWTError as e:
        logging.error(f"JWT decoding error: {e}")
        return None


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify the incoming token using the `decode_jwt` function."""
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_jwt(token, settings.JWT_SECRET)
    if not payload or "sub" not in payload:
        raise credentials_exception

    return payload["sub"]
