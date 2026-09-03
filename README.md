# 🧭 Voyager — Next-Generation Glassmorphic Travel Explorer

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://voyager-cyan.vercel.app)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![OpenWeather](https://img.shields.io/badge/OpenWeather-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white)](https://openweathermap.org/)
[![Pexels](https://img.shields.io/badge/Pexels_API-05A081?style=for-the-badge&logo=pexels&logoColor=white)](https://www.pexels.com/)

> **Voyager** is an intelligent, design-led global travel platform. It seamlessly merges state-of-the-art glassmorphism aesthetics with real-time meteorological intelligence, dual-mode location discovery, dynamic photography, and conversational AI trip planning.

🔗 **Live Production URL**: [https://voyager-cyan.vercel.app](https://voyager-cyan.vercel.app)  
📂 **GitHub Repository**: [https://github.com/sujithkumar09042005-a11y/Voyager](https://github.com/sujithkumar09042005-a11y/Voyager)

---

## 🌟 Platform Overview & Key Capabilities

Voyager was conceived to rethink modern digital travel discovery with tactile depth, intelligent automation, and fluid responsiveness:

| Feature | Description |
|---|---|
| **🎥 Cinematic Landing Experience** | Immersive full-viewport looping video hero (`Hero_Video.mp4`), glassmorphic instant search capsule, live GPS distance trigger, and featured destination rail. |
| **🌍 Worldwide Destination Directory** | **34 hand-curated destinations** spanning all 7 continents with continent filters, atmosphere vibes matrix, and daily budget controls in Indian Rupees (`₹` INR). |
| **🏛️ Must-Visit Landmarks & Places** | Famous places for each destination with category tags, descriptions, recommended visit durations, verified Pexels photography, and interactive focus-trapped detail modals. |
| **📍 Dual-Mode Location Engine** | **Dual Geo Intelligence**: (1) Live device GPS calculating geodesic distance in kilometers using the Haversine formula; (2) Instant city search powered by OpenWeather Geocoding so users can explore proximity from any starting city on Earth. |
| **☀️ Live Meteorological Intelligence** | Real-time OpenWeather integration displaying temperature in °C, animated condition badges, feels-like readings, humidity, wind speed, visibility, and interactive retry states. |
| **📸 Dynamic High-Res Photography** | High-definition destination imagery fetched dynamically via the Pexels API with verified photographer credits and curated local fallback protection. |
| **🤖 Voyager AI Travel Assistant** | Built-in conversational guide with a multi-model Google Gemini cascade, providing comprehensive travel advice, cultural etiquette, and dining estimates quoted in **₹ INR**. |
| **🗓️ Day-by-Day AI Itinerary Generator** | Interactive trip planner (`/itinerary`) that synthesizes customized day-by-day accordion timeline schedules with activity timestamps, durations, and local tips in **₹ INR**. |

---

## 🎨 Design System & Aesthetic Philosophy

### 1. Glassmorphic Architecture
- **Layered Frosted Glass**: Built with high-translucency panels (`backdrop-blur-2xl`) and specular top-edge light reflections (`inset 0 1px 1px 0 rgba(255,255,255,0.45)`).
- **GPU Hardware-Accelerated Ambient Mesh**: Fluid radial gradient backdrop animating on GPU composites (`translate3d`), guaranteeing stutter-free 60fps scrolling.
- **Glass Command Dock (`.glass-dock`)**: Unified floating control center housing search inputs, budget toggles, and filter ribbons.

### 2. Dual-Mode Curated Themes
- **Light Theme**: Soft warm Buttermilk (`#fff2bd`) and vibrant Mid Blue (`#285ccc`) over an ivory base (`#faf7ee`) with high-contrast deep navy typography (`#061128`).
- **Dark Theme**: Deep cosmic obsidian (`#060a14`) paired with electric sapphire (`#3b82f6`) and moonlight champagne gold (`#fde047`).

### 3. Typography & Micro-Interactions
- **Display Headlines**: Styled in **Outfit** with tightened tracking (`-0.025em`) for an editorial travel publication feel.
- **Body & Controls**: Styled in **Plus Jakarta Sans** for clean legibility across small handheld viewports.
- **Pure Vector Iconography**: Sleek Lucide React vector icons replacing cartoon emojis for a unified, modern aesthetic.
- **Fluid Custom Cursor**: Dual-element magnetic glass cursor with active hover expansion (native touch restored automatically on mobile and tablets).

### 4. 100% Keyboard-Only Accessibility
- **Skip Link**: Animated "Skip to main content" pill button that slides down on the first `Tab` keypress.
- **Luminous Focus Indicators (`:focus-visible`)**: 2.5px solid accent rings with 3.5px offset and radiant outer aura glow.
- **Modal Focus Trapping**: Dialogs strictly trap focus between interactive elements; pressing `Escape` dismisses overlays and restores focus to invoking trigger buttons.
- **Custom Select Navigation**: Arrow-key (`ArrowDown`/`ArrowUp`) listbox navigation with active highlight, `Enter` to select, and `Escape` to close.

---

## 🛠️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Voyager Client (React 18)                │
│       Vite · TypeScript · Tailwind CSS · Framer Motion      │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        Client Direct Calls             Serverless Proxy
        (Rate-limited keys)            (Secret protection)
               │                               │
       ┌───────┴────────┐             ┌────────┴────────┐
       │                │             │                 │
┌──────▼──────┐  ┌──────▼──────┐┌─────▼───────┐  ┌──────▼───────┐
│ OpenWeather │  │   Pexels    ││  /api/chat  │  │/api/itinerary│
│ (Live Temp) │  │(Photography)││(Gemini-3.6) │  │(Gemini-3.6)  │
└─────────────┘  └─────────────┘└─────────────┘  └──────────────┘
```

| Service / Tool | Implementation | Purpose |
|---|---|---|
| **React 18** | Single Page Application (SPA) | Component-driven UI with fluid state management |
| **TypeScript 5** | Strict Type System | End-to-end type safety across API responses and UI models |
| **Tailwind CSS** | Custom Tokens & Utility Architecture | Rapid, responsive styling adhering to glassmorphic tokens |
| **Framer Motion** | Declarative Animation Engine | Smooth page transitions, modal spring physics, and list animations |
| **OpenWeatherMap** | REST API (`/weather` & `/geo`) | Live weather metrics and geodesic city search |
| **Pexels API** | REST API (`/v1/search`) | Dynamic travel and landmark photography |
| **Google Gemini AI** | Multi-Model Cascade (`gemini-flash`) | Conversational travel guidance and custom day-by-day itineraries |
| **Vercel Serverless** | Node.js Functions (`api/*.ts`) | Serverless endpoints ensuring AI keys remain secure |

---

## 🛡️ Resilience & Designed Failure Modes

- **Denied Geolocation**: Surfaces an amber glass notice with helpful resolution tips and immediately activates the manual city search bar.
- **Zero Search Results**: Features an animated compass empty state with a 1-click **"Reset All Filters"** action.
- **Weather API Failure**: Renders a dedicated alert card with error details and an active **"Retry"** button.
- **Pexels Rate Limits / Offline**: Automatically catches image errors and renders curated, high-resolution local fallback photography without layout shift.
- **AI Quota Cascade**: Multi-model cascade (`gemini-flash-latest`, `gemini-flash-lite-latest`, `gemini-3.5-flash-lite`) automatically switches models in milliseconds if one is busy or rate-limited.

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher

### 2. Clone Repository
```bash
git clone https://github.com/sujithkumar09042005-a11y/Voyager.git
cd Voyager
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Client-Side Keys (Vite)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_PEXELS_API_KEY=your_pexels_api_key

# Server-Side Key (Kept safe from client bundle)
GEMINI_API_KEY=your_gemini_api_key

# Runtime Mode
NODE_ENV=development
```

> **API Key Resources:**
> - OpenWeather: [openweathermap.org/api](https://openweathermap.org/api)
> - Pexels: [pexels.com/api](https://www.pexels.com/api/)
> - Google Gemini: [aistudio.google.com](https://aistudio.google.com)

### 5. Run Development Server
```bash
npm run dev
```
Starts two concurrent processes:
- **Vite Client App**: `http://localhost:5173/`
- **Express API Proxy**: `http://localhost:3001/`

### 6. Build for Production
```bash
npm run build
```
Validates TypeScript types (`tsc -b`) and produces an optimized production bundle in `dist/`.

---

## ☁️ Production Deployment

Voyager is pre-configured for zero-configuration deployment on **Vercel**:
1. Connect the GitHub repository in [Vercel](https://vercel.com/new).
2. Set the 4 Environment Variables in the project settings:
   - `VITE_OPENWEATHER_API_KEY`
   - `VITE_PEXELS_API_KEY`
   - `GEMINI_API_KEY`
   - `NODE_ENV` = `production`
3. Click **Deploy**. Vercel will build the frontend and route the serverless functions as defined in [`vercel.json`](./vercel.json).

---

## 📁 Project Structure

```
voyager/
├── api/                        # Vercel Serverless Functions
│   ├── chat.ts                 # Gemini AI destination chatbot with multi-model fallback
│   └── itinerary.ts            # Gemini AI structured trip planner
├── public/                     # Static production assets
│   ├── Hero_Video.mp4          # High-definition looping hero video
│   ├── favicon.ico             # Multi-resolution browser tab icon
│   ├── favicon.png             # 128x128 circular PNG tab icon
│   ├── favicon-32x32.png       # 32x32 circular PNG tab icon
│   ├── favicon.svg             # Self-contained circular SVG tab icon
│   └── icon.png                # Brand logo asset
├── server/                     # Local Development Proxy
│   └── index.cjs               # Express server mirroring Vercel serverless functions
├── src/
│   ├── components/             # Reusable UI & Layout Components
│   │   ├── ui/                 # Button, Badge, CustomSelect, CustomCursor, Modal, Skeleton
│   │   ├── Footer.tsx          # 5-column luxury glassmorphic footer
│   │   ├── Navbar.tsx          # Frosted glass header with mobile navigation drawer
│   │   ├── LocationDetectorModal.tsx # Dual-mode GPS & city geocoding modal
│   │   └── WeatherWidget.tsx   # Live OpenWeather display with error states
│   ├── data/
│   │   └── destinations.json   # 34 Curated global destinations & places
│   ├── features/
│   │   ├── hero/               # HeroSection with looping video & instant search
│   │   ├── explorer/           # ExplorerPage & DestinationCard
│   │   ├── destination-detail/ # DestinationDetailPage & Must-Visit places
│   │   ├── chatbot/            # Floating Voyager AI conversational drawer
│   │   └── itinerary/          # ItineraryPage with timeline accordion
│   ├── hooks/                  # TanStack Query & browser hooks
│   ├── lib/                    # API clients (weather, images, gemini)
│   ├── styles/
│   │   └── tokens.css          # Design system tokens & glassmorphism classes
│   └── utils/
│       └── formatters.ts       # Title case and vibe tag formatters
├── .gitignore                  # Secret protection (ignores .env)
├── package.json                # Project dependencies & build scripts
├── tailwind.config.js          # Custom theme tokens & keyframes
├── vercel.json                 # SPA rewrites & serverless API configuration
└── vite.config.ts              # Vite configuration with React plugin
```

---

## 📄 License & Credits

- **License**: MIT License © 2026 Voyager.
- **Photography**: Dynamically sourced via [Pexels API](https://www.pexels.com) with photographer attribution.
- **Weather Data**: Powered by [OpenWeatherMap](https://openweathermap.org/).
- **AI Intelligence**: Powered by [Google Gemini AI](https://deepmind.google/technologies/gemini/).
