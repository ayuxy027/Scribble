# Getting Started

## Starting Redis

To start a Redis server using Docker, run:
```bash
docker run --name my-redis -p 6379:6379 -d redis
```

## Setting Up Frontend and Backend

Navigate to both the `frontend` and `backend` directories and run:
```bash
npm install
```

- In the `backend` directory, start the server:
    ```bash
    node server.js
    ```
- In the `frontend` directory, start the development server:
    ```bash
    npm run dev
    ```

---

## Logical Workflow: How Socket.IO and Redis Work Together

This app uses **Socket.IO** for real-time communication between the frontend (React) and backend (Node.js/Express), and **Redis** for fast, persistent state management. Here’s how the workflow operates:

### 1. User Joins or Creates a Room
- The frontend connects to the backend using Socket.IO.
- When a user creates or joins a room, the frontend emits a `create-room` or `join-room` event with their username (and room code if joining).
- The backend receives this event, creates/updates the room in Redis, and stores user info (username, progress, etc.) in Redis hashes.
- The backend emits a `room-update` event to all users in the room, updating their UI with the latest room state.

### 2. Real-Time Drawing (Canvas)
- The host can draw on the canvas. Each drawing action updates the local state and emits a `canvas-state-update` event with the full drawing history.
- The backend receives this event, updates the drawing history in Redis (as a list of drawing actions), and broadcasts the new state to all other users via the `canvas-state` event.
- When a new user joins or rejoins, the backend sends the full canvas state from Redis so everyone sees the same drawing.

### 3. Progress and Game State
- As users make progress (e.g., in a game or task), the frontend emits `update-progress` events.
- The backend updates the user’s progress in Redis and emits `progress-update` events to all users in the room.

### 4. Room and User Management
- Redis stores all room and user data, including host info, user list, and progress.
- If the host leaves, the backend closes the room for everyone and cleans up Redis data.
- If a user disconnects, their data is kept in Redis for 30 seconds to allow for reconnection (rejoin). After that, they are removed from the room.

### 5. Canvas Controls (Undo/Redo/Clear)
- Undo/redo/clear actions by the host update the drawing history in Redis and broadcast the new state to all users.

---

