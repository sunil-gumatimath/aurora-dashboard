# Aurora EMS

Modern Employee Management System built with React 19 and Supabase.

## ✨ Features

- **HR Core**: Employee profiles, documents, and role-based access (Admin/Manager/Employee).
- **Workforce**: Time tracking, leave management (with holiday calendar), and attendance.
- **Productivity**: Kanban task board, interactive calendar, and analytics dashboard.
- **Support**: Help desk ticketing system.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 6, TailwindCSS 4, React Router 7
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Infrastructure**: Docker, Nginx

## 🚀 Quick Start

### 1. Setup
```bash
git clone https://github.com/sunil-gumatimath/emp-management-vibecode.git
cd react-browser
bun install
```

### 2. Database
- Create a project at [Supabase](https://supabase.com).
- Run `database/aurora_ems_complete.sql` in the Supabase SQL Editor.

### 3. Environment
`cp .env.example .env.local` and add your credentials:
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### 4. Run Locally
```bash
bun run dev
```

## 🐳 Docker
```bash
docker-compose up -d --build
```
Access at `http://localhost:8080`



