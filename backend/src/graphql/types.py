import graphene


class AppointmentType(graphene.ObjectType):
    id = graphene.NonNull(graphene.String)
    patient_id = graphene.NonNull(graphene.String)
    doctor_id = graphene.NonNull(graphene.String)
    start_time = graphene.NonNull(graphene.DateTime)
    duration_minutes = graphene.NonNull(graphene.Int)
    status = graphene.NonNull(graphene.String)
    notes = graphene.String()
    created_at = graphene.NonNull(graphene.DateTime)
    updated_at = graphene.NonNull(graphene.DateTime)


class DoctorType(graphene.ObjectType):
    id = graphene.NonNull(graphene.String)
    name = graphene.NonNull(graphene.String)
    specialty = graphene.NonNull(graphene.String)
    avatarUrl = graphene.String()


class AvailabilitySlotType(graphene.ObjectType):
    start_time = graphene.NonNull(graphene.DateTime)

