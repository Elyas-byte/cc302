from flask import Blueprint, render_template, request, jsonify
from app import db
from app.models import Todo

from datetime import datetime, timedelta
import calendar

main_bp = Blueprint('main', __name__)


def _add_months(dt, months: int):
    """Add months to a datetime safely (clamp day to end of month)."""
    year = dt.year + (dt.month - 1 + months) // 12
    month = (dt.month - 1 + months) % 12 + 1
    day = min(dt.day, calendar.monthrange(year, month)[1])
    return datetime(year, month, day, dt.hour, dt.minute, dt.second, dt.microsecond)


def calculate_next_due_date(due_date, recurrence_type, interval=1):
    if not due_date or not recurrence_type:
        return None
    interval = int(interval or 1)
    if recurrence_type == 'daily':
        return due_date + timedelta(days=interval)
    if recurrence_type == 'weekly':
        return due_date + timedelta(weeks=interval)
    if recurrence_type == 'monthly':
        return _add_months(due_date, interval)
    return None


@main_bp.route('/')
def index():
    return render_template('index.html')


# ── API Routes for CRUD operations ──


@main_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Read all tasks."""
    todos = Todo.query.order_by(Todo.created_at.desc()).all()
    return jsonify([t.to_dict() for t in todos]), 200


@main_bp.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task."""
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    # parse optional due_date safely
    due_date = None
    due_date_str = data.get('due_date')
    if due_date_str:
        try:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d')
        except Exception:
            due_date = None

    # recurrence fields
    recurrence_type = data.get('recurrence_type')
    recurrence_interval = data.get('recurrence_interval', 1)
    try:
        recurrence_interval = int(recurrence_interval)
    except Exception:
        recurrence_interval = 1
    recurrence_days = data.get('recurrence_days')

    recurrence_end_date = None
    recurrence_end_str = data.get('recurrence_end_date')
    if recurrence_end_str:
        try:
            recurrence_end_date = datetime.strptime(recurrence_end_str, '%Y-%m-%d')
        except Exception:
            recurrence_end_date = None

    todo = Todo(
        title=data['title'],
        description=data.get('description', ''),
        completed=data.get('completed', False),
        due_date=due_date,
        is_recurring=bool(recurrence_type),
        recurrence_type=recurrence_type,
        recurrence_interval=recurrence_interval,
        recurrence_days=recurrence_days,
        recurrence_end_date=recurrence_end_date,
    )
    db.session.add(todo)
    db.session.commit()
    return jsonify(todo.to_dict()), 201


@main_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Read a single task."""
    todo = Todo.query.get_or_404(task_id)
    return jsonify(todo.to_dict()), 200


@main_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update an existing task."""
    todo = Todo.query.get_or_404(task_id)
    data = request.get_json()

    if 'title' in data:
        todo.title = data['title']
    if 'description' in data:
        todo.description = data['description']

    # due_date
    if 'due_date' in data:
        due_date_str = data.get('due_date')
        try:
            todo.due_date = (
                datetime.strptime(due_date_str, '%Y-%m-%d') if due_date_str else None
            )
        except Exception:
            pass

    # recurrence updates
    if 'is_recurring' in data:
        todo.is_recurring = bool(data.get('is_recurring'))
    if 'recurrence_type' in data:
        todo.recurrence_type = data.get('recurrence_type')
    if 'recurrence_interval' in data:
        try:
            todo.recurrence_interval = int(data.get('recurrence_interval') or 1)
        except Exception:
            todo.recurrence_interval = 1
    if 'recurrence_days' in data:
        todo.recurrence_days = data.get('recurrence_days')
    if 'recurrence_end_date' in data:
        recurrence_end_str = data.get('recurrence_end_date')
        try:
            todo.recurrence_end_date = (
                datetime.strptime(recurrence_end_str, '%Y-%m-%d')
                if recurrence_end_str
                else None
            )
        except Exception:
            pass

    # handle completion and generate next occurrence if needed
    if 'completed' in data:
        new_completed_val = bool(data.get('completed'))
        # only generate next occurrence when flipping from incomplete -> complete
        if (
            not todo.completed
            and new_completed_val
            and todo.is_recurring
            and todo.recurrence_type
            and todo.due_date
        ):
            next_due = calculate_next_due_date(
                todo.due_date, todo.recurrence_type, todo.recurrence_interval
            )
            if next_due:
                # check recurrence_end_date
                if (
                    not todo.recurrence_end_date
                    or next_due.date() <= todo.recurrence_end_date.date()
                ):
                    new_todo = Todo(
                        title=todo.title,
                        description=todo.description,
                        completed=False,
                        due_date=next_due,
                        is_recurring=todo.is_recurring,
                        recurrence_type=todo.recurrence_type,
                        recurrence_interval=todo.recurrence_interval,
                        recurrence_days=todo.recurrence_days,
                        recurrence_end_date=todo.recurrence_end_date,
                    )
                    db.session.add(new_todo)

        todo.completed = new_completed_val

    db.session.commit()
    return jsonify(todo.to_dict()), 200


@main_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task."""
    todo = Todo.query.get_or_404(task_id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200

@main_bp.route('/stats', methods=['GET'])
def get_stats():
    """Return simple stats including productivity streaks (current and best)."""
    # collect unique completion dates (based on updated_at)
    todos = Todo.query.filter_by(completed=True).all()
    dates = set()
    for t in todos:
        if t.updated_at:
            dates.add(t.updated_at.date())

    if not dates:
        return jsonify({'current': 0, 'best': 0}), 200

    today = datetime.utcnow().date()
    # current streak: consecutive days ending today
    current = 0
    cursor = today
    while cursor in dates:
        current += 1
        cursor = cursor - timedelta(days=1)

    # best streak: longest consecutive run
    sorted_dates = sorted(dates)
    best = 0
    run = 1
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            run += 1
        else:
            if run > best:
                best = run
            run = 1
    if run > best:
        best = run

    return jsonify({'current': current, 'best': best}), 200
