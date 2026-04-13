from flask import Blueprint, render_template, request, jsonify
from app import db
from app.models import Todo
from datetime import datetime, timedelta

main_bp = Blueprint('main', __name__)


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

    # parse optional due_date
    due_date = None
    due_date_str = data.get('due_date')
    if due_date_str:
        try:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d')
        except Exception:
            due_date = None

    # reminder minutes (minutes before due_date to notify)
    reminder_minutes = None
    if data.get('reminder_minutes') is not None:
        try:
            reminder_minutes = int(data.get('reminder_minutes'))
        except Exception:
            reminder_minutes = None

    todo = Todo(
        title=data['title'],
        description=data.get('description', ''),
        completed=data.get('completed', False),
        due_date=due_date,
        reminder_minutes=reminder_minutes,
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
    if 'completed' in data:
        todo.completed = data['completed']
    if 'due_date' in data:
        due_date_str = data.get('due_date')
        try:
            todo.due_date = datetime.strptime(due_date_str, '%Y-%m-%d') if due_date_str else None
        except Exception:
            pass
    if 'reminder_minutes' in data:
        try:
            rm_val = data.get('reminder_minutes')
            if rm_val in (None, ''):
                todo.reminder_minutes = None
            else:
                todo.reminder_minutes = int(rm_val)
        except Exception:
            todo.reminder_minutes = None

    db.session.commit()
    return jsonify(todo.to_dict()), 200


@main_bp.route('/reminders/due-soon', methods=['GET'])
def reminders_due_soon():
    """Return tasks that should trigger reminders now.

    Logic:
    - If a task has `reminder_minutes`, trigger when now is between
      (due_date - reminder_minutes) and due_date.
    - Otherwise, include tasks due within `within_minutes` query param (defaults to 1440).
    - Include overdue tasks (now > due_date) as 'overdue'.
    """
    within_minutes = request.args.get('within_minutes')
    try:
        within_minutes = int(within_minutes) if within_minutes is not None else 1440
    except Exception:
        within_minutes = 1440

    now = datetime.utcnow()
    upcoming_cutoff = now + timedelta(minutes=within_minutes)

    todos = Todo.query.filter_by(completed=False).all()
    results = []
    for t in todos:
        if not t.due_date:
            continue
        status = None
        # reminder_minutes takes precedence
        if t.reminder_minutes is not None:
            try:
                reminder_time = t.due_date - timedelta(minutes=int(t.reminder_minutes))
                if reminder_time <= now <= t.due_date:
                    status = 'due_soon'
                elif now > t.due_date:
                    status = 'overdue'
            except Exception:
                status = None
        else:
            # fallback to within_minutes window
            if now <= t.due_date <= upcoming_cutoff:
                status = 'upcoming'
            elif now > t.due_date:
                status = 'overdue'

        if status:
            item = t.to_dict()
            item['reminder_status'] = status
            results.append(item)

    return jsonify(results), 200


@main_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task."""
    todo = Todo.query.get_or_404(task_id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200
