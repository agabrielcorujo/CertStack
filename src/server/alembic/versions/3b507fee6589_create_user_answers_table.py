"""Create user_answers table

Revision ID: 3b507fee6589
Revises: 062cfba2f6c9
Create Date: 2026-04-10 20:17:05.733075

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3b507fee6589'
down_revision: Union[str, Sequence[str], None] = '062cfba2f6c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'user_answers',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('session_id', sa.Integer, nullable=False),
        sa.Column('question_hash', sa.Text, nullable=False),
        sa.Column('question_text', sa.Text, nullable=False),
        sa.Column('selected_answer', sa.JSON, nullable=True),
        sa.Column('correct_answer', sa.JSON, nullable=True),
        sa.Column('is_correct', sa.Boolean, nullable=False),
        sa.Column('flagged', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('time_spent_seconds', sa.Integer, nullable=True),
        sa.Column('answered_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('category', sa.Text, nullable=True),
        sa.Column('difficulty', sa.Text, nullable=True),
        sa.Column('is_multiselect', sa.Boolean, nullable=True),
        sa.Column('is_skipped', sa.Boolean, nullable=True),
        # Foreign key to practice_sessions
        sa.ForeignKeyConstraint(['session_id'], ['practice_sessions.id'], ondelete='CASCADE'),
    )
    
    # Unique constraint: one answer per question per session
    op.create_unique_constraint(
        'uq_user_answers_session_question',
        'user_answers',
        ['session_id', 'question_hash']
    )
    
    # Indexes for common queries
    op.create_index('idx_user_answers_session_id', 'user_answers',
                    ['session_id'], postgresql_using='btree')
    op.create_index('idx_user_answers_category', 'user_answers',
                    ['category'], postgresql_using='btree')
    op.create_index('idx_user_answers_answered_at', 'user_answers',
                    ['answered_at'], postgresql_using='btree')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_user_answers_answered_at')
    op.drop_index('idx_user_answers_category')
    op.drop_index('idx_user_answers_session_id')
    op.drop_constraint('uq_user_answers_session_question', 'user_answers')
    op.drop_table('user_answers')
