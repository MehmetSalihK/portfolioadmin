# 🎨 Portfolio Admin Dashboard

<div align="center">
  
  **🌍 Languages / Langues / Diller:**
  [🇫🇷 Français](README.md) | [🇬🇧 English](README_EN.md) | [🇹🇷 Türkçe](README_TR.md)
  
</div>

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC.svg)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000.svg?logo=vercel)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  
</div>

<div align="center">
  <p><em>A modern no-code solution to manage your professional portfolio</em></p>
</div>

## 📋 Table of Contents

- [🎯 About](#-about)
- [🚀 Online Demo](#-online-demo)
- [✨ Key Features](#-key-features)
- [💻 Admin Interface](#-admin-interface)
- [🛠 Technologies Used](#-technologies-used)
- [📥 Quick Installation](#-quick-installation)
- [⚙️ Configuration](#%EF%B8%8F-configuration)
- [📁 Project Structure](#-project-structure)
- [🌐 API Routes](#-api-routes)
- [🚧 Project Status](#-project-status)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Contribution](#-contribution)
- [📄 License](#-license)

## 🎯 About

Portfolio Admin is a modern and intuitive **no-code** solution for managing your professional portfolio online. No more manual source code edits! Thanks to an elegant and powerful admin interface, you can:

- ✅ **Modify content** of your portfolio in real-time
- ✅ **Manage projects** with an interactive modal system
- ✅ **Customize your CV** with integrated modal display
- ✅ **Optimize presence** with integrated analytics
- ✅ **Maintain your site** with a professional maintenance mode

> 🎯 **Goal**: Allow developers to focus on their code rather than maintaining their portfolio content

## 🚀 Online Demo

🌐 **Demo Site**: [View Demo](https://your-demo.vercel.app)

📱 **Admin Interface**: [Admin Dashboard](https://your-demo.vercel.app/admin)

> 💡 **Tip**: Use the demo credentials to test the admin interface

## ✨ Key Features

- 🎨 **No-Code Management**

  - Content modification without touching code
  - Intuitive user interface
  - Real-time updates
  - Change preview

- 🔐 **Secure Authentication**

  - NextAuth.js for session management
  - Admin route protection
  - GitHub authentication

- 📊 **Project Management**

  - Add/Edit/Delete projects without coding
  - Image upload with preview
  - Drag & drop organization (coming soon)
  - Category management
  - **Interactive Modal Display**
    - Modals to view complete details
    - Background interaction prevention
    - Intuitive closing (outside click or X button)
    - Smooth animations and responsive design

- 📝 **Content Management**

  - Intuitive rich text editor
  - Advanced formatting (bold, italic, colors...)
  - Homepage section editing
  - Social links customization

- 📄 **CV Display**
  - **Interactive CV Modal**: View CV directly on homepage
  - **Integrated Preview**: PDF display in iframe without leaving page
  - **Quick Actions**: Buttons to download or open in new tab
  - **Responsive Design**: Interface adapted to all screens
  - **Optimized User Experience**: Smooth animations and intuitive closing

## 💻 Admin Interface

The admin interface allows you to:

### 1. Homepage

- Edit main title
- Customize subtitle
- Edit "About" section
- Manage your social links (GitHub, LinkedIn, Twitter)

### 2. Projects

- Add new projects
- Edit existing projects
- Delete projects
- Reorganize display order

### 3. Text Formatting

Our rich text editor allows you to:

- Bold, italic, underline
- Change text color
- Create bullet lists
- Align text (left, center, right)
- Add titles and subtitles

### 4. Media Management

- Upload images for projects
- Automatic resizing
- Image optimization
- Gallery management

### 5. CV Display

- **Interactive Modal**: CV displays in an elegant modal
- **Direct Visualization**: PDF preview without leaving homepage
- **User Actions**: Download and open in new tab
- **Modern Interface**: Design consistent with site theme
- **Accessibility**: Keyboard navigation and intuitive closing

### 6. Geographic Position Management

- **Smart Auto-completion**: Real-time address suggestions
- **Intuitive Interface**: Easy input with contextual suggestions
- **Automatic Validation**: Standardized address format
- **Dynamic Display**: Position updated instantly on site
- **Geolocation**: Support for postal codes and cities

### 7. Analytics and Tracking

- **Vercel Analytics**: Automatic visitor and page view tracking
- **Real-time Data**: Instant traffic statistics
- **Privacy Respect**: Analytics without third-party cookies
- **Optimized Performance**: Minimal impact on site performance
- **Transparent Integration**: Automatic configuration without intervention

All these modifications are done directly from the admin interface, without needing to touch the code!

## 🛠 Technologies Used

<div align="center">

### 🎨 Frontend

| Technology                                                                                | Version  | Description                  |
| ----------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| ![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?logo=next.js)                | `14.0.0` | React full-stack Framework   |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?logo=typescript)         | `5.0.0`  | Static typing for JavaScript |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?logo=tailwind-css) | `3.4.0`  | Utility CSS Framework        |
| ![TipTap](https://img.shields.io/badge/TipTap-2.0.0-orange)                               | `2.0.0`  | Rich text editor             |

### 🔧 Backend & Database

| Technology                                                              | Version | Description                |
| ----------------------------------------------------------------------- | ------- | -------------------------- |
| ![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb) | `7.0`   | NoSQL Database             |
| ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.0.0-purple)   | `4.0.0` | Authentication for Next.js |
| ![Mongoose](https://img.shields.io/badge/Mongoose-8.0.0-red)            | `8.0.0` | ODM for MongoDB            |

### 📊 Analytics & Deployment

| Technology                                                                           | Description                      |
| ------------------------------------------------------------------------------------ | -------------------------------- |
| ![Vercel Analytics](https://img.shields.io/badge/Vercel_Analytics-black?logo=vercel) | Performance and visitor tracking |
| ![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel)                     | Deployment Platform              |

### 🛠 Development Tools

| Tool                                                                    | Description                  |
| ----------------------------------------------------------------------- | ---------------------------- |
| ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint)       | JavaScript/TypeScript Linter |
| ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier) | Code Formatter               |
| ![Git](https://img.shields.io/badge/Git-F05032?logo=git)                | Version Control              |

</div>

## 📥 Quick Installation

### 🚀 Installation in 5 minutes

#### 1️⃣ Clone the project

```bash
# Clone the repository
git clone https://github.com/mehmetsalihkuscu/portfolio-admin.git
cd portfolio-admin/portfolio-admin
```

#### 2️⃣ Install dependencies

```bash
# With npm (recommended)
npm install

# Or with yarn
yarn install

# Or with pnpm (faster)
pnpm install
```

#### 3️⃣ Environment Configuration

```bash
# Create configuration file
cp .env.example .env.local

# Edit environment variables
nano .env.local  # or your preferred editor
```

#### 4️⃣ Start Development Server

```bash
# Start in development mode
npm run dev

# The site will be accessible at http://localhost:3000
```

#### 5️⃣ Access Admin Interface

```bash
# Admin interface available at:
# http://localhost:3000/admin
```

### ⚡ Quick Installation with Script

```bash
# Automatic installation script
curl -fsSL https://raw.githubusercontent.com/mehmetsalihkuscu/portfolio-admin/main/install.sh | bash
```

> 💡 **Tip**: Make sure you have Node.js 18+ and npm installed on your system

## ⚙️ Configuration

Create a `.env.local` file with the following variables:

```env
# Database (MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Admin credentials
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

# GitHub OAuth
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret

# Resend API Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_EMAIL=your_resend_email
```

## 📁 Project Structure

```
portfolio-admin/
├── src/
│   ├── components/      # Reusable Components
│   │   ├── ProjectCard.tsx        # Project card with modal
│   │   ├── EnhancedProjectCard.tsx # Enhanced version with modal
│   │   ├── modals/
│   │   │   └── CVModal.tsx        # CV display modal
│   │   └── ...                    # Other components
│   ├── pages/          # Pages and API routes
│   ├── styles/         # Global styles
│   ├── lib/           # Utilities and configuration
│   └── models/        # MongoDB Models
├── public/            # Static Assets
└── ...
```

## 🌐 API Routes

### GET /api/homepage

- Retrieves homepage data

### POST /api/homepage

- Updates homepage data

### GET /api/projects

- Lists all projects

### POST /api/projects

- Creates a new project

### PUT /api/projects/[id]

- Updates an existing project

### DELETE /api/projects/[id]

- Deletes a project

## 🚧 Current Project Status

### ✅ Completed Features

- Secure authentication with GitHub
- Rich text editor for homepage
  - Text formatting (bold, italic, underline)
  - Color change
  - Text alignment
- Homepage content management
  - Title and subtitle editing
  - "About" section editing
  - Social links management
- Basic image upload
- MongoDB database structure
- **Advanced Project Display**
  - Interactive modals for complete project details
  - Styled "Read more" buttons (blue and underlined)
  - Large format image display in modals
  - Complete description with technologies and links
  - Background interaction prevention
  - Closing by outside click or close button
  - Smooth animations and responsive design
  - Dark mode support
  - Page scroll blocking when modals open

### 🔄 In Development

- Complete admin interface
  - Main dashboard with statistics
  - Intuitive navigation between sections
  - Dark/light theme
- Advanced project management
  - Drag & drop interface for reorganization
  - Project categorization
  - Tags and filters
- Enhanced media system
  - Image gallery
  - Cropping and resizing
  - Automatic optimization
- Real-time modification preview

### 📝 Planned Features

- Analytics and statistics
  - Visit tracking
  - Time spent per page
- Backup and version system
- Data export/import
- Maintenance mode
- Advanced SEO optimization
- Automated tests
- Complete API documentation

## ⚠️ Important Note

This project is currently in active development. Some features may be unstable or incomplete. Contributions and feedback are welcome!

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

```bash
# Check that your MongoDB URI is correct
# Ensure your IP is authorized in MongoDB Atlas
```

2. **Authentication Error**

```bash
# Check your GitHub environment variables
# Ensure OAuth callbacks are correctly configured
```

## 🤝 Contribution

Contributions are welcome! Here is how you can contribute:

### 🐛 Report a Bug

1. Check if the bug has not already been reported in [Issues](https://github.com/mehmetsalihkuscu/portfolio-admin/issues)
2. Create a new issue with the "Bug Report" template
3. Describe the problem in detail with reproduction steps

### ✨ Propose a Feature

1. Create an issue with the "Feature Request" template
2. Describe the desired feature and its utility
3. Wait for approval before starting development

### 🔧 Contribute Code

1. **Fork** the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### 📝 Contribution Guidelines

- Follow existing code conventions
- Add tests for new features
- Update documentation if necessary
- Use clear and descriptive commit messages

### 🏆 Contributors

Thanks to all contributors who participated in this project!

<a href="https://github.com/mehmetsalihkuscu/portfolio-admin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mehmetsalihkuscu/portfolio-admin" />
</a>

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

```
MIT License

Copyright (c) 2024 Mehmet Salih Kuscu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <p><strong>Developed with ❤️ by <a href="https://github.com/mehmetsalihkuscu">Mehmet Salih Kuscu</a></strong></p>
  <p><em>For efficient no-code portfolio management</em></p>
  
  [![GitHub](https://img.shields.io/badge/GitHub-mehmetsalihkuscu-black?logo=github)](https://github.com/mehmetsalihkuscu)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Mehmet%20Salih%20Kuscu-blue?logo=linkedin)](https://linkedin.com/in/mehmetsalihkuscu)
  [![Email](https://img.shields.io/badge/Email-contact@mehmetsalihk.fr-red?logo=gmail)](mailto:contact@mehmetsalihk.fr)
</div>
