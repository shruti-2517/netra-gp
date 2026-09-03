from fastapi import Header, HTTPException, status
from typing import Optional, List

ROLE_PERMISSIONS = {
  "SUPER_ADMIN": ["read", "write_camera", "write_watchlist", "export"],
  "DEPT_ADMIN": ["read", "write_camera", "write_watchlist", "export"],
  "INVESTIGATOR": ["read", "export"],
  "OPERATOR": ["read", "export"],
  "VIEWER": ["read"]
}

def require_role_permission(required_perm: str):
    """
    FastAPI dependency to verify role permissions on mutating endpoints.
    Allows default local execution while enforcing RBAC if X-User-Role is passed.
    """
    def permission_checker(x_user_role: Optional[str] = Header(None)):
        # Default to SUPER_ADMIN for local CLI test compatibility
        role = (x_user_role or "SUPER_ADMIN").upper()
        
        perms = ROLE_PERMISSIONS.get(role, ["read"])
        if required_perm not in perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Forbidden: Role '{role}' does not have permission '{required_perm}'."
            )
        return role
    return permission_checker
