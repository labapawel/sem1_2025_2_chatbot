const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Read Knowledge Base
const knowledgeBase = fs.readFileSync('bazawiedzy.md', 'utf8');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    socket.on('chat message', async (msg) => {
        console.log('Message received:', msg);

        // Broadcast user message to everyone (so they see it)
        io.emit('chat message', msg);

        try {
            const prompt = `Jesteś pomocnym asystentem AI firmy EBTECH. Twoim zadaniem jest odpowiadać na pytania klientów na podstawie poniższej Bazy Wiedzy. Nie wymyślaj faktów, korzystaj tylko z dostarczonych informacji. Bądź uprzejmy i profesjonalny.
            
            BAZA WIEDZY:
            ${knowledgeBase}
            
            PYTANIE UŻYTKOWNIKA:
            ${msg}`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            // Send AI response
            if (response && response.text) {
                io.emit('chat message', response.text);
            } else {
                console.error("Unexpected response format:", response);
                io.emit('chat message', "Przepraszam, nie udało się uzyskać odpowiedzi.");
            }
        } catch (error) {
            console.error("Gemini Error:", error);
            socket.emit('chat message', "Przepraszam, wystąpił błąd podczas generowania odpowiedzi.");
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

// komentarz
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});
