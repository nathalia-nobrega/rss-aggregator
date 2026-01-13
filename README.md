# RSS Feed Aggregator

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Native-003B57?style=flat-square&logo=sqlite)](https://nodejs.org/api/sqlite.html)
[![OpenAI](https://img.shields.io/badge/AI-Summaries-orange?style=flat-square&logo=openai)](https://openai.com/)

A high-performance, lightweight RSS aggregation service built with **zero external web frameworks**. It demonstrates a backend architecture using native Node.js capabilities, featuring automatic feed synchronization and AI-driven content analysis.

---

## Core Features

### Usage of AI for article summarization

Instead of skimming through endless feeds, get the gist instantly. The system integrates with **OpenAI (GPT-3.5-Turbo)** to generate 2-3 sentence summaries for articles.

### Framework-less Architecture

Built using native Node.js modules (`http`, `node:sqlite`, `crypto`), this project showcases:

-   **Custom Router**: A regex-based routing engine with parameter support (e.g., `/feeds/:id`).
-   **Middleware Pipeline**: Functional middleware for Authentication, Rate-Limiting, and Request Validation.

-   **JWT Authentication**: Secure user sessions with standard JWT implementation.
-   **Rate Limiting**: Built-in protection against brute-force and spam on sensitive endpoints.
-   **Password Hashing**: Secure storage using `bcrypt`.

---

## Architecture Deep Dive

### Storage Layer: Experimental Native SQLite

The project uses the experimental `node:sqlite` module (introduced in Node.js v22). This allows for a zero-dependency, high-performance structured database directly in the Node.js runtime.

### Request Pipeline

Every request flows through a structured pipeline:
`HTTP Request` → `Rate Limiter` → `Auth Check` → `Validations` → `Busines Logic (Handler)` → `JSON Response`

---

## Stack

-   **Runtime**: Node.js v22.x+
-   **Language**: TypeScript (with `tsx` for high-speed development)
-   **Database**: `node:sqlite` (Experimental native module)
-   **AI**: OpenAI SDK
-   **Utilities**: `rss-parser`, `jsonwebtoken`, `bcrypt`, `dotenv`

---

## Getting Started

### Prerequisites

-   **Node.js**: Version 22.0.0 or higher is required for `node:sqlite` support.
-   **OpenAI API Key**: Required for the summarization feature.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/nathalia-nobrega/rss-aggregator.git
    cd rss-aggregator
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Configure environment variables:
   Create a `.env` file in the root:
    ```env
    PORT=8000
    JWT_SECRET=your_super_secret_key
    OPENAI_API_KEY=sk-xxxx...
    SYNC_INTERVAL_MINUTES=30
    ```

### Running the App

```bash
# Development mode
npm run dev
```

---

## API Documentation

### Authentication

| Method | Endpoint         | Description             |
| :----- | :--------------- | :---------------------- |
| `POST` | `/auth/register` | Register a new account  |
| `POST` | `/auth/login`    | Login and receive a JWT |

### Feeds

| Method   | Endpoint     | Auth | Description                    |
| :------- | :----------- | :--- | :----------------------------- |
| `GET`    | `/feeds`     | Yes  | List all your registered feeds |
| `POST`   | `/feeds`     | Yes  | Add a new RSS feed URL         |
| `GET`    | `/feeds/:id` | Yes  | Get details of a specific feed |
| `PATCH`  | `/feeds/:id` | Yes  | Update feed status or priority |
| `DELETE` | `/feeds/:id` | Yes  | Remove a feed and its articles |

### Articles

| Method | Endpoint              | Auth | Description                                |
| :----- | :-------------------- | :--- | :----------------------------------------- |
| `GET`  | `/feeds/:id/articles` | Yes  | List articles for a feed (paginated)       |
| `GET`  | `/articles/:id`       | Yes  | Get a single article (includes AI summary) |

---

## Internal Polling Engine

The aggregator includes a background synchronization service that:

1. Fetches active feeds based on their `priority`.
2. Normalizes and parses XML/Atom data.
3. Performs content-hash checks to avoid duplicates.
4. **Triggers AI Summarization** for high-priority items.
5. Updates feed health and error counts.

---

## Future Improvements

-   [ ] Websocket support for real-time article notifications.
-   [ ] Multi-provider AI support (Anthropic/Claude/Gemini).
-   [ ] Export features (OPML, PDF summaries).
-   [ ] Frontend dashboard (next.js).
