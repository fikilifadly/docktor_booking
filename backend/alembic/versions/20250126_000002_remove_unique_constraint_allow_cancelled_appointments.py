from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20250126_000002"
down_revision = "20250925_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Remove the unique constraint that prevents booking cancelled appointment slots
    op.drop_constraint("uq_doctor_start_time", "appointments", type_="unique")


def downgrade() -> None:
    # Re-add the unique constraint
    op.create_unique_constraint("uq_doctor_start_time", "appointments", ["doctor_id", "start_time"])
