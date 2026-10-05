from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class SendMailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    body: str
    # status: str  # e.g., "pending", "scheduled"
    # scheduled_for: Optional[datetime] = None
    no_of_follow_up: Optional[int] = 0
    follow_up_delays: Optional[List[int]] = Field(default_factory=lambda: [2, 4, 7])
    category: Optional[str] = "default"  # e.g., "sales", "job", "freelancer"
    follow_up_strategy: Optional[str] = "standard" 
    is_attachment: Optional[bool] = False

