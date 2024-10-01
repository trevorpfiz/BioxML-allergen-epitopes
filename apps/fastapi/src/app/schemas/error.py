from pydantic import BaseModel


# 401
class UnauthorizedErrorResponse(BaseModel):
    detail: str


# 404
class NotFoundErrorResponse(BaseModel):
    detail: str
