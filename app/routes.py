from flask import Blueprint, render_template, request, jsonify
from app import db
from app.models import Todo

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

    todo = Todo(
        title=data['title'],
        description=data.get('description', ''),
        completed=data.get('completed', False),
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
