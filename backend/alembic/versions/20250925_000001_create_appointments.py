from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20250925_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "appointments",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("patient_id", sa.String(), nullable=False),
        sa.Column("doctor_id", sa.String(), nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("status", sa.String(), nullable=False, server_default="scheduled"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("doctor_id", "start_time", name="uq_doctor_start_time"),
    )
    op.create_index("ix_appointments_doctor_start", "appointments", ["doctor_id", "start_time"])
    op.create_index("ix_appointments_patient_start", "appointments", ["patient_id", "start_time"])


def downgrade() -> None:
    op.drop_index("ix_appointments_patient_start", table_name="appointments")
    op.drop_index("ix_appointments_doctor_start", table_name="appointments")
    op.drop_table("appointments")


