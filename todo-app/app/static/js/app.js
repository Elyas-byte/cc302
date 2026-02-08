// localStorage TODO App
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentView = 'dashboard';
        this.init();
    }

    // Load todos from localStorage
    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    // Save todos to localStorage
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // Initialize the app
    init() {
        this.setupEventListeners();
        this.renderDashboard();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Use event delegation on document for all interactions
        // Only set up once, not on every render
        if (this.listenersInitialized) return;
        this.listenersInitialized = true;

        // Form submission via event delegation
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'todoForm') {
                e.preventDefault();
                this.handleFormSubmit();
            }
        });

        // Global event delegation for all button/checkbox interactions
        document.addEventListener('click', (e) => {
            // Navigation - Dashboard/Home button
            if (e.target.id === 'dashboardBtn') {
                e.preventDefault();
                this.renderDashboard();
            }
            // Navigation - Add button
            if (e.target.id === 'addBtn') {
                e.preventDefault();
                this.renderAddForm();
            }
            // Delete button
            if (e.target.classList.contains('delete-btn')) {
                const id = parseInt(e.target.dataset.id);
                if (!isNaN(id)) {
                    this.deleteTodo(id);
                }
            }
            // Edit button
            if (e.target.classList.contains('edit-btn')) {
                const id = parseInt(e.target.dataset.id);
                if (!isNaN(id)) {
                    this.renderEditForm(id);
                }
            }
            // View button
            if (e.target.classList.contains('view-btn')) {
                const id = parseInt(e.target.dataset.id);
                if (!isNaN(id)) {
                    this.renderDetailView(id);
                }
            }
            // Toggle checkbox
            if (e.target.classList.contains('toggle-checkbox')) {
                const id = parseInt(e.target.dataset.id);
                if (!isNaN(id)) {
                    this.toggleTodo(id);
                }
            }
            // Cancel edit button - needs to get ID from form
            if (e.target.classList.contains('cancel-edit-btn')) {
                const form = document.getElementById('todoForm');
                if (form && form.dataset.todoId) {
                    const id = parseInt(form.dataset.todoId);
                    this.renderDetailView(id);
                } else {
                    this.renderDashboard();
                }
            }
        });
    }

    // Create a new todo
    addTodo(title, description = '', dueDate = null) {
        const newTodo = {
            id: Date.now(),
            title,
            description,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate
        };
        this.todos.push(newTodo);
        this.saveTodos();
        this.showNotification(`Todo "${title}" created successfully!`, 'success');
        return newTodo;
    }

    // Update a todo
    updateTodo(id, updates) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            Object.assign(todo, updates, { updatedAt: new Date().toISOString() });
            this.saveTodos();
            return todo;
        }
        return null;
    }

    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            todo.updatedAt = new Date().toISOString();
            this.saveTodos();
            this.showNotification(
                `Todo marked as ${todo.completed ? 'completed' : 'incomplete'}!`,
                'success'
            );
            this.renderDashboard();
        }
    }

    // Delete a todo
    deleteTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.showNotification(`Todo "${todo.title}" deleted successfully!`, 'success');
            this.renderDashboard();
        }
    }

    // Get a single todo
    getTodo(id) {
        return this.todos.find(t => t.id === id);
    }

    // Get statistics
    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;
        return { total, completed, pending };
    }

    // Format date
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    // Show notification
    showNotification(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        const container = document.getElementById('alertContainer');
        container.innerHTML = '';
        container.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
    }

    // Form submission handler
    handleFormSubmit() {
        const formType = document.getElementById('todoForm').dataset.formType;
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const dueDate = document.getElementById('dueDate').value || null;

        if (!title) {
            this.showNotification('Title is required!', 'danger');
            return;
        }

        if (formType === 'add') {
            this.addTodo(title, description, dueDate);
            this.renderDashboard();
        } else if (formType === 'edit') {
            const id = parseInt(document.getElementById('todoForm').dataset.todoId);
            this.updateTodo(id, { title, description, dueDate });
            this.showNotification(`Todo "${title}" updated successfully!`, 'success');
            this.renderDetailView(id);
        }
    }

    // Render dashboard
    renderDashboard() {
        const content = document.getElementById('content');
        const stats = this.getStats();

        let html = `
            <div class="row">
                <div class="col-lg-10 mx-auto">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h1>📋 My Todos</h1>
                        <button id="addBtn" class="btn btn-primary btn-lg">+ Add New Todo</button>
                    </div>

                    ${stats.total > 0 ? `
                        <div class="stats">
                            <div class="stat-box">
                                <div class="stat-number">${stats.total}</div>
                                <div class="stat-label">Total Todos</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-number">${stats.completed}</div>
                                <div class="stat-label">Completed</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-number">${stats.pending}</div>
                                <div class="stat-label">Pending</div>
                            </div>
                        </div>
                    ` : ''}

                    ${this.todos.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Status</th>
                                        <th>Title</th>
                                        <th>Due Date</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.todos.map(todo => `
                                        <tr>
                                            <td>
                                                <input type="checkbox" class="form-check-input toggle-checkbox" 
                                                       data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
                                            </td>
                                            <td>
                                                <a href="#" data-id="${todo.id}" class="text-decoration-none view-btn ${todo.completed ? 'completed' : ''}">
                                                    ${this.escapeHtml(todo.title)}
                                                </a>
                                            </td>
                                            <td>
                                                ${this.formatDate(todo.dueDate)}
                                            </td>
                                            <td class="text-muted">${this.formatDate(todo.createdAt)}</td>
                                            <td>
                                                <button data-id="${todo.id}" class="btn btn-sm btn-outline-primary edit-btn">Edit</button>
                                                <button data-id="${todo.id}" class="btn btn-sm btn-outline-danger delete-btn">Delete</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="card text-center p-5">
                            <h5 class="text-muted">No todos yet!</h5>
                            <p class="text-muted mb-3">Create your first todo to get started</p>
                            <button id="addBtn" class="btn btn-primary">Create First Todo</button>
                        </div>
                    `}
                </div>
            </div>
        `;

        content.innerHTML = html;
    }

    // Render add form
    renderAddForm() {
        const content = document.getElementById('content');
        const html = `
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <h1 class="mb-4">➕ Add New Todo</h1>
                    <div class="card">
                        <div class="card-body p-4">
                            <form id="todoForm" data-form-type="add">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Title <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control form-control-lg" id="title" 
                                           placeholder="What do you need to do?" required autofocus>
                                </div>
                                <div class="mb-3">
                                    <label for="description" class="form-label">Description</label>
                                    <textarea class="form-control" id="description" rows="5"
                                              placeholder="Add more details about this todo (optional)"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="dueDate" class="form-label">Due Date</label>
                                    <input type="date" class="form-control" id="dueDate">
                                </div>
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-primary btn-lg">Create Todo</button>
                                    <button type="button" id="dashboardBtn" class="btn btn-secondary btn-lg">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        content.innerHTML = html;
    }

    // Render detail view
    renderDetailView(id) {
        const todo = this.getTodo(id);
        if (!todo) {
            this.showNotification('Todo not found!', 'danger');
            return;
        }

        const content = document.getElementById('content');
        const html = `
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <button id="dashboardBtn" class="btn btn-outline-secondary mb-3">← Back to List</button>
                    <div class="card">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h1 class="card-title ${todo.completed ? 'completed' : ''}">
                                        ${this.escapeHtml(todo.title)}
                                    </h1>
                                    <p class="text-muted mb-0">
                                        <span class="badge ${todo.completed ? 'bg-success' : 'bg-warning text-dark'}">
                                            ${todo.completed ? '✓ Completed' : '⏳ Pending'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            ${todo.description ? `
                                <div class="mb-4">
                                    <h5>Description</h5>
                                    <p class="lead">${this.escapeHtml(todo.description)}</p>
                                </div>
                            ` : ''}

                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <h6 class="text-muted">Created</h6>
                                    <p>${new Date(todo.createdAt).toLocaleString()}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-muted">Last Updated</h6>
                                    <p>${new Date(todo.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            ${todo.dueDate ? `
                                <div class="alert alert-info">
                                    <strong>Due Date:</strong> ${this.formatDate(todo.dueDate)}
                                </div>
                            ` : ''}

                            <div class="d-flex gap-2">
                                <button data-id="${todo.id}" class="btn btn-primary btn-lg edit-btn">Edit</button>
                                <button data-id="${todo.id}" class="btn btn-${todo.completed ? 'warning' : 'success'} btn-lg toggle-checkbox" style="cursor: pointer;">
                                    ${todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                </button>
                                <button data-id="${todo.id}" class="btn btn-danger btn-lg delete-btn">Delete</button>
                                <button id="dashboardBtn" class="btn btn-secondary btn-lg">Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        content.innerHTML = html;
    }

    // Render edit form
    renderEditForm(id) {
        const todo = this.getTodo(id);
        if (!todo) {
            this.showNotification('Todo not found!', 'danger');
            return;
        }

        const content = document.getElementById('content');
        const html = `
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <button id="dashboardBtn" class="btn btn-outline-secondary mb-3">← Back</button>
                    <h1 class="mb-4">✏️ Edit Todo</h1>
                    <div class="card">
                        <div class="card-body p-4">
                            <form id="todoForm" data-form-type="edit" data-todo-id="${id}">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Title <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control form-control-lg" id="title" 
                                           value="${this.escapeHtml(todo.title)}" required autofocus>
                                </div>
                                <div class="mb-3">
                                    <label for="description" class="form-label">Description</label>
                                    <textarea class="form-control" id="description" rows="5">${this.escapeHtml(todo.description || '')}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="dueDate" class="form-label">Due Date</label>
                                    <input type="date" class="form-control" id="dueDate" 
                                           value="${todo.dueDate ? this.formatDate(todo.dueDate) : ''}">
                                </div>
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-primary btn-lg">Save Changes</button>
                                    <button type="button" class="btn btn-secondary btn-lg cancel-edit-btn">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        content.innerHTML = html;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});
