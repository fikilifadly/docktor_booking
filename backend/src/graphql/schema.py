import graphene
from graphene import ObjectType

from src.graphql.appointments.query import AppointmentsQuery
from src.graphql.doctors.query import DoctorsQuery
from src.graphql.appointments.mutation import AppointmentsMutation


class Query(AppointmentsQuery, DoctorsQuery, ObjectType):
    pass


class Mutation(AppointmentsMutation, ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)


