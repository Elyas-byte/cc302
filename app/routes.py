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
