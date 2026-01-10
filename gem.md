# OPIS OGÓLNY
Serwis Node.js + Express + Socket.IO obsługujący backend dla widgetu chatbot'a.
Serwer działa na porcie 3000 z włączonym SSL (HTTPS).

# ARCHITEKTURA SYSTEMU

## Backend (serwis.js)
- Framework: Express.js.
- Protokół: HTTPS (klucze `ss.key`, `ss.crt`).
- WebSocket: Socket.IO (z obsługą CORS `*`).
- Funkcjonalność: Serwowanie plików statycznych z `public/` oraz broadcasting wiadomości czatu (`chat message`).

## Frontend (public/chatbot.js)
- Samodzielny skrypt widgetu czatu.
- Dynamicznie ładuje klienta Socket.IO.
- Wstrzykuje style CSS i strukturę HTML widgetu do strony.
- Implementuje logikę wysyłania/odbierania wiadomości i UI (toggle button, okno czatu).

# OPIS TECHNICZNY
- Język: JavaScript (Node.js).
- Biblioteki backend: `express`, `https`, `fs`, `socket.io`, `cors`, `path`.
- Biblioteki frontend: `socket.io-client` (ładowany dynamicznie).

# KONFIGURACJA
- Port: 3000
- Adres serwera: `https://*:3000`


# GEMINI API
klucz i model dostępny w pliku .env
```
import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();
```