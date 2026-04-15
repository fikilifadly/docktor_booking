from typing import List, Optional
import graphene
from sqlalchemy import select, and_
from sqlalchemy.orm import Session
from datetime import datetime, date
from fastapi import Depends

from src.core.db import get_db_session
from src.models.appointment import Appointment
from src.graphql.types import AppointmentType


def _require_patient_id(info) -> str:
    patient_id: Optional[str] = info.context.get("patient_id")
    if not patient_id:
        raise Exception("Unauthorized")
    return patient_id


def _serialize(appt: Appointment) -> AppointmentType:
    return AppointmentType(
        id=appt.id,
        patient_id=appt.patient_id,
        doctor_id=appt.doctor_id,
        start_time=appt.start_time,
        duration_minutes=appt.duration_minutes,
        status=appt.status,
        notes=appt.notes,
        created_at=appt.created_at,
        updated_at=appt.updated_at,
    )


class AppointmentsQuery(graphene.ObjectType):
    appointments_by_patient = graphene.List(AppointmentType)
    appointments_by_doctor = graphene.List(
        AppointmentType,
        doctor_id=graphene.String(required=True),
        date=graphene.DateTime(required=True)
    )

    def resolve_appointments_by_patient(self, info):
        patient_id = _require_patient_id(info)
        session = info.context.get("db_session")
        stmt = (
            select(Appointment)
            .where(Appointment.patient_id == patient_id)
            .order_by(Appointment.start_time)
        )
        rows: List[Appointment] = session.execute(stmt).scalars().all()
        return [_serialize(r) for r in rows]

    def resolve_appointments_by_doctor(self, info, doctor_id: str, date: datetime):
        _require_patient_id(info)  # Still require authentication
        session = info.context.get("db_session")
        
        # Get start and end of the day for the given date
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        stmt = (
            select(Appointment)
            .where(
                and_(
                    Appointment.doctor_id == doctor_id,
                    Appointment.start_time >= start_of_day,
                    Appointment.start_time <= end_of_day,
                    Appointment.status != 'cancelled'  # Exclude cancelled appointments
                )
            )
            .order_by(Appointment.start_time)
        )
        rows: List[Appointment] = session.execute(stmt).scalars().all()
        return [_serialize(r) for r in rows]


