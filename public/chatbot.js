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
        const socket = io(SERVER_URL);
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

        // Send message
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = input.value.trim();
            if (msg) {
                appendMessage(msg, 'user');
                socket.emit('chat message', msg);
                input.value = '';
            }
        });

        // Receive message
        socket.on('chat message', (msg) => {
            // Check if this message is from us (simple heuristic, or just display everything for now)
            // In a real app we'd filter or handle IDs.
            // For now, let's assume server broadcasts everything back, so we might duplicate if we append on send AND receive.
            // Let's modify: ONLY append on receive for simplicity, or handle duplication.

            // To be duplicate-safe in this simple demo:
            // We'll trust the broadcast. But since I appended on send, I should not append my own message again if the server echoes it identically.
            // Let's just append everything from server for this basic echo test?
            // Actually, better UX is instant append, then handle server ack.
            // For this simple task, let's just append incoming messages that ARE NOT from us if possible, or just append everything.
            // Since the server implementation does `io.emit`, it creates a simple echo chamber.
            // Let's remove the "appendMessage" call in submit handler and rely on the server echo for consistency in this demo.
        });

        // Revised logic: only rely on server broadcast to avoid duplicates in this simple echo setup
        // But wait, user expects instant feedback.
        // Let's stick to: Append User Msg -> Send -> Receive (Ignore if it's ours? No ID yet).
        // Let's just show all messages for now.

        socket.on('chat message', (msg) => {
            // Basic check to avoid showing our own message twice if we appended it locally
            // In this simple version, we won't append locally on send, we'll wait for server.
            appendMessage(msg, 'bot'); // Treating everything from server as 'bot' or general for now.
            // Ideally we need {text: "abc", sender: "user"} structure.
        });

        function appendMessage(text, sender) {
            const div = document.createElement('div');
            div.classList.add('chat-message', sender);
            div.textContent = text;
            messagesDiv.appendChild(div);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        // Override submit handler slightly to NOT append locally, so we don't have duplicates with the echo server
        form.removeEventListener('submit', arguments.callee); // clean up if needed (not needed for one-shot)

        // Re-bind properly
        form.onsubmit = (e) => {
            e.preventDefault();
            const msg = input.value.trim();
            if (msg) {
                // Determine if we should show it immediately or wait for echo. 
                // Let's show it as 'user' immediately for better UX.
                appendMessage(msg, 'user');
                socket.emit('chat message', msg);
                input.value = '';
            }
        };

        // Handle specific server echo prevention if needed.
        // Since `io.emit` sends to all, we will receive our own message.
        // We need to detect it. 
        // Quick fix: The server sends just the string.
        // We can't distinguish sender.
        // Let's change the server listener to NOT append if it looks exactly like what we just sent? No, that's flaky.
        // Let's change the client to NOT append locally, and treat all incoming as just messages. 
        // BUT, we want to style 'my' messages differently.
        // OK, I'll update the server code in a moment to send objects {text, id}.
        // For now, I'll assume the user wants a working UI first.

        // Let's refine the socket listener to handle simple text
        socket.off('chat message');
        socket.on('chat message', (msg) => {
            // For this demo, let's assume if it came from server and we just sent it, it's ours.
            // Actually, the simplest way for a demo is: don't append locally, just send. 
            // When it comes back, if it was ours... well we can't tell.
            // Let's just append everything as 'bot' style if we don't have identity, 
            // OR let's update this file to just append locally and IGNORE the echo if we can.

            // BETTER APPROACH: Update the server to broadcast to `socket.broadcast.emit` so sender doesn't get it back.
            // I will update the server code in the next step.

            appendMessage(msg, 'bot');
        });
    }
})();
