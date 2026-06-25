# HRConnect

Enterprise Employee Management System for Brain Station 23 (BS23)

**GitHub:** [github.com/itsaahsan/HRConnect](https://github.com/itsaahsan/HRConnect)

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Recharts, React Hook Form, Zod, Axios, Lucide React |
| Backend | Node.js, Express.js, Sequelize ORM, JWT, bcryptjs, Multer, csv-writer, express-validator, helmet, cors |
| Database | PostgreSQL |
| Deployment | Render (no Docker) |

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

## Demo Credentials

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

## Deployment to Render

### 1. Create PostgreSQL Database
- Go to [Render Dashboard](https://dashboard.render.com)
- Create a new PostgreSQL database (or use Neon)
- Copy the Database URL

### 2. Deploy Backend
- Create a new **Web Service**
- Connect GitHub repo
- Settings:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `node server.js`
- Environment Variables:
  ```
  DATABASE_URL=<your-postgresql-url>
  JWT_SECRET=<random-32-chars>
  JWT_REFRESH_SECRET=<random-32-chars>
  NODE_ENV=production
  FRONTEND_URL=<your-frontend-url>
  ```

### 3. Deploy Frontend
- Create a new **Static Site**
- Connect GitHub repo
- Settings:
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
- Environment Variables:
  ```
  VITE_API_URL=<your-backend-url>/api
  ```

## Project Structure

```
HRConnect/
├── backend/
│   ├── server.js              # Express entry point
│   ├── config/database.js     # PostgreSQL connection
│   ├── models/                # 10 Sequelize models
│   │   ├── User.js, Employee.js, Department.js
│   │   ├── Attendance.js, Leave.js, Payroll.js
│   │   ├── LeaveBalance.js, Notification.js
│   │   ├── Holiday.js, ActivityLog.js
│   │   └── index.js           # Associations
│   ├── controllers/           # 10 route handlers
│   ├── routes/                # 10 API routers
│   ├── middleware/             # auth, role, upload, validate
│   ├── utils/                 # csvExport, generatePayslip
│   ├── tests/                 # Jest + Supertest (29 tests)
│   ├── seed.js                # Sample data seeder
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.ts       # Axios + interceptors
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, Navbar
│   │   │   ├── common/        # 9 reusable components
│   │   │   └── charts/        # 3 Recharts components
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── admin/         # 13 admin pages
│   │   │   ├── manager/       # 3 manager pages
│   │   │   └── employee/      # 5 employee pages
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # formatDate, formatCurrency, validators
│   │   ├── test/              # Vitest (24 tests)
│   │   └── App.tsx
│   └── package.json
│
├── render.yaml                # Render deployment config
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
