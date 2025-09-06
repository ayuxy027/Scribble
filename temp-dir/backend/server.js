const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 4000;

// In-memory state
const rooms = Object.create(null); // { [roomId]: { hostId, locked, users, canvasHistory } }
const socketToRoomMap = Object.create(null); // { [socketId]: roomId }
const pendingDisconnects = Object.create(null); // { [socketId]: timeout }

function emitRoomUpdate(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    const userArray = Object.entries(room.users).map(([id, data]) => ({
        id,
        username: data.username,
        progress: data.progress || {},
    }));
    io.in(roomId).emit('room-update', {
        roomId,
        users: userArray,
        hostId: room.hostId,
        locked: room.locked,
    });
}

function removeUserFromRoom(socketId) {
    const roomId = socketToRoomMap[socketId];
    if (!roomId) return;
    const room = rooms[roomId];
    if (!room) return;

    if (room.hostId === socketId) {
        io.in(roomId).emit('room-closed');
        Object.keys(room.users).forEach(id => delete socketToRoomMap[id]);
        delete rooms[roomId];
        return;
    }

    delete room.users[socketId];
    delete socketToRoomMap[socketId];

    if (Object.keys(room.users).length === 0) {
        delete rooms[roomId];
    } else {
        emitRoomUpdate(roomId);
    }
}

io.on('connection', (socket) => {
    function sendCanvasState(roomId) {
        const room = rooms[roomId];
        if (room) socket.emit('canvas-state', room.canvasHistory);
    }

    socket.on('create-room', (username) => {
        let roomId;
        do {
            roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        } while (rooms[roomId]);
        rooms[roomId] = {
            hostId: socket.id,
            locked: false,
            users: { [socket.id]: { username, progress: {} } },
            canvasHistory: [],
        };
        socketToRoomMap[socket.id] = roomId;
        socket.join(roomId);
        emitRoomUpdate(roomId);
        socket.emit('canvas-state', []);
    });

    socket.on('join-room', (roomId, username) => {
        const room = rooms[roomId];
        if (!room) return socket.emit('error', 'Room not found');
        if (room.locked) return socket.emit('error', 'Room is locked');
        room.users[socket.id] = { username, progress: {} };
        socketToRoomMap[socket.id] = roomId;
        socket.join(roomId);
        emitRoomUpdate(roomId);
        sendCanvasState(roomId);
    });

    socket.on('rejoin-room', (prevRoomId, username, oldSocketId) => {
        const room = rooms[prevRoomId];
        if (!room) return socket.emit('error', 'Previous room no longer exists');
        let progress = {};
        let wasHost = false;
        if (oldSocketId && room.users[oldSocketId]) {
            progress = room.users[oldSocketId].progress || {};
            wasHost = room.hostId === oldSocketId;
            delete room.users[oldSocketId];
            delete socketToRoomMap[oldSocketId];
        }
        room.users[socket.id] = { username, progress };
        socketToRoomMap[socket.id] = prevRoomId;
        if (wasHost) room.hostId = socket.id;
        if (pendingDisconnects[oldSocketId]) {
            clearTimeout(pendingDisconnects[oldSocketId]);
            delete pendingDisconnects[oldSocketId];
        }
        socket.join(prevRoomId);
        socket.emit('rejoin-success', { roomId: prevRoomId, progress });
        emitRoomUpdate(prevRoomId);
        sendCanvasState(prevRoomId);
    });

    socket.on('update-progress', (progressData) => {
        const roomId = socketToRoomMap[socket.id];
        if (!roomId) return;
        const room = rooms[roomId];
        if (room && room.users[socket.id]) {
            room.users[socket.id].progress = progressData;
            io.in(roomId).emit('progress-update', {
                userId: socket.id,
                progress: progressData
            });
        }
    });

    socket.on('start-task', (roomId) => {
        const room = rooms[roomId];
        if (room && room.hostId === socket.id) {
            room.locked = true;
            emitRoomUpdate(roomId);
            io.in(roomId).emit('task-started');
        }
    });

    socket.on('leave-room', () => {
        if (pendingDisconnects[socket.id]) {
            clearTimeout(pendingDisconnects[socket.id]);
            delete pendingDisconnects[socket.id];
        }
        removeUserFromRoom(socket.id);
    });

    socket.on('disconnect', () => {
        const roomId = socketToRoomMap[socket.id];
        if (!roomId) return;
        pendingDisconnects[socket.id] = setTimeout(() => {
            removeUserFromRoom(socket.id);
            delete pendingDisconnects[socket.id];
        }, 30000);
    });

    socket.on('clear-canvas', (roomId) => {
        const room = rooms[roomId];
        if (room && room.hostId === socket.id) {
            room.canvasHistory = [];
            io.in(roomId).emit('canvas-cleared');
        }
    });

    socket.on('canvas-state-update', ({ roomId, history }) => {
        const room = rooms[roomId];
        if (room && room.hostId === socket.id) {
            room.canvasHistory = history;
            socket.to(roomId).emit('canvas-state', history);
        }
    });
});

server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));