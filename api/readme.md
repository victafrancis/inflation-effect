# Inflation API

Public API for the **Price Inflation Tracker** project.
Deployed on **Cloudflare Workers** with **Neon Postgres**.

---

## 🔧 Setup

Install dependencies:

```bash
npm i hono @neondatabase/serverless
npm i -D wrangler typescript @cloudflare/workers-types
```

---

## ⚙️ Local Development

Environment variables go in `.dev.vars`:

```bash
DATABASE_URL=postgres://USER:PASSWORD@ep-xxxx-xxxx.neon.tech/neondb?sslmode=require
```

Start local server:

```bash
npm run dev
```

Local URL:

```
http://127.0.0.1:8787
```

Test health:

```bash
curl http://127.0.0.1:8787/v1/health
```

---

## 🚀 Deployment

Set the production secret once (paste Neon connection string when prompted):

```bash
wrangler secret put DATABASE_URL
```

Deploy Worker:

```bash
npm run deploy
```

Live URL (workers.dev subdomain):

```
https://inflation-api.inflation-data.workers.dev
```

Test health:

```bash
curl https://inflation-api.inflation-data.workers.dev/v1/health
```

---

## 📌 Example Endpoints

* Health check:

  ```
  GET /v1/health
  ```

  Response:

  ```json
  { "ok": true }
  ```

* Random deck:

  ```
  GET /v1/deck/random
  ```
