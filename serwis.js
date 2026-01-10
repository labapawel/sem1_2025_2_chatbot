const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const options = {
    key: fs.readFileSync('ss.key'),
    cert: fs.readFileSync('ss.crt')
};

const server = https.createServer(options, app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('chat message', (msg) => {
        console.log('Message received:', msg);
        // Send to everyone ELSE
        socket.broadcast.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});
