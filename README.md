# Servisca - Deployment Guide

Next.js 16 application for connecting customers with handyman service providers.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 9.x or higher

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd servisca

# 2. Install dependencies
npm install

# 3. Create environment file (see Environment Variables below)

# 4. Run development server
npm run dev
```

---

## 🔐 Environment Variables

Create `.env.local` in root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://api.servisca.co.uk
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Configuration (optional - defaults are set in config)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB36Ya_Da33NGM_p6IkjXuyKELhe2Nyi_g
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=servisca-fdeaa.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=servisca-fdeaa
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=servisca-fdeaa.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=160380363975
NEXT_PUBLIC_FIREBASE_APP_ID=1:160380363975:web:1c5ffb93f39da3b7570ae2
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XF0ZY4KEES
```

**Important**: API base URL is currently hardcoded in service files. Update these for production:
- `src/features/auth/services/auth.service.ts`
- `src/features/services/services/services.service.ts`
- `src/features/taskers/services/taskers.service.ts`

---

## 📦 Build & Deploy

```bash
npm run build    # Build for production
npm start        # Start production server
npm run dev      # Development server
npm run lint     # Code linting
```

---

## 🌐 API Configuration

**Base URL**: `http://api.servisca.co.uk`

**Endpoints**:
- `POST /auth/register` - User registration
- `POST /auth/verify_Password_token` - Email verification
- `POST /auth/login` - User login
- `GET /services/categories` - Service categories
- `GET /provider/home` - Homepage providers

**Service Files**:
- `src/features/auth/services/auth.service.ts`
- `src/features/services/services/services.service.ts`
- `src/features/taskers/services/taskers.service.ts`

---

## 🏗 Project Structure

```
src/
├── app/                    # Next.js routes (required)
│   ├── (auth)/            # Login, Signup pages
│   ├── [locale]/          # Homepage (en/ar)
│   ├── customer/          # Customer portal
│   ├── provider/           # Provider portal
│   └── layout.tsx        # Root layout
│
├── features/              # Business logic
│   ├── auth/             # Authentication (hooks, services, types)
│   ├── taskers/          # Providers data
│   └── services/         # Service categories
│
├── core/                 # Core utilities (providers, utils)
├── lib/                  # Library configurations (Firebase, API client)
├── shared/               # Shared components (Header, Footer)
└── i18n/                # Translations (en.json, ar.json)
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables in dashboard
3. Deploy automatically on push

```bash
npm i -g vercel
vercel
```

### Other Platforms

1. Build: `npm run build`
2. Start: `npm start`
3. Ensure Node.js 20+ is available

---

## ⚙️ Production Checklist

- [ ] Environment variables set in deployment platform
- [ ] API base URL updated in service files (or use env vars)
- [ ] `next.config.ts` verified (image domains, i18n)
- [ ] Build successful (`npm run build`)
- [ ] Production server tested (`npm start`)

---

## 🔧 Key Configuration Files

- `next.config.ts` - Next.js config
- `package.json` - Dependencies & scripts
- `tsconfig.json` - TypeScript config
- `.env.local` - Environment variables (create this)

---

## 🐛 Common Issues

**API Connection Errors**
- Verify API base URL in service files
- Check network connectivity

**Build Errors**
- Run `npm run lint`
- Ensure dependencies installed: `npm install`

**Environment Variables Not Loading**
- File must be `.env.local` in root
- Restart dev server after changes

---

## 📝 Tech Stack

- Next.js 16.0.1, React 19.2.0, TypeScript 5
- Material-UI 7.3.5, Tailwind CSS 4
- React Query 5.90.6, Zustand 5.0.8
- Axios 1.13.1, next-intl 4.4.0
- Firebase (Analytics, Auth, etc.)

---

**Version**: 0.1.0  
**Last Updated**: December 2024
