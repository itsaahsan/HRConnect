# HRConnect

A full-stack enterprise employee management system covering attendance, leave, payroll, and HR reporting — built to demonstrate the kind of internal tooling used by mid-size tech companies.

**GitHub:** [github.com/itsaahsan/HRConnect](https://github.com/itsaahsan/HRConnect)

## Live Demo

- **App**: https://hrconnect-kappa.vercel.app

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Recharts, React Hook Form, Zod, Axios, Lucide React |
| Backend | Node.js, Express.js, Sequelize ORM, JWT, bcryptjs, Multer, csv-writer, express-validator, helmet, cors |
| Database | PostgreSQL (Neon) |
| Deployment | Vercel |

## Features

### Authentication
- JWT access token (30min) + refresh token (7 days)
- Role-based access (Admin, Manager, Employee)
- Rate limiting on login (5 attempts/min)
- Protected routes per role

### Employee Management (Admin)
- Full CRUD with search, filter, sort, pagination
- Profile photo upload (Multer, max 5MB)
- Export to CSV
- Employee detail with attendance, leave, payroll history

### Department Management (Admin)
- Create, edit, delete departments
- Assign managers
- Employee count per department
- Budget tracking

### Attendance System
- Clock in / Clock out (Employee)
- Auto-detect late arrivals
- Overtime calculation
- Manual marking (Admin)
- Attendance reports by date range, employee, department

### Leave Management
- 6 leave types (Annual, Sick, Unpaid, Emergency, Maternity, Paternity)
- Leave balance tracking (Annual + Sick)
- Submit, approve, reject with reason
- Manager can approve team leaves
- Cancel pending requests

### Payroll System
- Auto-generate payroll for all employees
- Auto-calculate: basic, allowances (20%), deductions (absent days), overtime (1.5x)
- Net salary calculation
- Process, mark as paid, bulk operations
- Print-friendly HTML payslip
- Export to CSV

### Reports
- Dashboard with stat cards and charts
- Attendance report by date range
- Leave report by department
- Payroll summary report
- Employee headcount report
- All exportable to CSV

### Notifications
- Bell icon with unread count
- Mark as read / Mark all read
- Clear all
- Auto-refresh every 60 seconds

### Holiday Management (Admin)
- Create, edit, delete holidays
- Public, company, and optional holiday types
- Upcoming holidays display

### Activity Log (Admin)
- Tracks all user actions (login, create, update, delete, approve, reject)
- User and timestamp info

### Settings (Admin)
- Company information
- Leave policy defaults
- System information display

## Demo Access

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrconnect.com | Admin1234 |
| Manager | manager@hrconnect.com | Manager1234 |
| Employee | employee@hrconnect.com | Employee1234 |

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # Configure your PostgreSQL credentials
npm run seed            # Seed database with sample data
npm run dev             # Start on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev             # Start on port 5173
```

### Running Tests
```bash
# Backend tests (Jest + Supertest)
cd backend && npm test

# Frontend tests (Vitest)
cd frontend && npm test
```

## Deployment to Vercel

### 1. Create PostgreSQL Database
- Use [Neon](https://neon.tech) or any PostgreSQL provider
- Copy the connection URL

### 2. Deploy to Vercel
- Import the GitHub repository
- Root Directory: `/`
- Framework: Other
- Build Command: (leave default, handled by `vercel.json`)
- Output Directory: (leave default, handled by `vercel.json`)

### 3. Set Environment Variables
```
DATABASE_URL=<your-postgresql-url>
JWT_SECRET=<random-32-chars>
JWT_REFRESH_SECRET=<random-32-chars>
JWT_EXPIRE=3600
JWT_REFRESH_EXPIRE=604800
NODE_ENV=production
FRONTEND_URL=<your-vercel-url>
```

## Project Structure

```
HRConnect/
├── api/
│   └── index.js           # Vercel serverless function (Express wrapper)
├── backend/
│   ├── server.js          # Express entry point
│   ├── config/database.js # PostgreSQL connection
│   ├── models/            # 10 Sequelize models
│   ├── controllers/       # 10 route handlers
│   ├── routes/            # 10 API routers
│   ├── middleware/         # auth, role, upload, validate
│   ├── utils/             # csvExport, generatePayslip
│   ├── tests/             # Jest + Supertest (29 tests)
│   ├── seed.js            # Sample data seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.ts   # Axios + interceptors
│   │   ├── context/       # AuthContext, ThemeContext
│   │   ├── components/    # Layout, common, charts
│   │   ├── pages/         # Admin (13), Manager (3), Employee (5)
│   │   ├── types/         # TypeScript interfaces
│   │   ├── utils/         # formatDate, formatCurrency, validators
│   │   ├── test/          # Vitest (24 tests)
│   │   └── App.tsx
│   └── package.json
├── vercel.json            # Vercel deployment config
├── .gitignore
└── README.md
```

## Database Schema

10 tables: users, employees, departments, attendance, leaves, payroll, leave_balances, notifications, holidays, activity_logs

## Security

- Helmet (security headers)
- CORS restricted to frontend URL
- JWT authentication on all protected routes
- Role-based access control
- bcryptjs password hashing
- express-validator input validation
- Rate limiting on login (5/min)
- Multer file upload validation (images, 5MB max)
- SQL injection prevention via Sequelize ORM

## Test Results

```
Backend:  29/29 passed (Jest + Supertest)
Frontend: 24/24 passed (Vitest)
```

## License

MIT

## Author

**Amimul Ahsan** - [GitHub](https://github.com/itsaahsan)
