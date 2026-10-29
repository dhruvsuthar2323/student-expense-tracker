# SpendWise — Smart Student Expense Tracking System

<p align="center">
  <img src="client/public/favicon.svg" alt="SpendWise Logo" width="80" height="80" />
</p>

<p align="center">
  A modern, gamified, and intelligent full-stack personal finance web application built specifically for college students to track expenses, set category budgets, earn XP & streaks, and gain data-driven financial insights.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5-purple?logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-20+-green?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4-black?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-HTTP--Only_Cookie-red?logo=json-web-tokens&logoColor=white" alt="JWT" />
</p>

---

## 🌟 Key Features

### 1. 🔐 Authentication & Session Security
- **JWT in HTTP-Only Cookies**: Tokens are never accessible to client-side scripts, protecting users from XSS attacks.
- **Cross-Site Cookie Support**: Configured with `SameSite=None` and `Secure=true` in production to seamlessly handle decoupled deployments (e.g., Vercel frontend with Render backend).
- **Protected Routing**: Instant redirects for unauthorized attempts to access dashboard, transactions, analytics, or budget views.

### 2. 💸 Transaction Tracking & Smart Categorization
- **Dual Flow**: Track both **Income** (Pocket Money, Scholarship, Salary, Freelancing, Other) and **Expenses** (Food, Transportation, Education, Shopping, Entertainment, Bills, Health, Other).
- **🧠 Instant Keyword-Based Categorization**: Form dynamically suggests relevant expense categories as the user types descriptions (e.g., "uber" → Transportation, "mcdonalds" → Food, "netflix" → Entertainment).
- **Search, Filter & Sort**: Fast client-side filtering by type, category, date intervals, and text query with sorting capabilities.

### 3. 🎯 Budget Planning & Alerts
- **Monthly Category Budgets**: Set spending limits for individual expense categories with real-time utilization progress bars.
- **Smart Warnings**: Visual indicators and notifications when spending reaches 70%, 90%, or exceeds 100% of budget capacity.
- **Independent Management**: Deleting a budget category preserves historical transaction records.

### 4. 🏆 Gamification Engine (XP & Streaks)
- **Server-Authoritative Progression**: Prevents client-side manipulation of experience points.
  - **+10 XP** per recorded transaction.
  - **+5 XP Bonus** for the first transaction recorded each calendar day.
- **10-Level Progression**:
  - `Level 1`: Beginner 🌱 (0–99 XP)
  - `Level 2`: Money Tracker 📊 (100–249 XP)
  - `Level 3`: Budget Builder 🏗️ (250–449 XP)
  - `Level 4`: Savings Pro 💰 (450–699 XP)
  - `Level 5`: Budget Master 👑 (700–999 XP)
  - `Level 6`: Finance Guru 🧠 (1000–1399 XP)
  - `Level 7`: Wealth Builder 🏆 (1400–1899 XP)
  - `Level 8`: Expert Tracker ⭐ (1900–2499 XP)
  - `Level 9`: Finance Legend 🔥 (2500–3199 XP)
  - `Level 10`: Ultimate Saver 💎 (3200+ XP)
- **Consecutive Day Streaks**: Tracks continuous daily logging habits with highest streak records.
- **Interactive Badges**: Real-time level-up toast alerts and unlocked achievement previews.

### 5. 🧠 Smart Insights & Financial Health
- **Outlier Detection**: Statistical detection of unusually large expenses compared to the user's historical category average.
- **Spending Forecast**: End-of-month spending projections based on daily velocity.
- **Recurring Expense Detection**: Identifies potential recurring subscriptions, rent, or utilities based on periodicity and amounts.
- **Financial Health Snapshot**: Computes savings rate, expense-to-income ratios, and budget adherence without arbitrary scoring algorithms.

### 6. 📊 Analytics, Reports & Exports
- **Rich Recharts Visualizations**: Monthly income vs. expense trends, category distribution pie/doughnut charts, and period-over-period comparisons.
- **Printable Reports**: Native print-optimized styles for generating formal PDF summaries.
- **Data Export**: Clean CSV exports of filtered transaction histories.

### 7. 🎨 UI/UX & Accessibility
- **Theming**: Dark and Light mode toggle with persistent local and profile preferences.
- **Responsive Navigation**: Mobile slide-out drawer, persistent desktop sidebar, and gamified topbar.
- **Reduced Motion Support**: Animations respect OS `prefers-reduced-motion` settings.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 | Vite 5 build tool, React Router v6 |
| **Styling & Motion** | Tailwind CSS 3 | Framer Motion animations, Sonner notifications |
| **Charts** | Recharts 2 | Responsive SVG area, bar, and pie charts |
| **Backend API** | Node.js + Express | RESTful architecture with centralized error handling |
| **Database** | MongoDB Atlas | Mongoose ODM schemas with compound indexing |
| **Authentication** | JSON Web Tokens | Signed JWT stored in HTTP-only, secure cookies |
| **Date Utilities** | date-fns | Standardized calendar operations (Monday week start) |

---

## 📁 Project Architecture

```
smart-expense-tracker/
├── client/                                  # React (Vite) Frontend
│   ├── public/                              # Static public assets (SVG favicon, etc.)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                      # PageHeader, LoadingSpinner, ProtectedRoute
│   │   │   ├── gamification/                # LevelBadge, XPProgress, StreakDisplay, AchievementPreview
│   │   │   └── layout/                      # AppLayout, Sidebar, Topbar
│   │   ├── contexts/                        # AuthContext (user, session state, refreshUser)
│   │   ├── features/
│   │   │   ├── analytics/                   # Category breakdown, trend comparisons, summary cards
│   │   │   ├── auth/                        # LoginForm, RegisterForm
│   │   │   ├── budgets/                     # BudgetCard, BudgetForm, BudgetOverview
│   │   │   ├── dashboard/                   # SummaryCards, IncomeExpenseOverview, QuickActions
│   │   │   ├── reports/                     # ReportTransactionTable, CategoryReport, export helpers
│   │   │   ├── smart/                       # SmartInsights dashboard widget, rule engine & suggester
│   │   │   └── transactions/                # TransactionForm, TransactionList, Filters, Modals
│   │   ├── lib/                             # Axios client (api.js), constants, validators
│   │   ├── pages/                           # DashboardPage, TransactionsPage, BudgetsPage, etc.
│   │   ├── App.jsx                          # Main route configuration
│   │   └── main.jsx                         # Application entrypoint
│   ├── tailwind.config.js                   # Custom color themes & utilities
│   ├── vercel.json                          # Client-side SPA routing rewrites
│   └── vite.config.js                       # Vite build configuration with development proxy
│
├── server/                                  # Node.js Express Backend
│   ├── config/                              # MongoDB connection logic (db.js)
│   ├── controllers/                         # authController, transactionController, budgetController
│   ├── middleware/                          # auth.js (JWT verify), errorHandler.js
│   ├── models/                              # User.js, Transaction.js, Budget.js
│   ├── routes/                              # authRoutes, transactionRoutes, budgetRoutes
│   ├── utils/                               # gamification.js, generateToken.js
│   ├── validators/                          # authValidator.js
│   └── server.js                            # Express application entrypoint
│
├── .gitignore                               # Production gitignore (excludes .env & node_modules)
├── render.yaml                              # Render Web Service Blueprint configuration
└── README.md                                # Project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster or local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/dhruvsuthar2323/student-expense-tracker.git
cd student-expense-tracker
```

### 2. Configure & Run Backend Server
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secure-random-jwt-secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Install packages and launch:
```bash
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

### 3. Configure & Run Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` with automatic API proxying to port 5000.*

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user; awards initial Level 1 status |
| `POST` | `/api/auth/login` | Public | Authenticates credentials & sets HTTP-only cookie |
| `POST` | `/api/auth/logout` | Public | Clears authentication cookie |
| `GET` | `/api/auth/me` | Protected | Returns current user profile with live gamification stats |

### Transactions (`/api/transactions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | Protected | Fetch user transactions (sorted by date descending) |
| `POST` | `/api/transactions` | Protected | Create transaction; awards XP, updates streak & level |
| `PUT` | `/api/transactions/:id` | Protected | Update transaction (does not award duplicate XP) |
| `DELETE` | `/api/transactions/:id` | Protected | Delete transaction |

### Budgets (`/api/budgets`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/budgets` | Protected | Fetch budgets with live spend & percentage calculations |
| `POST` | `/api/budgets` | Protected | Create new category budget limit |
| `PUT` | `/api/budgets/:id` | Protected | Update budget amount |
| `DELETE` | `/api/budgets/:id` | Protected | Delete budget (retains transactions) |

---

## 🌐 Production Cloud Deployment

### 1. Push to GitHub
```bash
git push -u origin main
```

### 2. Deploy Backend on [Render](https://render.com)
1. In Render Dashboard, select **New + → Web Service**.
2. Connect the `student-expense-tracker` repository.
3. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Set Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = *(Your MongoDB Atlas connection URI)*
   - `JWT_SECRET` = *(Generate a strong random secret)*
   - `JWT_EXPIRE` = `7d`
   - `CLIENT_URL` = *(Your production frontend URL, e.g. `https://your-app.vercel.app`)*
5. Ensure **MongoDB Atlas Network Access** allows `0.0.0.0/0` for Render's dynamic outgoing IPs.

### 3. Deploy Frontend on [Vercel](https://vercel.com)
1. In Vercel Dashboard, select **Add New → Project**.
2. Import the `student-expense-tracker` repository.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
5. Deploy.

---

## 📄 License
This project is developed for educational and academic demonstration purposes as a college minor project.
