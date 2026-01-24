# OPIS OGÓLNY
Serwis Node.js + Express + Socket.IO obsługujący backend dla widgetu chatbot'a.
Serwer działa na porcie 3000 z włączonym SSL (HTTPS).
Klient po połączeniu z serwerem, dostaje unikalny identyfikator sesji. który przypisuje do ciasteczka.
przy każdym połączeniu z serwerem, klient przekazuje identyfikator sesji.

do serwer dodaj w katalogu historia, plik o nazwie YYYYMMDD_HHMMSS_sessionID.json z historią rozmowy.
hostorie dokładaj do prompta wysyłanego do Gemini.
plik jest dodawany przy każdym połączeniu z serwerem, nie po wysłaniu wiadomości.

w pliku .env jest zmienna CHAT_WLASNY=true lub false
jeżeli jest true, to używa się własnego AI
jeżeli jest false, to używa się Gemini

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

# Własny AI
prompt do wysyłania pod adres http://10.40.50.152:8000/generate
prompt wysyłamy metodą POST 
{"base_model_name":"Llama-3.1-8B","adapter_name":"wsi","system_prompt":"","prompt":"co robimy na zajęciach"}
odpowiedź z serwera 
{
    "response": "odpowiedź serwera",
    "model_used": "Llama-3.1-8B/wsi"
}


# GEMINI API
klucz (GEM_KEY) i model (GEM_MODEL) dostępny w pliku .env
```
const { GoogleGenAI } = require("@google/genai");

// Konfiguracja API key z zmiennej środowiskowej GEM_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEM_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();
```