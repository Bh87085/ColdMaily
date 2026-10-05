from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class NotificationSchema(BaseModel):
    id: UUID
    user_id: int
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat() + "Z" if v else None
        }
