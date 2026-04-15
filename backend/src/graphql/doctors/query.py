from datetime import datetime, timedelta, timezone
from typing import List, Optional
import graphene

from src.graphql.types import DoctorType, AvailabilitySlotType
from src.graphql.doctors.data import DOCTORS


def _filter_doctors(q: Optional[str], specialty: Optional[str]):
  items = DOCTORS
  if q:
    q_lower = q.lower()
    items = [d for d in items if q_lower in d["name"].lower()]
  if specialty:
    items = [d for d in items if d["specialty"].lower() == specialty.lower()]
  return items


def _generate_slots(date: datetime) -> List[datetime]:
  # 11:00,12:00,13:00,14:00,15:00 local UTC for simplicity
  # In production, this would be fetched from the database
  base = datetime(date.year, date.month, date.day, tzinfo=timezone.utc)
  hours = [11, 12, 13, 14, 15]
  return [base + timedelta(hours=h) for h in hours]


class DoctorsQuery(graphene.ObjectType):
  doctors = graphene.List(DoctorType, q=graphene.String(required=False), specialty=graphene.String(required=False))
  doctor_availability = graphene.List(AvailabilitySlotType, doctor_id=graphene.NonNull(graphene.String), date=graphene.NonNull(graphene.Date))

  def resolve_doctors(self, info, q=None, specialty=None):
    doctors = _filter_doctors(q, specialty)
    return [DoctorType(
      id=d["id"],
      name=d["name"], 
      specialty=d["specialty"],
      avatarUrl=d["avatarUrl"]
    ) for d in doctors]

  def resolve_doctor_availability(self, info, doctor_id, date):
    # Validate doctor exists
    if not any(d["id"] == doctor_id for d in DOCTORS):
      raise Exception("Doctor not found")
    slots = _generate_slots(datetime(date.year, date.month, date.day, tzinfo=timezone.utc))
    return [AvailabilitySlotType(start_time=s) for s in slots]


