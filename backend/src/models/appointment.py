import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Text, UniqueConstraint

from src.core.db import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, nullable=False)
    doctor_id = Column(String, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=30)
    status = Column(String, nullable=False, default="scheduled")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    __table_args__ = (
        # Note: The unique constraint is handled at the application level
        # to allow cancelled appointments to free up time slots
        # UniqueConstraint("doctor_id", "start_time", name="uq_doctor_start_time"),
    )


