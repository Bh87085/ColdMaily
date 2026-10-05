"""add campaigns and link mails

Revision ID: cc0b38faa09c
Revises: da0147b7d48d
Create Date: 2025-12-13 22:01:28.536684

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cc0b38faa09c'
down_revision: Union[str, Sequence[str], None] = 'da0147b7d48d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "ix_mails_campaign_id",
        "mails",
        ["campaign_id"],
        unique=False
    )

    op.create_foreign_key(
        "fk_mails_campaign_id",
        "mails",
        "campaigns",
        ["campaign_id"],
        ["campaign_id"],
        ondelete="CASCADE"
    )



def downgrade() -> None:
    op.drop_constraint(
        "fk_mails_campaign_id",
        "mails",
        type_="foreignkey"
    )

    op.drop_index(
        "ix_mails_campaign_id",
        table_name="mails"
    )

