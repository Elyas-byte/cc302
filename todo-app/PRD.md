# Flask TODO App - Product Requirements Document

## Executive Summary

A simple yet powerful web-based TODO application built with Flask that allows users to create, read, update, and delete tasks. The app provides both a user-friendly web interface and RESTful API endpoints for programmatic access.

## Product Overview

### Vision
Enable users to manage their daily tasks efficiently through an intuitive, responsive web application with complete CRUD functionality.

### Key Features
- Create, Read, Update, Delete (CRUD) tasks
- Mark tasks as completed/incomplete
- Set due dates for tasks
- Add descriptions to tasks
- View task statistics (total, completed, pending)
- REST API endpoints for integration with other applications
- Responsive design for desktop and mobile devices

---

## Product Scope

### Features Included
1. **Task Management**
   - Create new tasks with title, description, and due date
   - View all tasks in a dashboard
   - View individual task details
   - Edit existing tasks
   - Delete tasks

2. **Task Tracking**
   - Mark tasks as completed/incomplete
   - View completion status
   - Track task creation and modification dates

3. **User Interface**
   - Dashboard with task statistics
   - Clean, intuitive web interface
   - Responsive Bootstrap-based design
   - Flash messages for user feedback
   - Navigation and task listing views

4. **API Endpoints**
   - REST API for programmatic task management
   - JSON request/response format
   - Full CRUD operations via API

### Features Excluded
- User authentication and multi-user support
- Task categories or tags
- Task priority levels
- Recurring tasks
- Task attachments
- Email notifications
- Task collaboration features

---

## User Stories

### Story 1: Create a Task
**As a** user  
**I want to** create a new task with a title, description, and due date  
**So that** I can track what needs to be done

**Acceptance Criteria:**
- User can access the "Add Todo" page via button or navigation
- Form requires a title (mandatory)
- Description and due date are optional
- Form validates input and shows error messages
- Created task appears in the task list immediately
- User receives confirmation message

### Story 2: View All Tasks
**As a** user  
**I want to** see all my tasks in a dashboard  
**So that** I can get an overview of my workload

**Acceptance Criteria:**
- Dashboard displays all tasks in a table format
- Tasks show title, due date, creation date, and status
- Task statistics show total, completed, and pending counts
- Empty state message when no tasks exist
- Dashboard is accessible from home page

### Story 3: Complete a Task
**As a** user  
**I want to** mark a task as complete  
**So that** I can track my progress

**Acceptance Criteria:**
- Checkbox next to each task toggles completion status
- Completed tasks show visual indication (strikethrough)
- Completion status updates immediately
- User receives confirmation message

### Story 4: Edit a Task
**As a** user  
**I want to** edit an existing task  
**So that** I can update information

**Acceptance Criteria:**
- Edit button available on task view and dashboard
- Edit form pre-populated with current task data
- All fields (title, description, due date) are editable
- Changes save successfully
- Updated timestamp is modified
- User receives confirmation message

### Story 5: Delete a Task
**As a** user  
**I want to** delete a task  
**So that** I can remove tasks I no longer need

**Acceptance Criteria:**
- Delete button available on task view and dashboard
- Confirmation dialog appears before deletion
- Task is permanently removed
- User receives confirmation message
- Dashboard updates immediately

### Story 6: View Task Details
**As a** user  
**I want to** view detailed information about a specific task  
**So that** I can access all task information in one place

**Acceptance Criteria:**
- Task detail page shows all task information
- Shows title, description, due date, created date, updated date
- Shows completion status
- Quick actions to edit, delete, or toggle completion
- Navigation back to dashboard available

---

## Technical Requirements

### Technology Stack
- **Backend:** Flask (Python web framework)
- **Database:** SQLite (default) or PostgreSQL/MySQL
- **ORM:** SQLAlchemy
- **Frontend:** HTML5, CSS3, Bootstrap 5
- **API Format:** JSON (REST API)

### System Architecture

```
todo-app/
├── app/
│   ├── __init__.py          # Application factory
│   ├── models.py            # Database models
│   ├── routes.py            # Route handlers and API endpoints
│   └── templates/           # HTML templates
│       ├── base.html        # Base template
│       ├── index.html       # Dashboard
│       ├── add.html         # Create todo form
│       ├── edit.html        # Edit todo form
│       └── view.html        # Todo detail view
├── config.py                # Configuration management
├── run.py                   # Application entry point
└── requirements.txt         # Python dependencies
```

### Database Schema

#### todos table
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULL |
| completed | BOOLEAN | DEFAULT FALSE |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| due_date | DATETIME | NULL |

---

## API Specification

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Get All Todos
```
GET /api/todos
Response: 200 OK
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00",
    "due_date": "2024-01-16"
  }
]
```

#### 2. Get Single Todo
```
GET /api/todos/<id>
Response: 200 OK
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 10:30:00",
  "due_date": "2024-01-16"
}
```

#### 3. Create Todo
```
POST /api/todos
Content-Type: application/json

Request Body:
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "due_date": "2024-01-16"
}

Response: 201 Created
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 10:30:00",
  "due_date": "2024-01-16"
}
```

#### 4. Update Todo
```
PUT /api/todos/<id>
Content-Type: application/json

Request Body:
{
  "title": "Buy groceries",
  "description": "Updated description",
  "completed": true,
  "due_date": "2024-01-17"
}

Response: 200 OK
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Updated description",
  "completed": true,
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 11:45:00",
  "due_date": "2024-01-17"
}
```

#### 5. Delete Todo
```
DELETE /api/todos/<id>
Response: 204 No Content
```

---

## UI/UX Specifications

### Design Principles
- Clean and intuitive interface
- Minimal but effective visual hierarchy
- Consistent color scheme and typography
- Responsive design for all devices
- Clear call-to-action buttons

### Color Palette
- Primary: #667eea (Purple-blue)
- Secondary: #764ba2 (Deep purple)
- Success: #28a745 (Green)
- Danger: #dc3545 (Red)
- Background: Gradient (purple)
- Text: Dark gray/black

### Navigation Structure
- Header navigation with logo and menu
- Dashboard as landing page
- Quick access to "Add Todo" button
- Breadcrumbs for sub-pages
- Footer with links (optional)

### Key Screens

**1. Dashboard (Home)**
- Statistics cards (Total, Completed, Pending)
- Task list table with inline actions
- Add Todo button
- Empty state when no tasks

**2. Add Todo Page**
- Title field (required)
- Description field (textarea)
- Due date field (calendar picker)
- Submit and cancel buttons

**3. View Todo Page**
- Full todo details
- Completion status badge
- Edit, delete, and toggle buttons
- Navigation back to dashboard

**4. Edit Todo Page**
- Pre-filled form with current data
- All fields editable
- Save and cancel buttons

---

## Non-Functional Requirements

### Performance
- Page load time < 2 seconds
- API response time < 500ms
- Support for 1000+ tasks without performance degradation

### Security
- CSRF protection on forms
- Secure session handling
- Input validation and sanitization
- SQL injection prevention via ORM

### Reliability
- Database transactions for consistency
- Error handling with user-friendly messages
- Data persistence with SQLite/database

### Scalability
- Modular application structure
- Easy to extend with authentication
- API-first design for integration

### Usability
- Intuitive forms with clear labels
- Confirmation dialogs for destructive actions
- Flash messages for user feedback
- Mobile-responsive design
- Keyboard accessible

### Accessibility
- Semantic HTML
- Proper form labels and input types
- Readable font sizes and colors
- Alt text for images (if any)

---

## Installation & Setup

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Installation Steps

```bash
# Clone or navigate to the project directory
cd todo-app

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python run.py
```

### Access the Application
- Web UI: http://localhost:5000
- API: http://localhost:5000/api

---

## Development Roadmap

### Phase 1 (Current - MVP)
- [x] Basic CRUD operations
- [x] Web interface
- [x] REST API
- [x] Task completion tracking
- [x] Due dates

### Phase 2 (Future)
- [ ] User authentication
- [ ] Multi-user support
- [ ] Task categories/tags
- [ ] Priority levels
- [ ] Task search and filtering
- [ ] Advanced statistics

### Phase 3 (Future)
- [ ] Task comments/notes
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Mobile app
- [ ] Email notifications
- [ ] Calendar integration

---

## Success Metrics

- All CRUD operations functional and tested
- Web UI fully responsive
- API endpoints working correctly
- Zero 500-level errors
- Sub-500ms API response times
- User can complete basic task workflow in < 3 minutes

---

## Constraints and Assumptions

### Constraints
- Single-user application (no authentication)
- SQLite database (suitable for single user)
- Lightweight - suitable for local or small-scale deployment
- No external API integrations

### Assumptions
- Users have basic computer literacy
- Application deployed locally or on single server
- Moderate data volume (< 10,000 tasks)
- Standard browser support (Chrome, Firefox, Safari, Edge)

---

## Known Limitations

1. No concurrent multi-user editing
2. No real-time synchronization
3. No task dependencies or subtasks
4. No task reminders or notifications
5. No dark mode (can be added in future)
6. No task filtering or advanced search

---

## Glossary

- **CRUD**: Create, Read, Update, Delete operations
- **API**: Application Programming Interface
- **REST**: Representational State Transfer
- **ORM**: Object-Relational Mapping
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Flask**: Lightweight Python web framework
- **Bootstrap**: Front-end framework for responsive design

---

## Approval & Sign-off

**Document Status:** Draft
**Last Updated:** 2024
**Version:** 1.0

---

## Appendix: Example Usage

### Web Interface Workflow
1. User navigates to http://localhost:5000
2. Clicks "Add New Todo"
3. Fills in title: "Complete project proposal"
4. Adds description: "Finish the marketing plan section"
5. Sets due date: 2024-01-20
6. Clicks "Create Todo"
7. Todo appears in dashboard list
8. User can click on todo to view details
9. Can mark as complete by clicking checkbox
10. Can edit or delete as needed

### API Workflow Example
```bash
# Create a new todo
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy coffee","description":"Arabica beans","due_date":"2024-01-16"}'

# Get all todos
curl http://localhost:5000/api/todos

# Get specific todo
curl http://localhost:5000/api/todos/1

# Update todo
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete todo
curl -X DELETE http://localhost:5000/api/todos/1
```
