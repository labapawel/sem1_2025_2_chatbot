(function () {
    // Check if the script is already loaded
    if (document.getElementById('chatbot-widget-container')) return;

    // Load Socket.io client script dynamically
    const socketScript = document.createElement('script');
    socketScript.src = 'https://localhost:3000/socket.io/socket.io.js';
    socketScript.onload = initChatbot;
    document.head.appendChild(socketScript);

    function initChatbot() {
        // --- Configuration ---
        const SERVER_URL = 'https://localhost:3000';

        // --- Session ID Handling ---
        function generateUUID() {
             return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                 var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                 return v.toString(16);
             });
        }

        function setCookie(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/; Secure; SameSite=Strict";
        }

        function getCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        }

        let sessionId = getCookie('chat_session_id');
        if (!sessionId) {
            sessionId = generateUUID();
            setCookie('chat_session_id', sessionId, 365);
        }

        // --- Styles ---
        const style = document.createElement('style');
        style.textContent = `
            #chatbot-widget-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            #chatbot-toggle-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: transform 0.3s, box-shadow 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            #chatbot-toggle-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
            #chatbot-window {
                display: none;
                flex-direction: column;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 5px 30px rgba(0,0,0,0.15);
                position: absolute;
                bottom: 80px;
                right: 0;
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            #chatbot-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            #chatbot-close {
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
            }
            #chatbot-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background-color: #f9f9f9;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .chat-message {
                max-width: 80%;
                padding: 10px 14px;
                border-radius: 14px;
                font-size: 14px;
                line-height: 1.4;
            }
            .chat-message.user {
                align-self: flex-end;
                background-color: #667eea;
                color: white;
                border-bottom-right-radius: 2px;
            }
            .chat-message.bot {
                align-self: flex-start;
                background-color: #e0e0e0;
                color: #333;
                border-bottom-left-radius: 2px;
            }
            #chatbot-input-area {
                padding: 15px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
                background: white;
            }
            #chatbot-input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 20px;
                outline: none;
                transition: border-color 0.2s;
            }
            #chatbot-input:focus {
                border-color: #667eea;
            }
            #chatbot-send {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }
            #chatbot-send:hover {
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);

        // --- HTML ---
        const container = document.createElement('div');
        container.id = 'chatbot-widget-container';
        container.innerHTML = `
            <div id="chatbot-window">
                <div id="chatbot-header">
                    <span>Asystent AI</span>
                    <button id="chatbot-close">✕</button>
                </div>
                <div id="chatbot-messages">
                    <div class="chat-message bot">Witaj! W czym mogę Ci pomóc?</div>
                </div>
                <form id="chatbot-input-area">
                    <input type="text" id="chatbot-input" placeholder="Wpisz wiadomość..." autocomplete="off" />
                    <button type="submit" id="chatbot-send">➤</button>
                </form>
            </div>
            <button id="chatbot-toggle-btn">💬</button>
        `;
        document.body.appendChild(container);

        // --- Logic ---
        // Connect with Session ID
        const socket = io(SERVER_URL, {
            query: {
                sessionId: sessionId
            }
        });

        const toggleBtn = document.getElementById('chatbot-toggle-btn');
        const chatWindow = document.getElementById('chatbot-window');
        const closeBtn = document.getElementById('chatbot-close');
        const form = document.getElementById('chatbot-input-area');
        const input = document.getElementById('chatbot-input');
        const messagesDiv = document.getElementById('chatbot-messages');

        // Toggle visibility
        toggleBtn.addEventListener('click', () => {
            chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
            if (chatWindow.style.display === 'flex') input.focus();
        });

        closeBtn.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });

        function appendMessage(text, sender) {
            const div = document.createElement('div');
            div.classList.add('chat-message', sender);
            div.textContent = text;
            messagesDiv.appendChild(div);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        // Send message
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = input.value.trim();
            if (msg) {
                 
                appendMessage(msg, 'user'); // Show instantly
                socket.emit('chat message', msg);
                input.value = '';
            }
        });

        // Receive message
        socket.on('chat message', (msg) => {
            appendMessage(msg, 'bot'); // Server now only sends AI response
        });
    }
})();
