from typing import Optional

from pydantic import BaseModel


class DSAProgressUpdate(BaseModel):
    status: Optional[str] = None
    bookmarked: Optional[bool] = None
    notes: Optional[str] = None
