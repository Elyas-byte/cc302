"""
CRUD Test Suite for the Todo Application.

Tests Create, Read, Update, and Delete operations
using pytest and Flask's test client.
Each test follows the AAA pattern: Arrange, Act, Assert.
"""

import pytest
from app import create_app, db
from config import TestingConfig


@pytest.fixture
def app():
    """Arrange: Create a fresh app with an in-memory database for each test."""
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Provide a test client to simulate HTTP requests."""
    return app.test_client()


# ── CREATE Tests ──────────────────────────────────────────────

def test_create_task(client):
    """Test creating a new task via POST /tasks."""
    # Arrange — nothing extra needed, clean DB from fixture

    # Act — send a POST request with JSON payload
    resp = client.post("/tasks", json={"title": "Buy milk"})

    # Assert — status code is 201 Created
    assert resp.status_code == 201

    # Assert — response body contains the task title
    data = resp.get_json()
    assert data["title"] == "Buy milk"
    assert data["id"] is not None

    # Read / Verify — task appears in the list
    resp2 = client.get("/tasks")
    assert resp2.status_code == 200
    assert "Buy milk" in resp2.get_data(as_text=True)


def test_create_task_without_title_fails(client):
    """Test that creating a task without a title returns 400."""
    # Arrange — empty payload

    # Act
    resp = client.post("/tasks", json={})

    # Assert
    assert resp.status_code == 400
    assert "error" in resp.get_json()


# ── UPDATE Tests ──────────────────────────────────────────────

def test_update_task(client):
    """Test updating an existing task via PUT /tasks/<id>."""
    # Arrange — create a task first
    create_resp = client.post("/tasks", json={"title": "Old title"})
    assert create_resp.status_code == 201
    task_id = create_resp.get_json()["id"]

    # Act — update the title
    update_resp = client.put(
        f"/tasks/{task_id}",
        json={"title": "New title"},
    )

    # Assert — status code and updated title
    assert update_resp.status_code == 200
    assert update_resp.get_json()["title"] == "New title"

    # Read / Verify — list reflects the change
    list_resp = client.get("/tasks")
    body = list_resp.get_data(as_text=True)
    assert "New title" in body
    assert "Old title" not in body


def test_update_task_completed(client):
    """Test marking a task as completed."""
    # Arrange
    create_resp = client.post("/tasks", json={"title": "Finish homework"})
    task_id = create_resp.get_json()["id"]

    # Act
    update_resp = client.put(
        f"/tasks/{task_id}",
        json={"completed": True},
    )

    # Assert
    assert update_resp.status_code == 200
    assert update_resp.get_json()["completed"] is True


# ── DELETE Tests ──────────────────────────────────────────────

def test_delete_task(client):
    """Test deleting a task via DELETE /tasks/<id>."""
    # Arrange — create a task first
    create_resp = client.post("/tasks", json={"title": "To be deleted"})
    assert create_resp.status_code == 201
    task_id = create_resp.get_json()["id"]

    # Act — delete the task
    delete_resp = client.delete(f"/tasks/{task_id}")

    # Assert — status code
    assert delete_resp.status_code == 200

    # Read / Verify — task no longer in the list
    list_resp = client.get("/tasks")
    body = list_resp.get_data(as_text=True)
    assert "To be deleted" not in body


def test_delete_nonexistent_task_returns_404(client):
    """Test that deleting a task that doesn't exist returns 404."""
    # Arrange — no tasks exist

    # Act
    resp = client.delete("/tasks/9999")

    # Assert
    assert resp.status_code == 404


# ── READ / LIST Tests ────────────────────────────────────────

def test_list_tasks_empty(client):
    """Test that GET /tasks returns an empty list initially."""
    # Act
    resp = client.get("/tasks")

    # Assert
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_list_tasks_after_multiple_creates(client):
    """Test that all created tasks appear in the list."""
    # Arrange — create several tasks
    titles = ["Task A", "Task B", "Task C"]
    for title in titles:
        client.post("/tasks", json={"title": title})

    # Act
    resp = client.get("/tasks")

    # Assert
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    for title in titles:
        assert title in body


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
