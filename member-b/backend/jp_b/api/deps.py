from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jp_b.services.auth_service import auth_service
from jp_b.api.errors import APIError

bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    if not credentials or not credentials.credentials:
        raise APIError("UNAUTHORIZED", status_code=401, message="Missing authentication token")
    
    payload = auth_service.verify_token(credentials.credentials)
    
    # Ensure role is one of dispatcher or admin
    role = payload.get("role")
    if role not in ["dispatcher", "admin"]:
        raise APIError("UNAUTHORIZED", status_code=403, message="Insufficient permissions")
    
    return payload

from typing import Optional
from jp_b.config import settings
from jp_b.clients.a_client import AClient
from jp_b.clients.a_mock import AMockClient
from jp_b.clients.a_http import AHttpClient

_mock_client: Optional[AMockClient] = None

def get_a_client() -> AClient:
    global _mock_client
    if settings.b_use_mock_a:
        if _mock_client is None:
            _mock_client = AMockClient()
        return _mock_client
    return AHttpClient()

from jp_b.repositories.base import LedgerRepository
from jp_b.repositories.sqlite_repo import SQLiteLedgerRepository
from jp_b.services.ledger_service import LedgerService

def get_ledger_repo() -> LedgerRepository:
    return SQLiteLedgerRepository()

def get_ledger_service(repo: LedgerRepository = Depends(get_ledger_repo)) -> LedgerService:
    return LedgerService(repo)

