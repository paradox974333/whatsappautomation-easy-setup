# 🤖 AI WhatsApp Business Automation

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Turn your WhatsApp into a 24/7 AI sales & support agent for *any* business.** It reads incoming messages, replies naturally using the **Cerebras Inference API** (Llama-3.3-70B), remembers conversations, captures leads automatically when it detects buying intent, and even negotiates and books meetings.

**Built for anyone.** Out of the box it ships with an example agency persona, but you make it *your* bot by editing a single file — [`prompt/persona.md`](prompt/persona.md). No code changes needed. Use it for a shop, clinic, restaurant, freelancer, SaaS, support desk — anything.

⭐ **If this saves you time, please star the repo — it genuinely helps others find it.**

---

## 🧒 What is this? (in plain English)

Imagine you run any business and customers message you on WhatsApp all day asking the same things — *"What do you offer?"*, *"How much?"*, *"Can we talk?"*. Answering each one yourself takes hours.

This project is a **robot assistant that sits on your WhatsApp and answers for you, 24/7.** Here's what it does, step by step:

1. A customer sends a WhatsApp message to your number.
2. The bot reads it and writes a smart, human-sounding reply using AI — based on facts *you* gave it about your business.
3. If the customer sounds interested in buying, it quietly saves their details (name, what they want, contact) as a **lead** for you to follow up.
4. If they want to talk, it can **suggest a time and book a meeting** automatically.
5. You can see everything through a simple web dashboard.

**You don't need to be a programmer to use it.** You mainly do two things: paste a free API key, and fill in a simple text file describing your business. The guide below walks you through both. If a word looks technical, don't worry — the steps are copy-paste.

> **What you'll need:** a computer or a cheap online server, a WhatsApp number, and a free Cerebras account (for the AI). That's it.

---

## 📸 Demo

<!--
  Replace the line below with a real screenshot or GIF of the bot in action.
  A short GIF of a live WhatsApp conversation is the #1 thing that makes people
  try the project. Easy way to record one: ScreenToGif (Windows) or Kap (Mac).
  Drop the file in assets/ and update the path, e.g.:
  ![Demo](assets/demo.gif)
-->
> _Demo GIF coming soon — record a short clip of a real chat and drop it here as `assets/demo.gif`._

---

## 🎯 Make it your own (start here)

This is a **template**, not a finished product locked to one company. To rebrand the bot for your business:

1. Open [`prompt/persona.md`](prompt/persona.md).
2. Replace the `[PLACEHOLDERS]` with your business name, services, pricing approach, and tone.
3. Save and restart — that's it. The lead-capture and meeting-booking logic keeps working automatically.

Need inspiration? A complete filled-in example (a fictional café) lives in [`prompt/persona.example.md`](prompt/persona.example.md).

---

## ⚡ Quick start (60 seconds)

```bash
git clone https://github.com/paradox974333/whatsappautomation-easy-setup.git
cd whatsappautomation-easy-setup
cp .env.example .env          # add your free CEREBRAS_API_KEY (https://cloud.cerebras.ai)
docker compose up -d --build  # starts the app + MongoDB
```

Then open **http://localhost:3000/**, scan the QR code with WhatsApp (Settings → Linked Devices), and your bot is live. Full Docker and non-Docker instructions are below.

---

## 💡 How it works (read this first)

**You scan once with your main WhatsApp (or WhatsApp Business) number — that's it.**

1. Start the app and open the dashboard. A QR code appears.
2. On your phone, go to **WhatsApp → Settings → Linked Devices → Link a Device** and scan it. This links the bot as a "device" on your account — exactly like WhatsApp Web. **You do not need a second SIM or a separate number** — it uses the same number you already chat from.
3. From that moment, every message your customers send to that number is read by the AI, which replies automatically, saves the conversation, captures leads, and books meetings.
4. **The login is saved.** The session is stored in the `tokens/` folder, so even if the app restarts or the server reboots, it logs back in automatically — you never scan again (unless you manually log out or stay offline for a very long time).

> 💬 You can still use WhatsApp normally on your phone at the same time. The bot runs alongside you. If you reply to a chat yourself, the manual `send` API even pauses the AI for that message so you don't talk over each other.

### ⚠️ Keep your phone and the server online
Because this links like WhatsApp Web, your **phone should stay connected to the internet** and the **server/computer running the bot should stay on**. That's exactly why hosting it on an always-on VM (next section) is the recommended setup — so it answers customers 24/7 even when your laptop is off.

---

## ☁️ Host it 24/7 (run it on a VM / any cloud)

For the bot to reply around the clock, run it on a machine that's always on — any cheap cloud VM works. Because the whole thing is Dockerized, deploying is the same 3 commands everywhere.

**Works on:** AWS EC2, Google Cloud, Azure, DigitalOcean, Hetzner, Linode, Oracle Cloud (has an always-free tier), a Raspberry Pi, or any Linux VPS. A small **1–2 GB RAM** instance is enough (it runs a headless Chromium, so avoid the tiniest 512 MB boxes).

**Deploy on a fresh Ubuntu VM:**

```bash
# 1. Install Docker + Compose (one-time)
curl -fsSL https://get.docker.com | sh

# 2. Get the code
git clone https://github.com/paradox974333/whatsappautomation-easy-setup.git
cd whatsappautomation-easy-setup

# 3. Configure
cp .env.example .env
nano .env            # paste your CEREBRAS_API_KEY, set your OWNER_PHONE_NUMBER, etc.

# 4. Edit your bot's persona
nano prompt/persona.md

# 5. Launch (runs in the background and restarts on reboot)
docker compose up -d --build
```

**Scan the QR remotely:** the dashboard runs on port `3000`. Either open `http://YOUR_SERVER_IP:3000/` in your browser, or read the QR straight from the logs:

```bash
docker compose logs -f app   # the QR is printed as ASCII in the terminal
```

Scan it once with your phone and the bot stays linked. The `tokens/`, `uploads/`, and `logs/` folders are mounted as volumes, so your session and data survive restarts and redeploys.

> **Tip:** For production, put it behind a domain + HTTPS (e.g. Nginx or Caddy reverse proxy) and consider restricting the dashboard/API with a firewall or auth, since the REST API can read chats and send messages.

---

## Features

- **Persistent WhatsApp Session**: Scan the QR code once; session state is stored in a Docker-mounted volume.
- **Auto Reconnect**: Automatically monitors and recovers connection dropouts.
- **AI-Powered Customer Reps**: Answers questions naturally based on *your* business knowledge, services, and pricing — all defined in one editable file (`prompt/persona.md`).
- **Lead Capture Pipeline**: Automatically identifies "purchase intent" (e.g., website inquiries, pricing, social media management requests) and extracts the contact's name, email, business name, and project requirements.
- **Multi-Format Inbound Media Decryption**: Automatically decrypts and stores incoming images, videos, documents, PDFs, location coordinates, and contact cards.
- **Comprehensive REST API**: Fully features CRUD operations on leads, chats, session status, and manual message broadcasts.
- **Sleek QR Display Dashboard**: A built-in web portal showing real-time WhatsApp link states.

---

## Directory Structure

```
├── tokens/                 # Persistent storage for WhatsApp credentials (WPPConnect tokens)
├── uploads/                # Persistent storage for inbound & outbound media (images, PDFs)
│   ├── inbound/
│   └── outbound/
├── logs/                   # System error and activity log files
├── prompt/                 # Editable AI persona — rebrand the bot here (persona.md)
├── src/
│   ├── config/             # Environment variables and validator services
│   ├── database/           # MongoDB initializers and lifecycle hooks
│   ├── models/             # Mongoose schemas (Conversation, Message, Lead)
│   ├── ai/                 # AIProvider interface, Cerebras implementation, Prompt Manager
│   ├── wpp/                # WPPConnect client singleton and event handlers
│   ├── services/           # Conversation context and Lead business services
│   ├── controllers/        # REST controllers (Session, Chat, Lead)
│   ├── routes/             # API routing setup
│   ├── middleware/         # Winston logger and global error middleware
│   └── utils/              # Core loggers, test utilities, file helpers
├── Dockerfile              # Docker image definition (installs Chromium dependencies)
├── docker-compose.yml      # Orchestrates app and MongoDB containers
└── README.md               # Master project documentation
```

---

## 🧠 The AI Brain — Cerebras (free to start)

This bot runs on the **[Cerebras Inference API](https://cloud.cerebras.ai)**, which is both extremely fast and has a **generous free tier** — at the time of writing, Cerebras gives you roughly **1 million free tokens per day**, which is more than enough to run a real customer-facing bot at no cost. (Limits change over time — check [cloud.cerebras.ai](https://cloud.cerebras.ai) for the current allowance.)

**Get your free key:**
1. Sign up at **[cloud.cerebras.ai](https://cloud.cerebras.ai)**.
2. Create an API key.
3. Paste it into your `.env` as `CEREBRAS_API_KEY`.

**Use any model you like.** You're not locked to one model — set `CEREBRAS_MODEL` in your `.env` to any model your Cerebras account supports. Examples that are commonly available:

| Model (`CEREBRAS_MODEL`) | Good for |
| :--- | :--- |
| `llama-3.3-70b` *(default)* | Best all-round quality for natural sales chat |
| `llama3.1-8b` | Fastest / cheapest, lighter conversations |
| `qwen-3-32b` | Strong reasoning, good multilingual support |
| `llama-4-scout-17b-16e-instruct` | Newer Llama 4 option |

> Model names change as Cerebras adds and retires models. See the **[Cerebras models list](https://inference-docs.cerebras.ai/models/overview)** for what's live today, and just drop the exact name into `CEREBRAS_MODEL`. No code changes needed.

---

## Environment Variables

Copy the `.env.example` file to `.env` and fill in the details:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `CEREBRAS_API_KEY` | **Yes** | — | Your free API key from [cloud.cerebras.ai](https://cloud.cerebras.ai). |
| `CEREBRAS_MODEL` | No | `llama-3.3-70b` | Any model your Cerebras account supports (see table above). |
| `PERSONA_FILE` | No | `prompt/persona.md` | Path to the editable bot persona — point this anywhere to swap personalities. |
| `PORT` | No | `3000` | Port for the HTTP API + dashboard. |
| `MONGODB_URI` | No | local MongoDB | Connection string. Set automatically by docker-compose. |
| `WPP_SESSION_NAME` | No | `my-business-bot` | WPPConnect session identifier. |
| `OWNER_PHONE_NUMBER` | No | — | Your admin WhatsApp number that receives lead & booking alerts. |
| `MEETING_LINK` | No | — | Meeting link shared with customers when they book a call. |
| `FOLLOW_UP_DELAY_MINUTES` | No | `1440` | Minutes to wait before an automated follow-up message. |
| `CRM_WEBHOOK_URL` | No | — | Optional URL that captured leads are POSTed to (CRM/Zapier/etc.). |
| `LOG_LEVEL` | No | `info` | Logging detail: `debug`, `info`, `warn`, `error`. |

---

## Docker Quickstart (Production Setup)

Ensure you have **Docker** and **Docker Compose** installed.

### 1. Build and Start the Containers

Launch the multi-container configuration (MongoDB + Node application):

```bash
docker compose up -d --build
```

This commands spins up:
- A MongoDB instance mapping `mongodb_data` to `/data/db`.
- The Node application, running transpiled production code, mapping directories:
  - `./tokens` inside the project to retain login tokens across restarts.
  - `./uploads` to store downloaded/uploaded files.
  - `./logs` to store Winston logs.

### 2. Pairing Your WhatsApp Account

Once the container starts:
1. Open your web browser and navigate to: **`http://localhost:3000/`**
2. Click **Initialize Session** if the status shows *Disconnected*.
3. Once the status shows **Scan QR Code**, a QR code will render on the webpage. (Alternatively, you can read the ASCII representation from Docker logs: `docker compose logs -f app`).
4. Scan the QR code with your WhatsApp Business app (Settings > Linked Devices).
5. The dashboard will automatically refresh and display a green **Connected** status.

### 3. Service Lifecycle

```bash
# Check status of container services
docker compose ps

# View real-time logs
docker compose logs -f

# Restart services (will auto-login using saved session tokens)
docker compose restart

# Tear down the stack (retaining volume folders)
docker compose down
```

---

## Local Development (Without Docker)

### Prerequisites
- **Node.js** v20+
- **MongoDB** running locally on port `27017`

### Setup Steps
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Create your `.env` configuration file and insert your `CEREBRAS_API_KEY`.
3. Start the application in development mode:
   ```bash
   npm run dev
   ```
4. Run code compilation to test for compilation compliance:
   ```bash
   npm run build
   ```

---

## Verification & AI Testing

To verify the AI prompt engine and check your Cerebras credential connection without spinning up Puppeteer/WhatsApp, run the test script:

```bash
# Run the test client using ts-node
npx ts-node src/utils/test-ai.ts
```

It outputs the AI's reply and shows structured JSON lead extraction properties.

---

## REST API Reference

The server exposes the following REST APIs under the `/api` prefix:

### 1. Session Management

#### `GET /api/session/status`
Returns the current connection state of the WhatsApp client.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "status": "CONNECTED",
        "connected": true
      }
    }
    ```

#### `GET /api/session/qr`
Returns the base64-encoded QR code.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "base64": "data:image/png;base64,iVBORw0KGgo...",
        "url": "2@s1u7j..."
      }
    }
    ```

#### `POST /api/session/init`
Manually triggers WhatsApp client browser startup.

#### `POST /api/session/disconnect`
Disconnects the WhatsApp client and removes credentials.

---

### 2. Lead Management

#### `GET /api/leads`
Retrieves all captured leads, sorted by extraction date descending.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "60c72b2f9b1d8b2c2c8b4567",
          "name": "David",
          "business": "David's Fashion Hub",
          "phone": "919876543210",
          "email": "david@fashionhub.com",
          "requirements": "Wants a website and Instagram reels management",
          "status": "new",
          "sourceConversation": "919876543210@c.us",
          "extractedAt": "2026-06-27T08:00:00.000Z"
        }
      ]
    }
    ```

#### `PUT /api/leads/:id`
Updates the status of a lead.
*   **Body**:
    ```json
    {
      "status": "qualified" // "new" | "contacted" | "lost" | "qualified"
    }
    ```

---

### 3. Chat History & Manual Dispatch

#### `GET /api/chats`
Lists all conversations tracked by the platform.

#### `GET /api/chats/:phone`
Fetches the last 15 messages (including location & media details) of a customer conversation.

#### `POST /api/chats/:phone/send`
Manually broadcasts a message to a customer. This suspends AI auto-reply for this message transaction.

- **Send Text Message**:
  * **Payload**:
    ```json
    {
      "messageType": "text",
      "message": "Hello, let's schedule that meeting for tomorrow."
    }
    ```

- **Send Media File (Image, PDF, Document)**:
  * **Payload**:
    ```json
    {
      "messageType": "pdf",
      "filename": "proposal.pdf",
      "base64": "JVBERi0xLjQKJ..."
    }
    ```

- **Send Location**:
  * **Payload**:
    ```json
    {
      "messageType": "location",
      "latitude": "12.9716",
      "longitude": "77.5946",
      "locationTitle": "Our office"
    }
    ```

- **Send Contact Card (vCard)**:
  * **Payload**:
    ```json
    {
      "messageType": "vcard",
      "contactPhone": "919876543211",
      "contactName": "Jane Doe (Founder)"
    }
    ```

---

## Health Checks

#### `GET /health`
Returns the status of internal dependencies.
*   **Response (200 OK / 503 Service Unavailable)**:
    ```json
    {
      "success": true,
      "status": "UP",
      "timestamp": "2026-06-27T08:21:46.000Z",
      "services": {
        "database": {
          "status": "CONNECTED"
        },
        "whatsapp": {
          "status": "CONNECTED",
          "connected": true
        }
      }
    }
    ```

---

## 🛠️ Tech Stack

Node.js · TypeScript · Express · MongoDB (Mongoose) · [WPPConnect](https://github.com/wppconnect-team/wppconnect) · [Cerebras Inference API](https://cloud.cerebras.ai) (Llama-3.3-70B) · Winston · Docker.

Want to use a different AI provider? The AI layer is abstracted behind [`src/ai/ai.provider.ts`](src/ai/ai.provider.ts) — implement the interface and you're done. PRs welcome!

---

## 🤝 Contributing

Contributions are welcome and appreciated! See [CONTRIBUTING.md](CONTRIBUTING.md) to get started. Good first issues include docs, new AI providers, extra message types, and persona examples for new use cases.

---

## 🔐 Security & Responsible Use

- Never commit your `.env`, `tokens/`, `uploads/`, or `logs/` — these contain secrets and personal data. They are gitignored by default. See [SECURITY.md](SECURITY.md).
- This is an **unofficial** automation tool built on WPPConnect. Automating WhatsApp may violate WhatsApp's Terms of Service — use responsibly and at your own risk.

---

## 📄 License

Released under the [MIT License](LICENSE) — free to use, modify, and distribute, including commercially. If you build something cool with it, a star and a mention are always appreciated. ⭐
