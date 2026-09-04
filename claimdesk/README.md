# ClaimDesk - Expense Voucher Management System

A web-based expense voucher management system that replaces the manual voucher approval process at ABC Company.
Employees create and submit vouchers, the Director approves or rejects them, and the Accounts Team monitors them for reimbursement.

## Tech stack

- **Frontend:** React 18, React Router, Bootstrap 5, React Toastify, Axios
- **Backend:** Node.js, Express, JWT (jsonwebtoken), bcrypt, Multer (file uploads)
- **Database:** Supabase (Postgres)
- **Auth:** Custom JWT signed by the backend, role-based protected routes

## Project structure

```
claimdesk/
  server/
    src/
      config/        # Supabase client
      controllers/   # (reserved for future split)
      middleware/    # auth, errorHandler, upload
      routes/        # auth, voucher, user
      services/      # auth.service, voucher.service, user.service
      utils/         # ApiError class
      server.js      # entry point
    db/
      schema.sql     # run once in Supabase SQL editor
    scripts/
      seedUsers.js   # seeds demo accounts with real bcrypt hash
    uploads/         # uploaded signature images
    .env.example
    package.json

  client/
    public/
    src/
      api/           # axios instance + endpoint wrappers
      components/    # AppShell, Sidebar, Topbar, ProtectedRoute, SearchFilterBar
      context/       # AuthContext
      pages/
        auth/        # LoginPage
        employee/    # Dashboard, Vouchers, VoucherForm
        director/    # Dashboard, Vouchers
        accounts/    # Dashboard, Vouchers
        shared/      # VoucherDetails
      styles/        # app.css
      utils/         # format helpers
      App.js
      index.js
    package.json
```

## Features by role

| Capability | Employee | Director | Accounts |
|---|---|---|---|
| Login / role-based routing | yes | yes | yes |
| Create / edit / delete draft vouchers | yes | no | no |
| Submit vouchers (with signature) | yes | no | no |
| Approve / reject (with reason + signature) | no | yes | no |
| View all vouchers | no | yes | yes |
| Search / filter / sort | partial | yes | yes |
| Dashboards with stats | yes | yes | yes |

All business rules from the brief are enforced server-side:
- Voucher numbers are auto-generated and unique
- Drafts are the only state editable by employees
- Signatures are mandatory before submit and approve
- Rejection reason is mandatory
- Employees can only see their own vouchers

## Setup

### 1. Supabase

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** and run the contents of `server/db/schema.sql`
3. Copy your **Project URL** and **service_role key** from Project Settings > API

### 2. Backend

```bash
cd server
cp .env.example .env
# edit .env and fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET

npm install
node scripts/seedUsers.js     # one-time: creates demo accounts
npm run dev                   # starts http://localhost:5000
```

### 3. Frontend

```bash
cd client
npm install
npm start                     # starts http://localhost:3000
```

The React dev server proxies `/api` and `/uploads` to the backend, so no CORS changes needed locally.

## Demo accounts

After running `seedUsers.js` you can log in with any of:

| Role | Email | Password |
|---|---|---|
| Employee | employee@claimdesk.com | password123 |
| Director | director@claimdesk.com | password123 |
| Accounts | accounts@claimdesk.com | password123 |

The login screen also has one-click buttons that pre-fill each demo account.

## REST API summary

All voucher routes require `Authorization: Bearer <token>`.

```
POST   /api/auth/login          { email, password } -> { token, user }
GET    /api/auth/me                                       -> current user

GET    /api/vouchers            ?search=&status=&department=&category=
                                 &dateFrom=&dateTo=&minAmount=&maxAmount=
                                 &sortBy=&order=
GET    /api/vouchers/dashboard  -> aggregated counts + recent 5
GET    /api/vouchers/:id
POST   /api/vouchers            (employee) create draft
PUT    /api/vouchers/:id        (employee) update draft
DELETE /api/vouchers/:id        (employee) delete draft
POST   /api/vouchers/:id/submit  multipart 'signature' (employee)
POST   /api/vouchers/:id/approve multipart 'signature' (director)
POST   /api/vouchers/:id/reject  { reason } (director)

GET    /api/users               (director / accounts)
```

## Notes

- JWT is signed with `JWT_SECRET`; never commit the real `.env`.
- Passwords are stored as bcrypt hashes.
- Signature images are stored on the server under `server/uploads/` and served from `/uploads/...`.
- The UI is a clean, professional Bootstrap 5 layout - not flashy, not AI-looking, just a sensible internal tool.
- Toast notifications (react-toastify) are used for success / error feedback on every action.