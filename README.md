# Task Manager & Secure Notes (Frontend)

Modern, functional dashboard built with **Next.js 14**, **React 18**, **TypeScript**, and **Tailwind CSS**. It connects to the Secure Note-Taking REST API to verify authentication, role-based access control, paginated CRUD operations, and MongoDB aggregation pipelines.

---

## 🌟 Highlights

- **Authentication & RBAC**:
  - Sign in and user registration with role selector and interests tag inputs.
  - 1-Click Demo login buttons for both Admin and User roles.
  - Role-specific access controls (e.g. Admin User Management table, view everyone's notes).
- **Notes CRUD & Pagination**:
  - Full note creation, reading, inline editing, and deletion.
  - Server-side paginated note listing.
- **Admin Management**:
  - User listing, creation, and deletion with cascading cleanup.
- **Aggregation Pipeline Visualizers**:
  - **Scenario 1 (Group by Interests)**: Visual cards displaying users grouped by interests from a single `collection.aggregate()` call.
  - **Scenario 2 (User Posts $lookup)**: Interactive user dropdown running a single aggregation pipeline with a `$lookup` stage to fetch user details and their authored posts.
- **Public Community Feed**:
  - Create and read public posts.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Configure `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build for Production
```bash
npm run build
npm start
```
