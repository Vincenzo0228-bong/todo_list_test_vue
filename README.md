# To-Do List with Real-Time Updates

A full-stack To-Do List application with real-time updates using Socket.IO. Features task creation, status management (active/completed), optimistic UI updates, and real-time synchronization across all connected clients.

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Frontend**: Vue 2 (Options API)
- **Real-time**: Socket.IO
- **HTTP Client**: Axios

## Features

### Core Features
- ✅ Create tasks with title validation
- ✅ View all tasks sorted by newest first
- ✅ Mark tasks as active or completed
- ✅ Real-time updates via Socket.IO
- ✅ Optimistic UI updates
- ✅ Clean, responsive UI
- ✅ Error handling with rollback
- ✅ Loading states
- ✅ Empty state messages

### Advanced Features
- **Task Status System**: Toggle between active/completed with visual feedback
- **Optimistic Updates**: Immediate UI updates before server confirmation
- **Real-time Sync**: Changes sync across all connected clients instantly
- **Database Optimization**: Indexed queries for better performance
- **Clean Architecture**: Separated controllers, routes, and middleware

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── config.js              # Environment configuration
│   ├── controllers/
│   │   └── taskController.js      # Business logic
│   ├── middleware/
│   │   └── errorHandler.js        # Centralized error handling
│   ├── models/
│   │   └── Task.js                # Mongoose Task model
│   ├── routes/
│   │   └── tasks.js               # API routes
│   ├── .env.example               # Environment variables template
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Express server with Socket.IO
├── frontend/
│   ├── index.html                 # HTML template
│   ├── main.js                    # Vue 2 application
│   └── styles.css                 # Custom CSS styles
└── README.md                      # This file
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally, OR MongoDB Atlas account
- npm or yarn

## Setup Instructions

### 1. Install MongoDB

- Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service:
  - Windows: MongoDB should start automatically as a service
  - Mac/Linux: `mongod` or `brew services start mongodb-community`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start

# Or use nodemon for development (auto-restart on changes)
npm run dev
```

The backend server will run on `http://localhost:3000`

### 3. Frontend Setup

The frontend uses CDN links, so no build step is required. However, you need to serve the files through a web server.

**Option A: Using Python (if installed)**
```bash
# Navigate to frontend directory
cd frontend

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

The frontend will be available at `http://localhost:8080` (or the port you chose)

### 4. Update API URL (if needed)

If your backend runs on a different port or host, update the `API_BASE_URL` in `frontend/main.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## Usage

1. Make sure MongoDB is running
2. Start the backend server (`cd backend && npm start`)
3. Start the frontend server (using one of the methods above)
4. Open your browser and navigate to the frontend URL (e.g., `http://localhost:8080`)
5. Add tasks, toggle their status, and see changes appear in real-time across all connected clients!


## Real-Time Events

### taskCreated
Emitted when a new task is created. All connected clients receive this event.

### Backend Architecture

The backend follows a clean, modular structure:

- **Controllers**: Handle business logic (`controllers/taskController.js`)
- **Routes**: Define API endpoints (`routes/tasks.js`)
- **Models**: Define database schemas (`models/Task.js`)
- **Middleware**: Centralized error handling (`middleware/errorHandler.js`)
- **Config**: Environment configuration (`config/config.js`)

### Key Features

1. Business logic separated from routing
2. Consistent error responses across the app
3. Frontend updates immediately, confirms with server
4. Indexed queries for better performance
5. Socket.IO events keep all clients in sync

### Frontend Features

- UI updates immediately before server confirmation
- Automatically reverts changes on API failure
- Prevents duplicate tasks from Socket.IO events
- Completed tasks show line-through and faded appearance
- Visual indicators during operations

### Frontend
- Vue 2 (via CDN)
- Axios (via CDN)
- Socket.IO Client (via CDN)

### Code Structure

- Controllers, routes, and models are separated
- Centralized error middleware handles all errors
- Consistent async patterns throughout
- Frontend provides instant feedback

## License

ISC
