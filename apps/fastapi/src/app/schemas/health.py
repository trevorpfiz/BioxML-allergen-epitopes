from pydantic import BaseModel


class HealthCheckResponse(BaseModel):
    message: str
    batches_processed: int
    title: str
    content: str
    transcript: str
