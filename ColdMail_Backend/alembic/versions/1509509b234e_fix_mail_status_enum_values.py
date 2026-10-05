"""fix mail_status_enum values

Revision ID: 1509509b234e
Revises: 49c813378745
Create Date: 2025-08-22 19:26:10.861167

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1509509b234e'
down_revision: Union[str, Sequence[str], None] = '49c813378745'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
