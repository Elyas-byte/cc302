# Flask TODO App - localStorage Version

A simple, powerful, and intuitive web-based TODO application built with Flask and localStorage. Create, manage, and track your tasks with ease. All data is stored locally in your browser.

## Features

✅ **Complete CRUD Operations**
- Create new tasks with title, description, and due dates
- Read and view all your tasks in an organized dashboard
- Update existing tasks with new information
- Delete tasks you no longer need

📊 **Task Dashboard**
- View all tasks at a glance
- See statistics: total, completed, and pending counts
- Mark tasks as complete with a single click
- Track creation and modification dates

💾 **localStorage Persistence**
- All data stored locally in your browser
- No server-side database required
- Data persists across browser sessions
- Works offline

📱 **Responsive Design**
- Works beautifully on desktop, tablet, and mobile devices
- Bootstrap-based responsive layout
- Clean, modern user interface
- Smooth animations and transitions

## Quick Start

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Installation

1. **Clone/navigate to the project directory:**
```bash
cd todo-app
```

2. **Create a virtual environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run the application:**
```bash
python run.py
```

5. **Open your browser:**
Navigate to `http://localhost:5000`

## Running with Docker

### Prerequisites
- Docker installed on your system
- Docker Compose (optional, for easier volume management)

### Using Docker Compose (Recommended)

1. **Navigate to the project directory:**
```bash
cd todo-app
```

2. **Build and run the application:**
```bash
docker-compose up --build
```

3. **Open your browser:**
Navigate to `http://localhost:5000`

4. **Stop the application:**
```bash
docker-compose down
```

### Using Docker Only

1. **Navigate to the project directory:**
```bash
cd todo-app
```

2. **Build the Docker image:**
```bash
docker build -t todo-app .
```

3. **Run the container:**
```bash
docker run -p 5000:5000 todo-app
```

4. **Open your browser:**
Navigate to `http://localhost:5000`

## Project Structure

```
todo-app/
├── app/
│   ├── __init__.py           # Application factory
│   ├── routes.py             # Route handler (serves index)
│   ├── static/
│   │   ├── js/
│   │   │   └── app.js        # localStorage TODO app logic
│   │   └── css/
│   │       └── style.css     # Application styling
│   └── templates/
│       └── index.html        # Main application page
├── config.py                 # Configuration settings
├── run.py                    # Application entry point
├── requirements.txt          # Python dependencies
├── Dockerfile                # Docker image definition
├── docker-compose.yml        # Docker Compose configuration
├── PRD.md                    # Product Requirements Document
└── README.md                 # This file
```

## Usage

### View All Tasks
- Home page displays your task dashboard
- See statistics and all your tasks

### Add a New Task
- Click "Add New Todo" button
- Fill in the title (required), description, and due date (optional)
- Click "Create Todo"
- Task is saved to localStorage

### View Task Details
- Click on any task title to view full details
- See description, dates, and completion status

### Edit a Task
- Click "Edit" on the task detail page or dashboard
- Update title, description, or due date
- Click "Save Changes"
- Changes are saved to localStorage

### Complete a Task
- Check the checkbox next to a task
- Task will be marked as complete
- Status updates immediately

### Delete a Task
- Click "Delete" button
- Confirm deletion in the dialog
- Task is removed from localStorage

## Data Storage

All todo data is stored in browser's localStorage under the key `todos`. Data is in JSON format:

```javascript
{
    id: timestamp,
    title: "Task title",
    description: "Task description",
    completed: false,
    createdAt: "ISO date string",
    updatedAt: "ISO date string",
    dueDate: "YYYY-MM-DD or null"
}
```

### Browser Storage Limits
- Most browsers support 5-10MB of localStorage
- This app uses minimal storage (typically < 1MB for 1000+ tasks)
- Data persists until manually cleared or browser storage is cleared

### Managing Your Data

**Export data:**
```javascript
// In browser console
const data = localStorage.getItem('todos');
console.log(data);
```

**Clear all data:**
```javascript
// In browser console
localStorage.removeItem('todos');
```

## Technologies Used

- **Flask** - Lightweight Python web framework
- **localStorage** - Browser-based storage API
- **Bootstrap 5** - Responsive CSS framework
- **Vanilla JavaScript** - No frameworks required

## Configuration

Edit `config.py` to customize:
- Secret key
- Debug mode
- Session settings

For production, set environment variables:
```bash
export FLASK_ENV=production
export SECRET_KEY=your-secret-key
```

## Browser Compatibility

Works with all modern browsers that support localStorage:
- Chrome/Edge 4+
- Firefox 3.5+
- Safari 4+
- Opera 10.5+
- Internet Explorer 8+

## Features

| Feature | Status |
|---------|--------|
| Create Tasks | ✅ |
| Read Tasks | ✅ |
| Update Tasks | ✅ |
| Delete Tasks | ✅ |
| Complete/Incomplete Toggle | ✅ |
| Due Dates | ✅ |
| Task Descriptions | ✅ |
| Statistics Dashboard | ✅ |
| Responsive Design | ✅ |
| Offline Support | ✅ |
| localStorage Persistence | ✅ |

## Future Enhancements

- Export/Import JSON
- Task categories and tags
- Priority levels
- Task search and filtering
- Dark mode
- Task sorting options
- Backup to cloud

## Troubleshooting

**Data disappeared?**
- Check if localStorage was cleared
- Open browser DevTools → Application → localStorage
- Look for `todos` key

**Add button not working?**
- Make sure JavaScript is enabled
- Open browser console for errors (F12)
- Try refreshing the page

**Tasks not saving?**
- Check if localStorage is available
- Some private/incognito browsers may have limitations
- Check available storage space

## Development

To enable debug mode and auto-reload:
- Set `DEBUG = True` in `config.py`
- Or set environment variable: `export FLASK_DEBUG=1`

### Testing localStorage in Console

```javascript
// Get all todos
const todos = JSON.parse(localStorage.getItem('todos') || '[]');
console.log(todos);

// Add a test todo
todos.push({
    id: Date.now(),
    title: "Test task",
    description: "",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: null
});
localStorage.setItem('todos', JSON.stringify(todos));
```

## Performance

- **Page Load:** < 1 second
- **Task Operations:** Instant (no server delay)
- **Works Offline:** Yes
- **Storage:** Minimal (JavaScript object serialization)

## Security Notes

- Data stored in browser is accessible via JavaScript
- No server-side or authentication required
- Suitable for personal task management
- Not recommended for sensitive data
- Clear browser data to remove all todos

## License

MIT License - Free to use and modify

## Support

For issues or questions:
1. Check browser console for errors (F12)
2. Verify JavaScript is enabled
3. Check localStorage in DevTools
4. Clear cache and refresh page

---

**Happy task managing! 📝**

**Note:** All data is stored locally in your browser. It won't sync across devices. For multi-device sync, consider adding a backend database in the future.
