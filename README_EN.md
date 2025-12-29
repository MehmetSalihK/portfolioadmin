# 🎨 Portfolio Admin Dashboard

<div align="center">

**🌍 Langues / Languages / Diller**

[![Français](https://img.shields.io/badge/Langue-Français-blue?style=for-the-badge&logo=flag-icon&logoColor=white)](README.md)
[![English](https://img.shields.io/badge/Language-English-red?style=for-the-badge&logo=flag-icon&logoColor=white)](README_EN.md)
[![Türkçe](https://img.shields.io/badge/Dil-Türkçe-white?style=for-the-badge&logo=flag-icon&logoColor=red)](README_TR.md)

---

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

  <br />
  
  <h3>🚀 A modern No-Code solution to manage your professional portfolio</h3>
  
  <p>No more manual source code edits! Manage everything from an elegant interface.</p>

[View Demo](https://your-demo.vercel.app) • [Documentation](#-complete-installation) • [Report Bug](https://github.com/mehmetsalihkuscu/portfolio-admin/issues)

</div>

<br />

## 📋 Table of Contents

- [🎯 About](#-about)
- [✨ Detailed Features](#-detailed-features)
- [🛡️ Security & Architecture](#%EF%B8%8F-security--architecture)
- [💻 Admin Interface Guide](#-admin-interface-guide)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🌐 API Routes](#-api-routes)
- [📥 Complete Installation](#-complete-installation)
- [⚙️ Configuration](#%EF%B8%8F-configuration)
- [🔧 Troubleshooting (FAQ)](#-troubleshooting-faq)
- [🤝 Contribution](#-contribution)
- [📄 License](#-license)

---

## 🎯 About

**Portfolio Admin** was born from a simple need: allow developers to focus on what they love (coding) without wasting time maintaining their portfolio content.

> "Your portfolio should evolve as fast as your skills."

### Why use Portfolio Admin?

- **⚡ Save Time**: Edit text or add a project in 30 seconds.
- **🎨 Premium Design**: A polished, responsive, and animated interface by default.
- **🔐 Maximum Security**: Your data is protected by industry standards.
- **📱 100% Responsive**: Manage your site from your mobile.

---

## ✨ Detailed Features

### 🎨 Content Management (CMS)

- **Rich Editor (WYSIWYG)**: Formatting (bold, italic, lists, colors) without writing HTML.
- **Live Preview**: See your changes before publishing.
- **Automated SEO**: Dynamically generated Metadata and OpenGraph.

### 🔐 Authentication & Security

- **NextAuth.js**: Robust session system with token rotation.
- **Two-Factor Authentication (2FA)**: Temporary codes sent via Email (using Resend).
- **Roles**: Clear distinction between Admin (full access) and Visitor (read-only).

### 📊 Projects & Skills

- **Full CRUD**: Add, edit, delete your projects.
- **Categorization**: Sort your projects by tags or technologies.
- **Interactive Modals**: Detailed presentation with image gallery and links.
- **Drag & Drop**: Reorganize display order (Coming Soon).

### 📄 CV Management

- **PDF Upload**: Simple update of your CV.
- **Viewing Modal**: Recruiters can read your CV without leaving the site.
- **Quick Actions**: Integrated "Download" or "Open" buttons.

---

## 🛡️ Security & Architecture

We apply a **"Secure by Default"** policy.

| Feature               | Description                                                                         |
| :-------------------- | :---------------------------------------------------------------------------------- |
| **🛡️ Rate Limiting**  | Protection against DDoS and Brute-Force (`10 req/min` on login, `100 req/min` API). |
| **🔒 Zod Validation** | Strict schemas for all inputs (API & Forms).                                        |
| **🧹 Sanitization**   | HTML cleanup via `DOMPurify` to prevent XSS.                                        |
| **⛓️ HTTP Headers**   | Hardened configuration (HSTS, CSP, X-Frame-Options, No-Sniff).                      |
| **🕵️ Anti-Snooping**  | Blocking console, `localStorage`, and dev tools access in production.               |

---

## 💻 Admin Interface Guide

An interface designed for efficiency.

### 🏠 Main Dashboard

Overview of your activity, quick links to key sections, and visit statistics (via Vercel Analytics).

### 📝 Project Editing

Intuitive forms to describe your achievements:

- **Basic Info**: Title, subtitle, dates.
- **Rich Content**: Detailed description of the mission.
- **Tech Stack**: Automatic icon suggestion.
- **Media**: Image gallery with automatic resizing.

### 📍 Location

- **Autocomplete**: Easy address entry (Geo API).
- **Validation**: Automatic formatting.

---

## 🛠 Tech Stack

A modern, performant, and maintainable architecture.

### 🎨 Frontend

| Tech              | Badge                                                                                                         | Description                    |
| :---------------- | :------------------------------------------------------------------------------------------------------------ | :----------------------------- |
| **Next.js 14**    | ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)                         | App Router & Server Components |
| **TypeScript**    | ![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white) | Strict typing for robustness   |
| **Tailwind CSS**  | ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Utility-first and fast styling |
| **Framer Motion** | ![Framer](https://img.shields.io/badge/Framer-0055FF?style=flat-square&logo=framer&logoColor=white)           | Smooth animations              |
| **TipTap**        | ![TipTap](https://img.shields.io/badge/TipTap-black?style=flat-square)                                        | Rich text editor               |

### ⚙️ Backend

| Tech         | Badge                                                                                                     | Description             |
| :----------- | :-------------------------------------------------------------------------------------------------------- | :---------------------- |
| **Node.js**  | ![Node](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)     | JavaScript Runtime      |
| **MongoDB**  | ![Mongo](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)      | Flexible NoSQL Database |
| **Mongoose** | ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white) | ODM for MongoDB         |

### 🔒 Security & Tools

| Tech         | Badge                                                                                                  | Usage                |
| :----------- | :----------------------------------------------------------------------------------------------------- | :------------------- |
| **NextAuth** | ![Auth](https://img.shields.io/badge/NextAuth-purple?style=flat-square&logo=nextdotjs&logoColor=white) | Session Management   |
| **Zod**      | ![Zod](https://img.shields.io/badge/Zod-3068B7?style=flat-square&logo=zod&logoColor=white)             | Data Validation      |
| **Resend**   | ![Resend](https://img.shields.io/badge/Resend-black?style=flat-square&logo=resend&logoColor=white)     | Transactional Emails |

---

## 📁 Project Structure

```bash
portfolio-admin/
├── src/
│   ├── components/      # 🧱 Reusable Components
│   │   ├── admin/       # UI Administration
│   │   ├── modals/      # CV, Projects...
│   │   └── ui/          # Buttons, Inputs, Cards...
│   ├── pages/
│   │   ├── api/         # ⚡ API Endpoints (Backend)
│   │   ├── admin/       # 🔐 Admin Pages
│   │   └── index.tsx    # 🏠 Public Homepage
│   ├── styles/          # 🎨 Global CSS & Tailwind
│   ├── lib/             # 🛠 Utilities (DB, Auth...)
│   └── models/          # 💾 Mongoose Schemas
├── public/              # 🖼 Images, Favicons...
└── ...
```

---

## 🌐 API Routes

Brief documentation of available endpoints.

| Method   | Endpoint             | Description       | Access    |
| :------- | :------------------- | :---------------- | :-------- |
| `GET`    | `/api/projects`      | List all projects | Public    |
| `POST`   | `/api/projects`      | Create a project  | **Admin** |
| `PUT`    | `/api/projects/[id]` | Update a project  | **Admin** |
| `DELETE` | `/api/projects/[id]` | Delete a project  | **Admin** |
| `GET`    | `/api/homepage`      | Homepage data     | Public    |
| `POST`   | `/api/auth/send-2fa` | Send login code   | Public    |

---

## 📥 Complete Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas Account (Free)
- GitHub Account (for OAuth)

### 1️⃣ Clone the project

```bash
git clone https://github.com/mehmetsalihkuscu/portfolio-admin.git
cd portfolio-admin
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create `.env.local` and configure:

```env
# 📦 Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/portfolio

# 🔐 Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_string
# GitHub OAuth
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret

# 📧 Emails (2FA)
RESEND_API_KEY=re_123...
RESEND_EMAIL=onboarding@resend.dev

# 👤 Admin
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your_password
```

### 4️⃣ Run locally

```bash
npm run dev
```

---

## 🔧 Troubleshooting (FAQ)

<details>
<summary><strong>🔴 MongoDB Connection Error?</strong></summary>
<br>
Check that:
1. Your IP is authorized in MongoDB Atlas (Network Access).
2. The URI in `.env.local` is correct and in quotes if necessary.
3. The username/password does not contain unescaped special characters.
</details>

<details>
<summary><strong>🔑 GitHub Authentication Error?</strong></summary>
<br>
Check that:
1. The callback URL in GitHub Apps is `http://localhost:3000/api/auth/callback/github`.
2. The Client ID and Secret are correct.
</details>

<details>
<summary><strong>✉️ 2FA Emails not arriving?</strong></summary>
<br>
1. Check your server logs to see if Resend returns an error.
2. Ensure you have verified the sending domain if you are in production.
3. In test mode, you can only send to your Resend account email.
</details>

---

## 🤝 Contribution

Contributions are welcome!

1.  **Fork** the project
2.  Create your branch (`git checkout -b feature/SuperFeature`)
3.  Commit your changes (`git commit -m '✨ Add SuperFeature'`)
4.  Push (`git push origin feature/SuperFeature`)
5.  Open a **Pull Request**

---

## 📄 License

Distributed under the **MIT** license. See `LICENSE` for more information.

---

<div align="center">
  
  **Made with ❤️ by [Mehmet Salih Kuscu](https://github.com/mehmetsalihkuscu)**
  
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mehmetsalihkuscu)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/mehmetsalihkuscu)
  [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contact@mehmetsalihk.fr)

</div>
