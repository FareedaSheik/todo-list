# Chicken Shop Management System

A simple full-stack app to manage products, customers, and orders for a chicken shop.

- Backend: Node.js (Express) + SQLite (better-sqlite3)
- Frontend: React (Vite)

## Run locally

Open two terminals.

1) Backend

```
cd server
npm run dev
```

Server runs on http://localhost:4000

2) Frontend

```
cd client
npm run dev
```

Frontend runs on the URL shown by Vite (usually http://localhost:5173). Vite is configured to proxy `/api` to the backend.

## API

- `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- `GET /api/customers`, `POST /api/customers`, `PUT /api/customers/:id`, `DELETE /api/customers/:id`
- `GET /api/orders`, `POST /api/orders`

Creating an order validates stock and decrements inventory for each ordered item.

## Environment

- Optional: create `server/.env` with `DB_PATH=./chicken_shop.db` and/or `PORT=4000`.