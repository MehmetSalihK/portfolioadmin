# Portfolio Admin

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC.svg)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
</div>

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Admin Interface](#-admin-interface)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [API Routes](#-api-routes)
- [Project Status](#-project-status)
- [Planned Improvements](#-planned-improvements)
- [Troubleshooting](#-troubleshooting)

## 🎯 About

Portfolio Admin is a "no-code" solution for managing your online portfolio. No more need to modify source code to update your site! Thanks to an intuitive admin interface, you can modify all your portfolio content with just a few clicks.

## ✨ Features

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
  - **Interactive modal display**
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
  - **Interactive CV modal**: View CV directly on homepage
  - **Integrated preview**: PDF display in iframe without leaving page
  - **Quick actions**: Buttons to download or open in new tab
  - **Responsive design**: Interface adapted to all screens
  - **Optimized user experience**: Smooth animations and intuitive closing

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
- Image upload for projects
- Automatic resizing
- Image optimization
- Gallery management

### 5. CV Display
- **Interactive modal**: CV displays in elegant modal
- **Direct visualization**: PDF preview without leaving homepage
- **User actions**: Download and open in new tab
- **Modern interface**: Design consistent with site theme
- **Accessibility**: Keyboard navigation and intuitive closing

### 6. Geographic Position Management
- **Smart auto-completion**: Real-time French address suggestions
- **Intuitive interface**: Easy input with contextual suggestions
- **Automatic validation**: Standardized address format
- **Dynamic display**: Position updated instantly on site
- **Geolocation**: Support for French postal codes and cities

### 7. Analytics and Tracking
- **Vercel Analytics**: Automatic visitor and page view tracking
- **Real-time data**: Instant traffic statistics
- **Privacy respect**: Analytics without third-party cookies
- **Optimized performance**: Minimal impact on site performance
- **Transparent integration**: Automatic configuration without intervention

All these modifications are done directly from the admin interface, without needing to touch the code!

## 🛠 Technologies

The project uses the following technologies:

- **Frontend**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - TipTap Editor

- **Backend**
  - MongoDB
  - NextAuth.js
  - Next.js API Routes

- **Analytics**
  - Vercel Analytics

- **Tools**
  - ESLint
  - Prettier
  - Git

## 📥 Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/portfolio-admin.git
cd portfolio-admin
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```

4. Start development server
```bash
npm run dev
# or
yarn dev
```

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
│   ├── components/      # Reusable components
│   │   ├── ProjectCard.tsx        # Project card with modal
│   │   ├── EnhancedProjectCard.tsx # Enhanced version with modal
│   │   ├── modals/
│   │   │   └── CVModal.tsx        # CV display modal
│   │   └── ...                    # Other components
│   ├── pages/          # Pages and API routes
│   ├── styles/         # Global styles
│   ├── lib/           # Utilities and configurations
│   └── models/        # MongoDB models
├── public/            # Static assets
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
- **Advanced project display**
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

1. **MongoDB connection error**
```bash
# Check that your MongoDB URI is correct
# Make sure your IP is authorized in MongoDB Atlas
```

2. **Authentication error**
```bash
# Check your GitHub environment variables
```