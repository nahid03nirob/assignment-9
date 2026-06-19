# IdeaVault Server

GitHub Server Side URL: https://github.com/nahid03nirob/assignment-9/tree/main/server

Live API URL: https://your-ideavault-server.onrender.com

This is the Express and MongoDB API server for IdeaVault.

## Features

- JWT authentication for email/password and Google login flows.
- User profile read/update endpoint.
- Startup idea CRUD endpoints with owner protection.
- Trending ideas endpoint using MongoDB aggregation and `$limit`.
- Comment add, edit, and delete endpoints for logged-in users.
- My Ideas and My Interactions private endpoints.
- Search by idea title using case-insensitive `$regex`.
- Category and date range filters for ideas.

## Environment Variables

Copy `.env.example` to `.env` and update the values.

```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=ideavault
JWT_SECRET=your_secret
CLIENT_ORIGIN=http://localhost:5173,https://your-client-site.vercel.app
```

## Run Locally

```bash
npm install
npm run dev
```

## Important Routes

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `GET /ideas`
- `GET /ideas/trending?limit=6`
- `POST /ideas`
- `PATCH /ideas/:id`
- `DELETE /ideas/:id`
- `GET /comments/:ideaId`
- `POST /comments/:ideaId`
- `PATCH /comments/:id`
- `DELETE /comments/:id`
