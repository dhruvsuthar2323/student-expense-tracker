# SpendWise — Smart Student Expense Tracking System

A modern web application that helps college students manage their personal finances by tracking income, expenses, budgets, and spending habits.

## Tech Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Frontend       | React 18 + Vite 5 + Tailwind CSS |
| Backend        | Node.js + Express.js             |
| Database       | MongoDB + Mongoose               |
| Authentication | JWT (HTTP-only cookies)          |
| Charts         | Recharts                         |
| HTTP Client    | Axios                            |
| Date Handling  | date-fns                         |
| Notifications  | Sonner                           |
| Icons          | React Icons                      |

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) running locally, or a MongoDB Atlas account
- npm (comes with Node.js)

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd smart-expense-tracker
```

### 2. Set up the server

```bash
cd server
cp .env.example .env     # Create environment file
```

Edit `server/.env` and update `MONGODB_URI` if needed:
- **Local MongoDB:** `mongodb://localhost:27017/expense-tracker`
- **MongoDB Atlas:** `mongodb+srv://user:password@cluster.mongodb.net/expense-tracker`

Also set a strong `JWT_SECRET` value.

```bash
npm install              # Install dependencies
npm run dev              # Start the server (with nodemon)
```

The server will run on `http://localhost:5000`.

### 3. Set up the client

Open a new terminal:

```bash
cd client
npm install              # Install dependencies
npm run dev              # Start the Vite dev server
```

The client will run on `http://localhost:5173`.

### 4. Verify the setup

- Open `http://localhost:5173` in your browser
- You should see the SpendWise placeholder page with a green "Backend Connected" status
- Visit `http://localhost:5000/api/health` directly to see the health check JSON response

## Project Structure

```
smart-expense-tracker/
├── client/              # React frontend (Vite)
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── assets/      # Images, illustrations
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React Context providers
│   │   ├── features/    # Feature-specific components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities, API client, constants
│   │   ├── pages/       # Page-level components
│   │   ├── App.jsx      # Root component
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Tailwind directives
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/              # Express backend
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── seeds/           # Demo data scripts
│   ├── utils/           # Helper functions
│   ├── validators/      # Input validation
│   └── server.js        # Entry point
│
├── .gitignore
└── README.md
```

## Available Scripts

### Server

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start with nodemon (auto-reload) |
| `npm start`       | Start in production mode       |
| `npm run seed`    | Populate demo data             |
| `npm run seed:reset` | Remove demo data            |

### Client

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start Vite dev server          |
| `npm run build`   | Build for production           |
| `npm run preview` | Preview production build       |

## Deployment

### Backend → Render

1. Push the project to a GitHub repository.
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New → Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Add **Environment Variables** in Render:
   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | *(your MongoDB Atlas connection string)* |
   | `JWT_SECRET` | *(generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)* |
   | `JWT_EXPIRE` | `7d` |
   | `CLIENT_URL` | `https://your-app.vercel.app` *(your Vercel frontend URL)* |
6. Deploy. Note the Render URL (e.g. `https://spendwise-api.onrender.com`).

### Frontend → Vercel

1. Go to [Vercel Dashboard](https://vercel.app/) → **Add New → Project**.
2. Import your GitHub repo.
3. Configure:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variable** in Vercel:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://your-render-url.onrender.com/api` |
5. Deploy.

### Post-Deployment

1. **Update Render's `CLIENT_URL`** with your actual Vercel URL.
2. **MongoDB Atlas → Network Access:** Ensure `0.0.0.0/0` is allowed (required for Render's dynamic IPs).
3. **Redeploy both** after updating environment variables.
4. Test: Register → Login → Add transaction → Verify XP → Logout → Login again.

### Cross-Origin Cookie Authentication

The app uses HTTP-only cookies for JWT authentication across different domains:
- Production cookies use `secure: true` and `sameSite: 'none'` (set automatically when `NODE_ENV=production`).
- CORS is configured with `credentials: true` and the `CLIENT_URL` origin.
- The frontend Axios instance sends `withCredentials: true` with every request.

## License

This project is a college minor project for educational purposes.
