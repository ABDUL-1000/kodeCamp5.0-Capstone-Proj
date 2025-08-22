# E-commerce API (Express + MongoDB + JWT)

Implements the required endpoints:
- `POST /auth/register` — accepts `fullName`, `email`, `password`, `role` (`admin` or `customer`).
- `POST /auth/login` — returns JWT with `userId`, `email`, `role`.
- `GET /products` — public list of products.
- `POST /products` — **admin only**. Fields: `productName`, `cost`, `productImages` (array of links), `description`, `stockStatus`. `ownerId` is automatically set to the admin's `userId` from JWT.
- `DELETE /products/:id` — **admin only**.

## Quickstart

1. Create a `.env` from `.env.example` and fill in values.
2. Install deps:
   ```bash
   npm install
   ```
3. Run locally:
   ```bash
   npm run dev
   # or
   npm start
   ```

## JWT Payload
On login, the token includes:
```json
{ "userId": "...", "email": "user@example.com", "role": "admin|customer" }
```

## Postman
Import `postman_collection.json` into Postman. It contains example requests for all endpoints.
Set a Postman variable `baseUrl` to your local server (e.g., `http://localhost:8080`) or your Render URL.
After logging in as admin, the collection will automatically use the token via a collection variable `token`.

## Deploy to Render.com
1. Push this repo to GitHub.
2. On Render, create a **Web Service** from the repo.
3. Environment:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Add environment variables `MONGO_URI`, `JWT_SECRET`, and optionally `PORT`.
4. Save and deploy. Your public URL will be like `https://your-service.onrender.com`.

## Notes
- `ownerId` is enforced from the authenticated admin; any `ownerId` in the request body is ignored for security.
- Validation errors return `400` with details.
- Unauthorized requests return `401` or `403`.
