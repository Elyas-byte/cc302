// localStorage TODO App
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentView = 'dashboard';
        this.statsChart = null;
        this.progressChart = null;
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
        alertDiv.className = `alert alert-${type}`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `${message}`;
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
            <div class="action-bar">
                <div class="action-bar-title">
                    ${this.todos.length} ${this.todos.length === 1 ? 'task' : 'tasks'}
                </div>
                <button id="addBtn" class="btn btn-primary">+ Add Task</button>
            </div>

            ${stats.total > 0 ? `
                <div style="display:grid;grid-template-columns:2fr 1fr;gap:1rem;margin-bottom:1.5rem;">
                    <div class="stat-box">
                        <div style="height:220px;">
                            <canvas id="progressChart"></canvas>
                        </div>
                        <div class="stat-label" style="margin-top:0.5rem;">Completed per day</div>
                    </div>
                    <div class="stat-box" style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
                        <div style="width:100%;height:140px;">
                            <canvas id="statsChart"></canvas>
                        </div>
                        <div class="stat-label" style="margin-top:0.5rem;">Overview</div>
                    </div>
                </div>
            ` : ''}

            ${this.todos.length > 0 ? `
                <div class="card">
                    ${this.todos.map(todo => `
                        <div class="todo-item">
                            <input type="checkbox" class="form-check-input toggle-checkbox" 
                                   data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
                            <div class="todo-item-content">
                                <a href="#" data-id="${todo.id}" class="text-decoration-none view-btn">
                                    <div class="todo-item-title ${todo.completed ? 'completed' : ''}">
                                        ${this.escapeHtml(todo.title)}
                                    </div>
                                </a>
                                ${todo.dueDate ? `
                                    <div class="todo-item-date">📅 ${this.formatDate(todo.dueDate)}</div>
                                ` : ''}
                            </div>
                            <div class="todo-item-actions">
                                <button data-id="${todo.id}" class="icon-btn edit-btn" title="Edit">✏️</button>
                                <button data-id="${todo.id}" class="icon-btn danger delete-btn" title="Delete">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">✨</div>
                    <div class="empty-state-title">No tasks yet</div>
                    <div class="empty-state-text">Create your first task to get started</div>
                    <button id="addBtn" class="btn btn-primary">Create First Task</button>
                </div>
            `}
        `;

        content.innerHTML = html;
        // After DOM is updated, render the charts
        this.renderStatsChart();
        this.renderProgressChart();
    }

    // Render the pie chart showing Completed / Overdue / Incomplete
    renderStatsChart() {
        if (typeof Chart === 'undefined') return;
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const today = new Date();
        today.setHours(0,0,0,0);
        const overdue = this.todos.filter(t => !t.completed && t.dueDate && (new Date(t.dueDate) < today)).length;
        const incomplete = Math.max(0, total - completed - overdue);

        const canvas = document.getElementById('statsChart');
        if (!canvas) return;

        if (this.statsChart) {
            try { this.statsChart.destroy(); } catch (e) { }
            this.statsChart = null;
        }

        this.statsChart = new Chart(canvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Completed', 'Overdue', 'Incomplete'],
                datasets: [{
                    data: [completed, overdue, incomplete],
                    backgroundColor: ['#4caf50', '#f44336', '#ff9800']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Render line chart showing how many tasks were completed per day (last 7 days)
    renderProgressChart(days = 7) {
        if (typeof Chart === 'undefined') return;

        const labels = [];
        const counts = [];
        const today = new Date();
        today.setHours(0,0,0,0);

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
            counts.push(0);
        }

        // Count completed tasks by their updatedAt date (best-effort completion date)
        this.todos.forEach(todo => {
            if (!todo.completed || !todo.updatedAt) return;
            const ud = new Date(todo.updatedAt);
            ud.setHours(0,0,0,0);
            const diffDays = Math.round((ud - today) / (1000 * 60 * 60 * 24));
            // diffDays is 0 for today, negative for past
            const index = labels.length - 1 + diffDays; // convert relative to labels index
            // Instead compute index by matching date string
            const udLabel = ud.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const li = labels.indexOf(udLabel);
            if (li !== -1) counts[li] += 1;
        });

        const canvas = document.getElementById('progressChart');
        if (!canvas) return;

        if (this.progressChart) {
            try { this.progressChart.destroy(); } catch (e) { }
            this.progressChart = null;
        }

        this.progressChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completed',
                    data: counts,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37,99,235,0.08)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
    }

    // Render add form
    renderAddForm() {
        const content = document.getElementById('content');
        const html = `
            <a href="#" id="dashboardBtn" class="back-link">← Back</a>
            <div style="max-width: 600px;">
                <div class="card" style="padding: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem;">Add a new task</h2>
                    <form id="todoForm" data-form-type="add" style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <div>
                            <label for="title" class="form-label">Title <span style="color: var(--danger);">*</span></label>
                            <input type="text" class="form-control form-control-lg" id="title" 
                                   placeholder="What do you need to do?" required autofocus
                                   style="padding: 0.75rem; font-size: 1rem;">
                        </div>
                        <div>
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control" id="description" rows="4"
                                      placeholder="Add more details about this task (optional)"
                                      style="padding: 0.75rem; font-size: 1rem;"></textarea>
                        </div>
                        <div>
                            <label for="dueDate" class="form-label">Due Date</label>
                            <input type="date" class="form-control" id="dueDate"
                                   style="padding: 0.75rem; font-size: 1rem;">
                        </div>
                        <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
                            <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.5rem; font-size: 1rem;">Create Task</button>
                            <button type="button" id="dashboardBtn" class="btn btn-ghost" style="padding: 0.75rem 1.5rem; font-size: 1rem;">Cancel</button>
                        </div>
                    </form>
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
            <a href="#" id="dashboardBtn" class="back-link">← Back to list</a>
            <div style="max-width: 600px;">
                <div class="card" style="padding: 2rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <div style="margin-bottom: 1rem;">
                            <h1 style="font-size: 1.875rem; font-weight: 600; margin: 0;" class="${todo.completed ? 'completed' : ''}">
                                ${this.escapeHtml(todo.title)}
                            </h1>
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <span class="badge ${todo.completed ? 'badge-success' : 'badge-warning'}">
                                ${todo.completed ? '✓ Completed' : '⏳ Pending'}
                            </span>
                        </div>
                    </div>

                    ${todo.description ? `
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="font-size: 0.95rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Description</h3>
                            <p style="font-size: 1rem; color: var(--text-primary); line-height: 1.6;">${this.escapeHtml(todo.description)}</p>
                        </div>
                    ` : ''}

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border-color);">
                        <div>
                            <h6 style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Created</h6>
                            <p style="font-size: 0.95rem; color: var(--text-primary); margin: 0;">${new Date(todo.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h6 style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Updated</h6>
                            <p style="font-size: 0.95rem; color: var(--text-primary); margin: 0;">${new Date(todo.updatedAt).toLocaleDateString()}</p>
                        </div>
                        ${todo.dueDate ? `
                            <div>
                                <h6 style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Due Date</h6>
                                <p style="font-size: 0.95rem; color: var(--text-primary); margin: 0;">${this.formatDate(todo.dueDate)}</p>
                            </div>
                        ` : ''}
                    </div>

                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <button data-id="${todo.id}" class="btn btn-${todo.completed ? 'secondary' : 'success'} toggle-checkbox" style="padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer;">
                            ${todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                        <button data-id="${todo.id}" class="btn btn-primary edit-btn" style="padding: 0.75rem 1.5rem; font-size: 1rem;">Edit</button>
                        <button data-id="${todo.id}" class="btn btn-danger delete-btn" style="padding: 0.75rem 1.5rem; font-size: 1rem;">Delete</button>
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
            <a href="#" id="dashboardBtn" class="back-link">← Back</a>
            <div style="max-width: 600px;">
                <div class="card" style="padding: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem;">Edit task</h2>
                    <form id="todoForm" data-form-type="edit" data-todo-id="${id}" style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <div>
                            <label for="title" class="form-label">Title <span style="color: var(--danger);">*</span></label>
                            <input type="text" class="form-control form-control-lg" id="title" 
                                   value="${this.escapeHtml(todo.title)}" required autofocus
                                   style="padding: 0.75rem; font-size: 1rem;">
                        </div>
                        <div>
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control" id="description" rows="4"
                                      placeholder="Add more details about this task (optional)"
                                      style="padding: 0.75rem; font-size: 1rem;">${this.escapeHtml(todo.description || '')}</textarea>
                        </div>
                        <div>
                            <label for="dueDate" class="form-label">Due Date</label>
                            <input type="date" class="form-control" id="dueDate" 
                                   value="${todo.dueDate ? this.formatDate(todo.dueDate) : ''}"
                                   style="padding: 0.75rem; font-size: 1rem;">
                        </div>
                        <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
                            <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.5rem; font-size: 1rem;">Save Changes</button>
                            <button type="button" class="btn btn-ghost cancel-edit-btn" style="padding: 0.75rem 1.5rem; font-size: 1rem;">Cancel</button>
                        </div>
                    </form>
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
