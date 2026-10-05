"""add campaign analytics fields

Revision ID: 9e6653b84ba8
Revises: eecd2721ea57
Create Date: 2026-02-14 20:29:49.883525

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9e6653b84ba8'
down_revision: Union[str, Sequence[str], None] = 'eecd2721ea57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("campaigns", sa.Column("total_recipients", sa.Integer(), server_default="0"))
    op.add_column("campaigns", sa.Column("sent_count", sa.Integer(), server_default="0"))
    op.add_column("campaigns", sa.Column("pending_count", sa.Integer(), server_default="0"))
    op.add_column("campaigns", sa.Column("opened_count", sa.Integer(), server_default="0"))
    op.add_column("campaigns", sa.Column("replied_count", sa.Integer(), server_default="0"))
    op.add_column("campaigns", sa.Column("bounced_count", sa.Integer(), server_default="0"))
    op.add_column("campaigns", sa.Column("throttle_per_day", sa.Integer(), server_default="50"))
    op.add_column("campaigns", sa.Column("next_scheduled_follow_up", sa.DateTime(timezone=True), nullable=True))

    op.create_index(
        "idx_campaign_user_created",
        "campaigns",
        ["user_id", "created_at"]
    )



def downgrade() -> None:
    op.drop_index("idx_campaign_user_created", table_name="campaigns")

    op.drop_column("campaigns", "next_scheduled_follow_up")
    op.drop_column("campaigns", "throttle_per_day")

    op.drop_column("campaigns", "bounced_count")
    op.drop_column("campaigns", "replied_count")
    op.drop_column("campaigns", "opened_count")
    op.drop_column("campaigns", "pending_count")
    op.drop_column("campaigns", "sent_count")
    op.drop_column("campaigns", "total_recipients")
