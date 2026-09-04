# 💠 ClaimDesk

### Expense Voucher Management System

> A full-stack expense management platform that digitizes voucher creation, approval, and reimbursement workflows.

**React 18 · Node.js · Express · PostgreSQL · Supabase · JWT · Vercel**

---

## 🚀 Overview

ClaimDesk replaces a manual expense voucher process with a centralized, role-based workflow.

**Employee → Director → Accounts**

* 👤 **Employee** — Create, edit, submit & track vouchers
* 🛡️ **Director** — Review, AI-assisted risk analysis, approve/reject
* 💼 **Accounts** — Monitor vouchers for reimbursement

The system was built with a focus on **security, business rules, clean architecture, and user experience**.

---

## 🏗️ Architecture

```text
                ┌──────────────────┐
                │   React 18 UI    │
                └────────┬─────────┘
                         │ Axios
                         ▼
                ┌──────────────────┐
                │  Express REST API│
                └────────┬─────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Auth/RBAC  Services   Validation
                         │
                    ┌────┴────┐
                    ▼         ▼
                PostgreSQL  Storage
                 Supabase    Supabase
```

### Project Structure

```text
client/          → React application
server/
  routes/        → REST endpoints
  services/      → Business logic
  middleware/    → Auth, uploads, errors
  db/            → Database schema
api/             → Vercel serverless entry
```

---

## ✨ Key Features

| Feature                  | Employee | Director | Accounts |
| ------------------------ | :------: | :------: | :------: |
| Create / edit drafts     |     ✅    |     —    |     —    |
| Submit with signature    |     ✅    |     —    |     —    |
| View vouchers            |    Own   |    All   |    All   |
| Search / filter / sort   |     ✅    |     ✅    |     ✅    |
| AI risk analysis         |     —    |     ✅    |     —    |
| Approve / reject         |     —    |     ✅    |     —    |
| Reimbursement monitoring |     —    |     —    |     ✅    |

### Workflow

```text
Draft
  ↓
Submitted
  ↓
Pending Approval
  ├──→ Rejected + Reason
  │
  └──→ Approved + Signature
              ↓
          Accounts
```

---

## 🤖 AI Risk Analysis

The Director receives a **0–100 rule-based risk score** to assist review.

Factors include:

* Expense amount
* Description quality
* Weekend expense date
* Employee's recent rejection rate

> The AI assists the decision — it does not make the decision.

---

## 🔐 Security & Business Rules

Security is enforced **server-side**, not just through the UI.

* JWT authentication
* bcrypt password hashing
* Role-based authorization
* Employees can access only their own vouchers
* Only drafts can be edited/deleted
* Submitted vouchers become read-only
* Signatures required before submission/approval
* Rejection reason required
* Voucher numbers generated uniquely
* Secrets kept in environment variables

### Encapsulation

Not everything belongs in the public layer.

**Public:** UI, API contract, documentation
**Private:** secrets, service credentials, password hashes, internal configuration and sensitive implementation details

The frontend controls the **experience**; the backend controls the **rules**.

---

## 🛠️ Tech Stack

**Frontend:** React 18 · React Router · Bootstrap 5 · Axios · React Toastify

**Backend:** Node.js · Express · JWT · bcrypt · Multer

**Database / Storage:** Supabase PostgreSQL · Supabase Storage

**Deployment:** Vercel

---

## 💡 Engineering Decisions

### Why Supabase?

Used for managed PostgreSQL and Storage so development could focus on application logic rather than building commodity infrastructure.

### Why Bootstrap?

Used as a UI foundation to accelerate responsive development while keeping custom styling for the application's visual identity.

### Why rule-based AI?

A deterministic risk engine keeps the feature explainable, predictable, testable, and free from external LLM dependencies.

### Why same-origin `/api`?

The frontend uses `/api` in production, allowing the React app and serverless API to run under the same Vercel deployment.

> **Third-party integrations were deliberate engineering choices — reducing development time where rebuilding infrastructure would add little business value.**

---

## ⚡ Getting Started

### 1. Clone

```bash
git clone https://github.com/<your-username>/claimdesk.git
cd claimdesk
```

### 2. Setup Supabase

Run:

```text
server/db/schema.sql
```

Create a Storage bucket named:

```text
signatures
```

### 3. Backend

```bash
cd server
cp .env.example .env
npm install
node scripts/seedUsers.js
npm run dev
```

### 4. Frontend

```bash
cd client
npm install
npm start
```

**Frontend:** `http://localhost:3000`
**Backend:** `http://localhost:5000`

---

## 🔑 Demo Accounts

| Role     | Email                    | Password      |
| -------- | ------------------------ | ------------- |
| Employee | `employee@claimdesk.com` | `password123` |
| Director | `director@claimdesk.com` | `password123` |
| Accounts | `accounts@claimdesk.com` | `password123` |

---

## ☁️ Deployment

Designed as a **single Vercel monorepo**:

```text
Vercel
├── /       → React static build
└── /api/*  → Node.js serverless API
                 ↓
             Supabase
```

Environment variables are used for all secrets and deployment-specific configuration.

---

## 🎯 What This Project Demonstrates

**Frontend architecture** · **REST API design** · **Authentication & RBAC** · **Database design** · **File uploads** · **Business-rule enforcement** · **Third-party integration** · **Responsive UI/UX** · **Serverless deployment**

---

<p align="center">

### Built with React + Node.js + Supabase

**ClaimDesk — Turning manual expense claims into a structured digital workflow.**

</p>
