from app import db
from datetime import datetime


class Todo(db.Model):
    __tablename__ = 'todos'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=True)

    # Recurrence fields
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_type = db.Column(db.String(20), nullable=True)  # 'daily', 'weekly', 'monthly'
    recurrence_interval = db.Column(db.Integer, default=1)
    recurrence_days = db.Column(db.String(100), nullable=True)  # optional CSV for weekly days
    recurrence_end_date = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Todo {self.id}: {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None,
            'due_date': self.due_date.strftime('%Y-%m-%d') if self.due_date else None,
            'is_recurring': self.is_recurring,
            'recurrence_type': self.recurrence_type,
            'recurrence_interval': self.recurrence_interval,
            'recurrence_days': self.recurrence_days,
            'recurrence_end_date': self.recurrence_end_date.strftime('%Y-%m-%d') if self.recurrence_end_date else None,
        }
