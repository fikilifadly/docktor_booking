from datetime import datetime, timezone, timedelta
from typing import Optional
import graphene
from graphene import Field
from graphene.types.datetime import DateTime
from pydantic import BaseModel, Field as PydField, ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from fastapi import Depends

from src.core.db import get_db_session
from src.models.appointment import Appointment
from src.graphql.types import AppointmentType
from src.graphql.doctors.data import DOCTORS


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


def _check_appointment_conflict(
    session: Session,
    doctor_id: str,
    start_time: datetime,
    duration_minutes: int,
    exclude_id: Optional[str] = None,
) -> bool:
    """
    Check if there's a conflict with existing non-cancelled appointments.
    Returns True if there's a conflict, False otherwise.
    exclude_id: appointment id to skip (used when rescheduling/changing doctor so
                the appointment being modified does not block itself).
    """
    end_time = start_time + timedelta(minutes=duration_minutes)

    day_start = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)

    stmt = (
        select(Appointment)
        .where(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.status != 'cancelled',
                Appointment.start_time >= day_start,
                Appointment.start_time < day_end,
            )
        )
    )

    existing_appointments = session.execute(stmt).scalars().all()

    for existing in existing_appointments:
        if exclude_id and existing.id == exclude_id:
            continue
        existing_end = existing.start_time + timedelta(minutes=existing.duration_minutes)
        if start_time < existing_end and end_time > existing.start_time:
            return True

    return False


class CreateAppointmentInput(BaseModel):
    doctor_id: str
    start_time: datetime
    duration_minutes: int = PydField(default=60, ge=1, le=480)
    notes: Optional[str] = None


class CreateAppointment(graphene.Mutation):
    class Arguments:
        doctor_id = graphene.NonNull(graphene.String)
        start_time = graphene.NonNull(DateTime)
        duration_minutes = graphene.Int(required=False, default_value=60)
        notes = graphene.String(required=False)

    ok = graphene.NonNull(graphene.Boolean)
    appointment = Field(AppointmentType)
    error = graphene.String()

    @staticmethod
    def mutate(root, info, doctor_id, start_time, duration_minutes=60, notes=None):
        try:
            patient_id = _require_patient_id(info)
        except Exception as e:
            return CreateAppointment(ok=False, error=str(e))

        session = info.context.get("db_session")
        try:
            payload = CreateAppointmentInput(
                doctor_id=doctor_id,
                start_time=start_time if start_time.tzinfo else start_time.replace(tzinfo=timezone.utc),
                duration_minutes=duration_minutes,
                notes=notes,
            )
        except ValidationError as e:
            return CreateAppointment(ok=False, error=str(e))
        
        # BE-002: Reject appointments in the past
        if payload.start_time <= datetime.now(timezone.utc):
            return CreateAppointment(ok=False, error="Appointment must be in the future")

        # Check for conflicts with existing non-cancelled appointments
        if _check_appointment_conflict(session, payload.doctor_id, payload.start_time, payload.duration_minutes):
            return CreateAppointment(ok=False, error="Slot already booked for this doctor")
        
        appt = Appointment(
            patient_id=patient_id,
            doctor_id=payload.doctor_id,
            start_time=payload.start_time,
            duration_minutes=payload.duration_minutes,
            notes=payload.notes,
        )
        session.add(appt)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            return CreateAppointment(ok=False, error="Database error occurred")
        session.refresh(appt)
        return CreateAppointment(ok=True, appointment=_serialize(appt))


class CancelAppointmentInput(BaseModel):
    id: str


class CancelAppointment(graphene.Mutation):
    class Arguments:
        id = graphene.NonNull(graphene.String)

    ok = graphene.NonNull(graphene.Boolean)
    error = graphene.String()

    @staticmethod
    def mutate(root, info, id):
        try:
            patient_id = _require_patient_id(info)
        except Exception as e:
            return CancelAppointment(ok=False, error=str(e))
        
        session = info.context.get("db_session")
        obj = session.get(Appointment, id)
        if not obj or obj.patient_id != patient_id:
            return CancelAppointment(ok=False, error="Not found")
        obj.status = "cancelled"
        obj.updated_at = datetime.now(timezone.utc)
        session.add(obj)
        session.commit()
        return CancelAppointment(ok=True)


class RescheduleAppointment(graphene.Mutation):
    class Arguments:
        id = graphene.NonNull(graphene.String)
        new_start_time = graphene.NonNull(DateTime)
        new_duration_minutes = graphene.Int(required=False)

    ok = graphene.NonNull(graphene.Boolean)
    appointment = Field(AppointmentType)
    error = graphene.String()

    @staticmethod
    def mutate(root, info, id, new_start_time, new_duration_minutes=None):
        try:
            patient_id = _require_patient_id(info)
        except Exception as e:
            return RescheduleAppointment(ok=False, error=str(e))

        session = info.context.get("db_session")
        obj = session.get(Appointment, id)
        if not obj or obj.patient_id != patient_id:
            return RescheduleAppointment(ok=False, error="Not found")
        if obj.status == "cancelled":
            return RescheduleAppointment(ok=False, error="Cannot reschedule a cancelled appointment")

        new_start = new_start_time if new_start_time.tzinfo else new_start_time.replace(tzinfo=timezone.utc)
        if new_start <= datetime.now(timezone.utc):
            return RescheduleAppointment(ok=False, error="New time must be in the future")

        duration = new_duration_minutes if new_duration_minutes is not None else obj.duration_minutes
        if duration < 1 or duration > 480:
            return RescheduleAppointment(ok=False, error="Duration must be between 1 and 480 minutes")

        if _check_appointment_conflict(session, obj.doctor_id, new_start, duration, exclude_id=id):
            return RescheduleAppointment(ok=False, error="Slot already booked for this doctor")

        obj.start_time = new_start
        if new_duration_minutes is not None:
            obj.duration_minutes = duration
        obj.updated_at = datetime.now(timezone.utc)
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return RescheduleAppointment(ok=True, appointment=_serialize(obj))


class ChangeDoctor(graphene.Mutation):
    class Arguments:
        id = graphene.NonNull(graphene.String)
        new_doctor_id = graphene.NonNull(graphene.String)

    ok = graphene.NonNull(graphene.Boolean)
    appointment = Field(AppointmentType)
    error = graphene.String()

    @staticmethod
    def mutate(root, info, id, new_doctor_id):
        try:
            patient_id = _require_patient_id(info)
        except Exception as e:
            return ChangeDoctor(ok=False, error=str(e))

        session = info.context.get("db_session")
        obj = session.get(Appointment, id)
        if not obj or obj.patient_id != patient_id:
            return ChangeDoctor(ok=False, error="Not found")
        if obj.status == "cancelled":
            return ChangeDoctor(ok=False, error="Cannot change doctor for a cancelled appointment")

        if not any(d["id"] == new_doctor_id for d in DOCTORS):
            return ChangeDoctor(ok=False, error="Doctor not found")

        if _check_appointment_conflict(session, new_doctor_id, obj.start_time, obj.duration_minutes, exclude_id=id):
            return ChangeDoctor(ok=False, error="New doctor is not available at this time")

        obj.doctor_id = new_doctor_id
        obj.updated_at = datetime.now(timezone.utc)
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return ChangeDoctor(ok=True, appointment=_serialize(obj))


class AppointmentsMutation(graphene.ObjectType):
    create_appointment = CreateAppointment.Field()
    cancel_appointment = CancelAppointment.Field()
    reschedule_appointment = RescheduleAppointment.Field()
    change_doctor = ChangeDoctor.Field()


