// localStorage TODO App
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentView = 'dashboard';
        this.statsChart = null;
        this.progressChart = null;
        this.searchQuery = '';
        this.initializeIdCounter();
        this.init();
    }

    // Initialize ID counter to be higher than all existing IDs
    initializeIdCounter() {
        let maxId = Date.now();
        
        // Check all todo IDs
        this.todos.forEach(todo => {
            if (todo.id > maxId) maxId = todo.id;
            // Check all subtask IDs
            if (todo.subtasks && Array.isArray(todo.subtasks)) {
                todo.subtasks.forEach(subtask => {
                    if (subtask.id > maxId) maxId = subtask.id;
                });
            }
        });
        
        this.idCounter = maxId;
    }

    // Generate unique IDs
    generateId() {
        return ++this.idCounter;
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
            if (e.target.id === 'subtaskForm') {
                e.preventDefault();
                this.handleSubtaskSubmit();
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
            // View button - check both the link and the inner div
            const viewBtn = e.target.closest('.view-btn');
            if (viewBtn) {
                const id = parseInt(viewBtn.dataset.id);
                if (!isNaN(id)) {
                    e.preventDefault();
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
            // Subtask toggle
            if (e.target.classList.contains('subtask-toggle')) {
                const todoId = parseInt(e.target.dataset.todoId);
                const subtaskId = parseInt(e.target.dataset.subtaskId);
                if (!isNaN(todoId) && !isNaN(subtaskId)) {
                    this.toggleSubtask(todoId, subtaskId);
                    this.renderDetailView(todoId);
                }
            }
            // Subtask delete button
            if (e.target.classList.contains('subtask-delete-btn')) {
                const todoId = parseInt(e.target.dataset.todoId);
                const subtaskId = parseInt(e.target.dataset.subtaskId);
                if (!isNaN(todoId) && !isNaN(subtaskId)) {
                    this.deleteSubtask(todoId, subtaskId);
                    this.renderDetailView(todoId);
                }
            }
            // Subtask move up
            if (e.target.classList.contains('subtask-up-btn')) {
                const todoId = parseInt(e.target.dataset.todoId);
                const subtaskId = parseInt(e.target.dataset.subtaskId);
                if (!isNaN(todoId) && !isNaN(subtaskId)) {
                    const todo = this.getTodo(todoId);
                    const currentIndex = todo.subtasks.findIndex(s => s.id === subtaskId);
                    if (currentIndex > 0) {
                        this.reorderSubtask(todoId, subtaskId, currentIndex - 1);
                        this.renderDetailView(todoId);
                    }
                }
            }
            // Subtask move down
            if (e.target.classList.contains('subtask-down-btn')) {
                const todoId = parseInt(e.target.dataset.todoId);
                const subtaskId = parseInt(e.target.dataset.subtaskId);
                if (!isNaN(todoId) && !isNaN(subtaskId)) {
                    const todo = this.getTodo(todoId);
                    const currentIndex = todo.subtasks.findIndex(s => s.id === subtaskId);
                    if (currentIndex < todo.subtasks.length - 1) {
                        this.reorderSubtask(todoId, subtaskId, currentIndex + 1);
                        this.renderDetailView(todoId);
                    }
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
            // Add subtask form toggle
            if (e.target.id === 'addSubtaskBtn') {
                e.preventDefault();
                const form = document.getElementById('subtaskForm');
                if (form) {
                    form.style.display = form.style.display === 'none' ? 'block' : 'none';
                    if (form.style.display === 'block') {
                        document.getElementById('subtaskInput').focus();
                    }
                }
            }
        });

        // Search input event listener
        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchInput') {
                this.searchQuery = e.target.value;
                // Save cursor position before rendering
                const cursorPos = e.target.selectionStart;
                this.renderDashboard(cursorPos);
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
            dueDate,
            subtasks: []
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

    // Add a subtask
    addSubtask(todoId, title) {
        const todo = this.getTodo(todoId);
        if (!todo) return null;
        
        // Ensure subtasks array exists
        if (!todo.subtasks) {
            todo.subtasks = [];
        }
        
        const subtask = {
            id: this.generateId(),
            title: title,
            isDone: false,
            order: todo.subtasks.length
        };
        
        todo.subtasks.push(subtask);
        todo.updatedAt = new Date().toISOString();
        this.saveTodos();
        return subtask;
    }

    // Toggle subtask completion
    toggleSubtask(todoId, subtaskId) {
        const todo = this.getTodo(todoId);
        if (!todo || !Array.isArray(todo.subtasks) || todo.subtasks.length === 0) {
            return null;
        }
        
        // Ensure IDs are numbers for comparison
        const numericSubtaskId = Number(subtaskId);
        const subtask = todo.subtasks.find(s => Number(s.id) === numericSubtaskId);
        
        if (subtask) {
            subtask.isDone = !subtask.isDone;
            todo.updatedAt = new Date().toISOString();
            this.saveTodos();
            return subtask;
        }
        return null;
    }

    // Delete a subtask
    deleteSubtask(todoId, subtaskId) {
        const todo = this.getTodo(todoId);
        if (!todo || !Array.isArray(todo.subtasks)) return null;
        
        const numericSubtaskId = Number(subtaskId);
        const index = todo.subtasks.findIndex(s => Number(s.id) === numericSubtaskId);
        
        if (index !== -1) {
            const deleted = todo.subtasks.splice(index, 1)[0];
            // Reorder remaining subtasks
            todo.subtasks.forEach((s, i) => {
                s.order = i;
            });
            todo.updatedAt = new Date().toISOString();
            this.saveTodos();
            return deleted;
        }
        return null;
    }

    // Reorder subtasks
    reorderSubtask(todoId, subtaskId, newOrder) {
        const todo = this.getTodo(todoId);
        if (!todo || !Array.isArray(todo.subtasks)) return null;
        
        const numericSubtaskId = Number(subtaskId);
        const subtaskIndex = todo.subtasks.findIndex(s => Number(s.id) === numericSubtaskId);
        
        if (subtaskIndex === -1) return null;
        
        const subtask = todo.subtasks[subtaskIndex];
        
        if (newOrder < 0 || newOrder >= todo.subtasks.length) return null;
        if (newOrder === subtaskIndex) return subtask;
        
        // Remove from current position
        todo.subtasks.splice(subtaskIndex, 1);
        // Insert at new position
        todo.subtasks.splice(newOrder, 0, subtask);
        
        // Reorder all subtasks by their position in the array
        todo.subtasks.forEach((s, i) => {
            s.order = i;
        });
        
        todo.updatedAt = new Date().toISOString();
        this.saveTodos();
        return subtask;
    }

    // Get subtask stats for a todo
    getSubtaskStats(todoId) {
        const todo = this.getTodo(todoId);
        if (!todo || !todo.subtasks) return { total: 0, completed: 0 };
        
        const total = todo.subtasks.length;
        const completed = todo.subtasks.filter(s => s.isDone).length;
        return { total, completed };
    }

    // Get statistics
    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;
        return { total, completed, pending };
    }

    // Search todos
    searchTodos(query) {
        if (!query || query.trim().length === 0) {
            return this.todos;
        }

        const searchTerm = query.toLowerCase().trim();
        return this.todos.filter(todo => {
            const titleMatch = todo.title.toLowerCase().includes(searchTerm);
            const descriptionMatch = todo.description && todo.description.toLowerCase().includes(searchTerm);
            return titleMatch || descriptionMatch;
        });
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
            const todo = this.addTodo(title, description, dueDate);
            
            // Add initial subtasks if any
            const formSubtasks = this.getFormSubtasks();
            formSubtasks.forEach(s => {
                this.addSubtask(todo.id, s.title);
            });
            
            // Clear form subtasks
            localStorage.removeItem('formSubtasks');
            
            this.renderDashboard();
        } else if (formType === 'edit') {
            const id = parseInt(document.getElementById('todoForm').dataset.todoId);
            this.updateTodo(id, { title, description, dueDate });
            this.showNotification(`Todo "${title}" updated successfully!`, 'success');
            this.renderDetailView(id);
        }
    }

    // Handle subtask form submission
    handleSubtaskSubmit() {
        const form = document.getElementById('subtaskForm');
        const todoId = parseInt(form.dataset.todoId);
        const title = document.getElementById('subtaskInput').value.trim();

        if (!title) {
            this.showNotification('Subtask title is required!', 'danger');
            return;
        }

        this.addSubtask(todoId, title);
        document.getElementById('subtaskInput').value = '';
        form.style.display = 'none';
        this.showNotification('Subtask added!', 'success');
        this.renderDetailView(todoId);
    }

    // Render dashboard
    renderDashboard(cursorPos = null) {
        // Clear form subtasks when returning home
        localStorage.removeItem('formSubtasks');
        
        const content = document.getElementById('content');
        const stats = this.getStats();
        const displayedTodos = this.searchTodos(this.searchQuery);
        const isSearching = this.searchQuery.length > 0;

        let html = `
            <div class="action-bar">
                <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                    <div class="action-bar-title">
                        ${isSearching ? `Search results: ${displayedTodos.length}` : `${this.todos.length} ${this.todos.length === 1 ? 'task' : 'tasks'}`}
                    </div>
                </div>
                <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                    <input type="text" id="searchInput" class="form-control" 
                           placeholder="Search tasks..." 
                           value="${this.escapeHtml(this.searchQuery)}"
                           style="max-width: 300px; padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--border-color); background-color: var(--bg-white); color: var(--text-primary);">
                    <button id="addBtn" class="btn btn-primary">+ Add Task</button>
                </div>
            </div>

            ${!isSearching && stats.total > 0 ? `
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

            ${displayedTodos.length > 0 ? `
                <div class="card">
                    ${displayedTodos.map(todo => {
                        const subtaskStats = this.getSubtaskStats(todo.id);
                        const hasSubtasks = subtaskStats.total > 0;
                        return `
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
                                ${hasSubtasks ? `
                                    <div style="margin-top: 0.5rem;">
                                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
                                            ${subtaskStats.completed}/${subtaskStats.total} subtasks
                                        </div>
                                        <div style="width: 100%; height: 4px; background-color: var(--border-color); border-radius: 2px; overflow: hidden;">
                                            <div style="height: 100%; width: ${(subtaskStats.completed / subtaskStats.total) * 100}%; background-color: var(--success); transition: width 0.3s;"></div>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="todo-item-actions">
                                <button data-id="${todo.id}" class="icon-btn edit-btn" title="Edit">✏️</button>
                                <button data-id="${todo.id}" class="icon-btn danger delete-btn" title="Delete">🗑️</button>
                            </div>
                        </div>
                    `;
                    }).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">${isSearching ? '🔍' : '✨'}</div>
                    <div class="empty-state-title">${isSearching ? 'No matching tasks' : 'No tasks yet'}</div>
                    <div class="empty-state-text">${isSearching ? 'Try a different search or create a new task' : 'Create your first task to get started'}</div>
                    <button id="addBtn" class="btn btn-primary">Create First Task</button>
                </div>
            `}
        `;

        content.innerHTML = html;
        // Restore focus and cursor position to search input if searching
        if (isSearching) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                // Restore cursor position if available
                if (cursorPos !== null) {
                    searchInput.setSelectionRange(cursorPos, cursorPos);
                }
            }
        }
        // After DOM is updated, render the charts only when not searching
        if (!isSearching) {
            this.renderStatsChart();
            this.renderProgressChart();
        }
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

                        <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: 0.5rem;">
                            <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">Subtasks (optional)</h3>
                            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                                <input type="text" id="newSubtaskInput" class="form-control" 
                                       placeholder="Add a subtask..." style="padding: 0.75rem; font-size: 1rem;">
                                <button type="button" id="addInitialSubtaskBtn" class="btn btn-primary" style="padding: 0.75rem 1rem; white-space: nowrap;">Add</button>
                            </div>
                            <div id="initialSubtasksList" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
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
        
        // Set up event listeners for subtask addition
        document.getElementById('addInitialSubtaskBtn').addEventListener('click', (e) => {
            e.preventDefault();
            const input = document.getElementById('newSubtaskInput');
            const title = input.value.trim();
            if (title) {
                this.addInitialSubtask(title);
                input.value = '';
                input.focus();
            }
        });
        
        // Allow Enter key to add subtask
        document.getElementById('newSubtaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('addInitialSubtaskBtn').click();
            }
        });

        // Render any existing initial subtasks
        this.renderFormSubtasks();
    }

    addInitialSubtask(title) {
        const list = document.getElementById('initialSubtasksList');
        const subtasks = this.getFormSubtasks();
        const id = this.generateId();
        subtasks.push({ id, title });
        localStorage.setItem('formSubtasks', JSON.stringify(subtasks));
        this.renderFormSubtasks();
    }

    removeInitialSubtask(id) {
        let subtasks = this.getFormSubtasks();
        subtasks = subtasks.filter(s => s.id !== id);
        localStorage.setItem('formSubtasks', JSON.stringify(subtasks));
        this.renderFormSubtasks();
    }

    getFormSubtasks() {
        const stored = localStorage.getItem('formSubtasks');
        return stored ? JSON.parse(stored) : [];
    }

    renderFormSubtasks() {
        const subtasks = this.getFormSubtasks();
        const list = document.getElementById('initialSubtasksList');
        
        list.innerHTML = subtasks.map(s => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background-color: var(--bg-light); border-radius: 0.5rem;">
                <span style="color: var(--text-primary);">${this.escapeHtml(s.title)}</span>
                <button type="button" class="remove-initial-subtask-btn icon-btn danger" 
                        data-id="${s.id}" style="width: 1.75rem; height: 1.75rem; padding: 0; font-size: 0.9rem;">✕</button>
            </div>
        `).join('');

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-initial-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = parseInt(btn.dataset.id);
                this.removeInitialSubtask(id);
            });
        });
    }

    // Render detail view
    renderDetailView(id) {
        const todo = this.getTodo(id);
        if (!todo) {
            this.showNotification('Todo not found!', 'danger');
            return;
        }

        const subtaskStats = this.getSubtaskStats(id);
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
                            ${subtaskStats.total > 0 ? `
                                <span class="badge" style="background-color: var(--primary); color: white; margin-left: 0.5rem;">
                                    📋 ${subtaskStats.completed}/${subtaskStats.total} subtasks
                                </span>
                            ` : ''}
                        </div>
                    </div>

                    ${todo.description ? `
                        <div style="margin-bottom: 1.5rem;">
                            <h3 style="font-size: 0.95rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Description</h3>
                            <p style="font-size: 1rem; color: var(--text-primary); line-height: 1.6;">${this.escapeHtml(todo.description)}</p>
                        </div>
                    ` : ''}

                    ${subtaskStats.total > 0 ? `
                        <div style="margin-bottom: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h3 style="font-size: 0.95rem; font-weight: 600; color: var(--text-secondary); margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Subtasks (${subtaskStats.completed}/${subtaskStats.total})
                                </h3>
                                <div style="width: 150px; height: 8px; background-color: var(--border-color); border-radius: 4px; overflow: hidden;">
                                    <div style="height: 100%; background-color: var(--success); width: ${(subtaskStats.completed / subtaskStats.total) * 100}%;"></div>
                                </div>
                            </div>
                            <div style="background-color: var(--bg-light); border-radius: 0.5rem; padding: 1rem;">
                                ${todo.subtasks.map((subtask, arrayIndex) => {
                                        const subtaskId = Number(subtask.id);
                                        return `
                                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; ${arrayIndex < todo.subtasks.length - 1 ? 'border-bottom: 1px solid var(--border-color);' : ''}">
                                        <input type="checkbox" class="form-check-input subtask-toggle" 
                                               data-todo-id="${id}" data-subtask-id="${subtaskId}" 
                                               ${subtask.isDone ? 'checked' : ''} style="width: 1.25rem; height: 1.25rem; cursor: pointer;">
                                        <div style="flex: 1; ${subtask.isDone ? 'text-decoration: line-through; color: var(--text-secondary);' : ''}">
                                            ${this.escapeHtml(subtask.title)}
                                        </div>
                                        <div style="display: flex; gap: 0.5rem;">
                                            ${arrayIndex > 0 ? `
                                                <button class="icon-btn subtask-up-btn" data-todo-id="${id}" data-subtask-id="${subtaskId}" title="Move up" style="padding: 0.25rem; font-size: 0.875rem;">⬆️</button>
                                            ` : ''}
                                            ${arrayIndex < todo.subtasks.length - 1 ? `
                                                <button class="icon-btn subtask-down-btn" data-todo-id="${id}" data-subtask-id="${subtaskId}" title="Move down" style="padding: 0.25rem; font-size: 0.875rem;">⬇️</button>
                                            ` : ''}
                                            <button class="icon-btn danger subtask-delete-btn" data-todo-id="${id}" data-subtask-id="${subtaskId}" title="Delete" style="padding: 0.25rem; font-size: 0.875rem;">🗑️</button>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
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

                    <div style="margin-bottom: 1.5rem;">
                        <button id="addSubtaskBtn" class="btn btn-secondary" style="width: 100%; padding: 0.75rem; font-size: 1rem; margin-bottom: 1rem;">+ Add Subtask</button>
                        
                        <form id="subtaskForm" data-todo-id="${id}" style="display: none; margin-bottom: 1rem;">
                            <div style="display: flex; gap: 0.75rem;">
                                <input type="text" id="subtaskInput" class="form-control" placeholder="Enter subtask..." 
                                       style="flex: 1; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid var(--border-color);
                                              background-color: var(--bg-white); color: var(--text-primary);">
                                <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.5rem;">Add</button>
                            </div>
                        </form>
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
