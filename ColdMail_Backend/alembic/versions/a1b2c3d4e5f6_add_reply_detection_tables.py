"""add reply detection columns

Revision ID: a1b2c3d4e5f6
Revises: 9e6653b84ba8
Create Date: 2026-03-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '9e6653b84ba8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- users table: reply tracking columns ---
    op.add_column('users', sa.Column('reply_tracking_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('domain', sa.String(), nullable=True))
    op.add_column('users', sa.Column('domain_verified', sa.Boolean(), nullable=False, server_default='false'))

    # --- mails table: reply tracking columns ---
    op.add_column('mails', sa.Column('reply_to_address', sa.String(), nullable=True))
    op.create_unique_constraint('uq_mails_reply_to_address', 'mails', ['reply_to_address'])
    op.create_index('idx_mails_reply_to_address', 'mails', ['reply_to_address'])
    op.add_column('mails', sa.Column('reply_body', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('mails', 'reply_body')
    op.drop_index('idx_mails_reply_to_address', table_name='mails')
    op.drop_constraint('uq_mails_reply_to_address', 'mails', type_='unique')
    op.drop_column('mails', 'reply_to_address')

    op.drop_column('users', 'domain_verified')
    op.drop_column('users', 'domain')
    op.drop_column('users', 'reply_tracking_enabled')
