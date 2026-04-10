"""Create practice_sessions table

Revision ID: 062cfba2f6c9
Revises: 
Create Date: 2026-04-10 20:13:00.989315

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '062cfba2f6c9'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'practice_sessions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Text, nullable=False),
        sa.Column('exam_name', sa.Text, nullable=False),
        sa.Column('selected_categories', sa.ARRAY(sa.Text), nullable=False, server_default='{}'),
        sa.Column('total_questions', sa.Integer, nullable=False),
        sa.Column('mode', sa.Text, nullable=False, server_default='practice'),
        sa.Column('status', sa.Text, nullable=False),
        sa.Column('start_time', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('end_time', sa.DateTime, nullable=True),
        sa.Column('question_set', sa.JSON, nullable=False),
        sa.Column('time_limit_seconds', sa.Integer, nullable=True),
        sa.Column('shuffle_seed', sa.Integer, nullable=True),
        sa.Column('last_activity_at', sa.DateTime, nullable=True),
        sa.Column('paused_at', sa.DateTime, nullable=True),
    )
    # Create indexes for common queries
    op.create_index('idx_practice_sessions_user_id_start_time', 'practice_sessions',
                    ['user_id', 'start_time'], postgresql_using='btree')
    op.create_index('idx_practice_sessions_user_id_status', 'practice_sessions',
                    ['user_id', 'status'], postgresql_using='btree')
    op.create_index('idx_practice_sessions_status_start_time', 'practice_sessions',
                    ['status', 'start_time'], postgresql_using='btree')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_practice_sessions_status_start_time')
    op.drop_index('idx_practice_sessions_user_id_status')
    op.drop_index('idx_practice_sessions_user_id_start_time')
    op.drop_table('practice_sessions')
