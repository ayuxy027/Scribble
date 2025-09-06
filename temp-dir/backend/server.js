const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const redis = require('redis');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 4000;

const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis Error', err));
(async () => {
  await redisClient.connect();
  console.log('✅ Redis connected');
})();

const pendingDisconnects = new Map();

// Store user progress
async function saveUserProgress(socketId, roomId, progress) {
    await redisClient.hSet(`progress:${socketId}`, [
        ['roomId', roomId],
        ['data', JSON.stringify(progress)],
        ['lastUpdate', Date.now()]
    ]);
}

async function getUserProgress(socketId) {
    const progressData = await redisClient.hGetAll(`progress:${socketId}`);
    if (!progressData.data) return null;
    return {
        roomId: progressData.roomId,
        data: JSON.parse(progressData.data),
        lastUpdate: parseInt(progressData.lastUpdate)
    };
}

async function emitRoomUpdate(roomId) {
    const roomData = await redisClient.hGetAll(`room:${roomId}`);
    if (!roomData?.users) return;
    const users = JSON.parse(roomData.users);
    const userArray = Object.entries(users).map(([id, data]) => ({ 
        id, 
        username: data.username,
        progress: data.progress || {}
    }));
    io.in(roomId).emit('room-update', {
        roomId, users: userArray, hostId: roomData.host, locked: roomData.locked === '1',
    });
}

async function removeUserFromRoom(socketId, roomId) {
    const roomKey = `room:${roomId}`;
    const roomData = await redisClient.hGetAll(roomKey);
    if (!roomData?.users) return;

    const users = new Map(Object.entries(JSON.parse(roomData.users)));
    const userData = users.get(socketId);

    if (roomData.host === socketId) {
        console.log(`Host ${userData?.username} left. Closing room ${roomId}`);
        io.in(roomId).emit('room-closed');
        await redisClient.del(roomKey);
        // Clean up progress for all users in this room
        users.forEach((_data, sid) => {
            redisClient.del(`socket:${sid}`);
            redisClient.del(`progress:${sid}`);
        });
        return;
    }

    users.delete(socketId);
    await redisClient.del(`socket:${socketId}`);
    await redisClient.del(`progress:${socketId}`);

    if (users.size === 0) {
        await redisClient.del(roomKey);
    } else {
        await redisClient.hSet(roomKey, 'users', JSON.stringify(Object.fromEntries(users)));
        emitRoomUpdate(roomId);
    }
}

// --- REVISED CANVAS LOGIC ---

// Get all drawing history for a room
async function getCanvasHistory(roomId) {
    const history = await redisClient.lRange(`canvas:${roomId}`, 0, -1);
    // Each item in the list is a JSON string of a path (DrawAction[])
    return history.map(path => JSON.parse(path));
}

// Clear canvas history for a room
async function clearCanvasHistory(roomId) {
    await redisClient.del(`canvas:${roomId}`);
}

io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id}`);

    // Send full canvas state on join/rejoin
    async function sendCanvasState(roomId) {
        const history = await getCanvasHistory(roomId);
        socket.emit('canvas-state', history);
    }

    socket.on('create-room', async (username) => {
        let roomId;
        do { roomId = Math.random().toString(36).substring(2, 8).toUpperCase(); } 
        while (await redisClient.exists(`room:${roomId}`));
        
        const userData = { username, progress: {} };
        const users = { [socket.id]: userData };
        await redisClient.hSet(`room:${roomId}`, [
            ['host', socket.id], 
            ['locked', '0'], 
            ['users', JSON.stringify(users)]
        ]);
        await redisClient.set(`socket:${socket.id}`, roomId);
        await saveUserProgress(socket.id, roomId, {});
        socket.join(roomId);
        emitRoomUpdate(roomId);
        // Send empty canvas state
        socket.emit('canvas-state', []);
    });

    socket.on('join-room', async (roomId, username) => {
        const roomKey = `room:${roomId}`;
        const roomData = await redisClient.hGetAll(roomKey);
        if (!roomData.host) return socket.emit('error', 'Room not found');
        if (roomData.locked === '1') return socket.emit('error', 'Room is locked');
        
        const users = JSON.parse(roomData.users);
        const userData = { username, progress: {} };
        users[socket.id] = userData;
        
        await redisClient.hSet(roomKey, 'users', JSON.stringify(users));
        await redisClient.set(`socket:${socket.id}`, roomId);
        await saveUserProgress(socket.id, roomId, {});
        socket.join(roomId);
        emitRoomUpdate(roomId);
        // Send current canvas state
        sendCanvasState(roomId);
    });
    
    // New rejoin with previous room code and progress
    socket.on('rejoin-room', async (prevRoomId, username, oldSocketId) => {
        const roomKey = `room:${prevRoomId}`;
        const roomData = await redisClient.hGetAll(roomKey);
        
        if (!roomData.host) {
            return socket.emit('error', 'Previous room no longer exists');
        }
        
        const users = JSON.parse(roomData.users);
        let progress = {};
        let wasHost = false;
        
        // Check if user was previously in this room (by username or old socket ID)
        let oldUserSocketId = null;
        for (const [socketId, userData] of Object.entries(users)) {
            if (userData.username === username || socketId === oldSocketId) {
                oldUserSocketId = socketId;
                progress = userData.progress || {};
                wasHost = roomData.host === socketId;
                break;
            }
        }
        
        // Remove old entry if found
        if (oldUserSocketId) {
            delete users[oldUserSocketId];
            await redisClient.del(`socket:${oldUserSocketId}`);
            // Cancel any pending disconnect for the old socket
            if (pendingDisconnects.has(oldUserSocketId)) {
                clearTimeout(pendingDisconnects.get(oldUserSocketId));
                pendingDisconnects.delete(oldUserSocketId);
            }
        }
        
        // Add user with new socket ID
        const userData = { username, progress };
        users[socket.id] = userData;
        
        // Update host if this user was the previous host
        let newHost = roomData.host;
        if (wasHost) {
            newHost = socket.id;
        }
        
        await redisClient.hSet(roomKey, [
            ['users', JSON.stringify(users)],
            ['host', newHost]
        ]);
        await redisClient.set(`socket:${socket.id}`, prevRoomId);
        await saveUserProgress(socket.id, prevRoomId, progress);
        socket.join(prevRoomId);
        
        socket.emit('rejoin-success', { roomId: prevRoomId, progress });
        emitRoomUpdate(prevRoomId);
        // Send current canvas state
        sendCanvasState(prevRoomId);
        console.log(`${username} rejoined room ${prevRoomId} (${oldUserSocketId} -> ${socket.id})`);
    });

    // Update user progress during game/task
    socket.on('update-progress', async (progressData) => {
        const roomId = await redisClient.get(`socket:${socket.id}`);
        if (!roomId) return;
        
        // Update in room data
        const roomKey = `room:${roomId}`;
        const roomData = await redisClient.hGetAll(roomKey);
        if (roomData?.users) {
            const users = JSON.parse(roomData.users);
            if (users[socket.id]) {
                users[socket.id].progress = progressData;
                await redisClient.hSet(roomKey, 'users', JSON.stringify(users));
            }
        }
        
        // Save to progress store
        await saveUserProgress(socket.id, roomId, progressData);
        
        // Notify room of progress update
        io.in(roomId).emit('progress-update', {
            userId: socket.id,
            progress: progressData
        });
    });

    socket.on('start-task', async (roomId) => {
        const roomKey = `room:${roomId}`;
        const hostId = await redisClient.hGet(roomKey, 'host');
        if (hostId === socket.id) {
            await redisClient.hSet(roomKey, 'locked', '1');
            emitRoomUpdate(roomId);
            io.in(roomId).emit('task-started');
        }
    });
    
    socket.on('leave-room', async () => {
        const roomId = await redisClient.get(`socket:${socket.id}`);
        if (roomId) {
            if (pendingDisconnects.has(socket.id)) {
                clearTimeout(pendingDisconnects.get(socket.id));
                pendingDisconnects.delete(socket.id);
            }
            await removeUserFromRoom(socket.id, roomId);
        }
    });

    socket.on('disconnect', async () => {
        console.log(`Disconnected: ${socket.id}`);
        const roomId = await redisClient.get(`socket:${socket.id}`);
        if (!roomId) return;

        // Don't remove immediately - keep progress and allow rejoin
        const timeout = setTimeout(() => {
            removeUserFromRoom(socket.id, roomId);
            pendingDisconnects.delete(socket.id);
        }, 30000); // 30 second grace period

        pendingDisconnects.set(socket.id, timeout);
    });

    // --- REVISED: Clear canvas handler now uses the new function name ---
    socket.on('clear-canvas', async (roomId) => {
        const roomKey = `room:${roomId}`;
        const hostId = await redisClient.hGet(roomKey, 'host');
        if (hostId === socket.id) {
            await clearCanvasHistory(roomId);
            io.in(roomId).emit('canvas-cleared');
        }
    });

    // --- NEW HANDLER FOR FULL CANVAS STATE UPDATES (INCLUDING UNDO/REDO) ---
    socket.on('canvas-state-update', async ({ roomId, history }) => {
        const roomKey = `room:${roomId}`;
        const hostId = await redisClient.hGet(roomKey, 'host');
        if (hostId === socket.id) {
            await clearCanvasHistory(roomId);
            if (Array.isArray(history) && history.length > 0) {
                // history is an array of paths (DrawAction[][])
                const stringifiedPaths = history.map(path => JSON.stringify(path));
                await redisClient.rPush(`canvas:${roomId}`, stringifiedPaths);
            }
            socket.to(roomId).emit('canvas-state', history);
        }
    });
});

server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));