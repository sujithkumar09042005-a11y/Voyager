# 🧭 Voyager — Next-Gen Glassmorphic Travel Explorer

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://voyager-travel.vercel.app)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![OpenWeather](https://img.shields.io/badge/OpenWeather-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white)](https://openweathermap.org/)
[![Pexels](https://img.shields.io/badge/Pexels_API-05A081?style=for-the-badge&logo=pexels&logoColor=white)](https://www.pexels.com/)

> **Front-End Developer Assignment Submission for `designesthetics.`**  
> A design-led global travel platform combining real-time meteorological data, dynamic photography, dual-mode location intelligence, and AI-powered trip planning.

🔗 **Live Application URL**: [https://voyager-travel.vercel.app](https://voyager-travel.vercel.app)  
📂 **Public GitHub Repository**: [https://github.com/sujithkumar09042005-a11y/Voyager](https://github.com/sujithkumar09042005-a11y/Voyager)

---

## 📸 Visual Showcase

| Landing Experience (Looping Hero Video) | Destination Explorer (Modern Filter Dock) |
|:---:|:---:|
| ![Hero Section](https://raw.githubusercontent.com/sujithkumar09042005-a11y/Voyager/main/src/assets/hero.png) | ![Explore Page](https://raw.githubusercontent.com/sujithkumar09042005-a11y/Voyager/main/public/favicon.png) |

| Live Weather & Must-Visit Places | Day-by-Day AI Itinerary Planner |
|:---:|:---:|
| Real-time °C weather with Pexels photography & modals | Structured timeline accordion with ₹ INR pricing tips |

---

## 📋 Assignment Requirements & Compliance Matrix

Every item specified in the **Front-End Developer Assignment Brief** has been implemented and audited:

| # | Feature / Requirement | Implementation Details | Status |
|:---:|---|---|:---:|
| **01** | **Landing Experience** | Full-height looping high-definition background video (`Hero_Video.mp4`) with glassmorphic search bar, real-time location prompt, scroll cue, and featured destinations rail. | ✅ Complete |
| **02** | **Destination Explorer** | **34 global destinations** across 7 continents, real-time search, continental segment controls, collapsible Vibe & Atmosphere matrix, and INR budget quick-filters. | ✅ Complete |
| **03** | **Famous Places** | Notable places to visit with verified Pexels photography, category badges, descriptions, recommended visit duration badges, and interactive focus-trapped detail modals. | ✅ Complete |
| **04** | **Location Awareness** | **Dual-Mode Engine**: (1) Live device GPS calculating geodesic distance in kilometers, (2) Direct city search (e.g., London, Mumbai, Tokyo) powered by OpenWeather Geocoding so users can choose any location even if GPS is denied. | ✅ Complete |
| **05** | **Real-Time Weather** | Live OpenWeather API integration displaying temperature in °C, animated condition icons, feels-like metrics, humidity, wind speed, visibility, and retry buttons. | ✅ Complete |
| **06** | **Images (Dynamic API)** | Destination and place photography fetched dynamically via Pexels API with search query optimization, photographer attribution links, and curated local fallbacks. | ✅ Complete |
| **07** | **AI Travel Chatbot** | Conversational travel assistant powered by Google Gemini (`gemini-3.5-flash`), providing structured markdown answers with authentic dining tips and ₹ INR price quotes. | ✅ Complete |
| **08** | **Itinerary Planning** | Form-based AI itinerary generator (`/itinerary`) producing interactive day-by-day accordion timeline plans with activity timestamps, durations, and dining tips in INR. | ✅ Complete |

---

## 🎨 Design System & Aesthetics

### 1. Glassmorphism Architecture
- **Multi-Layered Depth**: Translucent frosted panels (`backdrop-blur-2xl`) combined with specular top edge light reflections (`inset 0 1px 1px 0 rgba(255,255,255,0.45)`).
- **GPU Hardware-Accelerated Ambient Mesh**: Fluid radial gradient background animating via 3D transforms (`translate3d`), guaranteeing 60fps zero-lag scrolling.
- **Glass Command Dock (`.glass-dock`)**: Unified floating control center for searching, filtering, and tabbed exploration.

### 2. Curated Dual Themes
- **Light Theme**: Soft warm Buttermilk (`#fff2bd`) and vibrant Mid Blue (`#285ccc`) over a creamy buttermilk ivory base (`#faf7ee`) with high-contrast deep navy text (`#061128`).
- **Dark Theme**: Deep cosmic obsidian (`#060a14`) paired with electric sapphire (`#3b82f6`) and moonlight champagne gold (`#fde047`).

### 3. Typography & Micro-Interactions
- **Display Headlines**: Styled in **Outfit** with tightened tracking (`-0.025em`) for an editorial travel publication feel.
- **Body & Controls**: Styled in **Plus Jakarta Sans** for clean legibility across small handheld viewports.
- **Vector Iconography**: Pure Lucide React vector icons replacing cartoon emojis for a cohesive, modern visual language.
- **Dual-Element Custom Cursor**: Custom fluid magnetic glass cursor with active hover expansion (native touch restored on mobile).

### 4. 100% Keyboard-Only Accessibility
- **Skip Link**: Animated "Skip to main content" pill button that slides down on the first `Tab` press.
- **High-Visibility Focus Rings (`:focus-visible`)**: 2.5px solid accent rings with 3.5px offset and radiant glow.
- **Focus Trapping**: Modals trap focus between interactive elements; pressing `Escape` dismisses overlays and restores focus to invoking trigger.
- **Custom Select Navigation**: Arrow-key (`ArrowDown`/`ArrowUp`) listbox navigation, `Enter` to select, `Escape` to close.

---

## 🛠️ Tech Stack & API Architecture

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
│ (Live Temp) │  │(Photography)││(Gemini-3.5) │  │(Gemini-3.5)  │
└─────────────┘  └─────────────┘└─────────────┘  └──────────────┘
```

| Service | API Endpoint / SDK | Purpose | Security |
|---|---|---|---|
| **OpenWeatherMap** | `/data/2.5/weather` & `/geo/1.0` | Live weather metrics & city geocoding | Client-side key |
| **Pexels API** | `/v1/search` | Dynamic destination & place photos | Client-side key |
| **Google Gemini** | `gemini-3.5-flash` (`@google/generative-ai`) | Chatbot assistant & structured day-by-day itineraries | **Server-side only** (Vercel Serverless / Express Proxy) |

---

## 🛡️ Designed Failure Modes (Graceful Degradation)

- **Denied Geolocation**: Surfaces an amber glass notice with helpful resolution tips and immediately activates the manual city search bar.
- **Zero Search Results**: Features an animated compass empty state with a 1-click **"Reset All Filters"** action.
- **Weather API Failure**: Renders a dedicated alert card with error details and an active **"Retry"** button.
- **Pexels Rate Limits / Offline**: Automatically catches image errors and renders curated, high-resolution local fallback photography without layout shift.
- **Gemini AI Disconnects**: Chat and itinerary builder surface formatted error banners with dismiss and retry actions.

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

> **API Key Sources:**
> - OpenWeather: [openweathermap.org/api](https://openweathermap.org/api) (Free Tier)
> - Pexels: [pexels.com/api](https://www.pexels.com/api/) (Free Tier)
> - Google Gemini: [aistudio.google.com](https://aistudio.google.com) (Free Tier)

### 5. Run Development Server
```bash
npm run dev
```
This runs two concurrent processes:
- **Vite Client App**: `http://localhost:5173/`
- **Express API Proxy**: `http://localhost:3001/`

### 6. Verify Production Bundle
```bash
npm run build
```
Compiles TypeScript types (`tsc -b`) and bundles production assets via Vite.

---

## ☁️ Vercel Deployment Guide

1. Import the repository in [Vercel](https://vercel.com/new).
2. Framework Preset: **Vite** (Root Directory: `./`).
3. Set the following **Environment Variables** in Vercel project settings:
   - `VITE_OPENWEATHER_API_KEY`
   - `VITE_PEXELS_API_KEY`
   - `GEMINI_API_KEY`
   - `NODE_ENV` = `production`
4. Click **Deploy**. Vercel will automatically build the client bundle and wire the serverless API routes defined in `vercel.json`.

---

## 📁 Repository Structure

```
voyager/
├── api/                        # Vercel Serverless Functions
│   ├── chat.ts                 # Gemini AI destination chatbot
│   └── itinerary.ts            # Gemini AI structured trip planner
├── public/                     # Static production assets
│   ├── Hero_Video.mp4          # High-definition looping hero video
│   ├── favicon.ico             # Multi-resolution browser tab icon
│   ├── favicon.png             # 128x128 circular PNG tab icon
│   ├── favicon-32x32.png       # 32x32 circular PNG tab icon
│   ├── favicon.svg             # Self-contained circular SVG tab icon
│   └── icon.png                # Original brand icon asset
├── server/                     # Local Development Proxy
│   └── index.cjs               # Express server mirroring Vercel functions
├── src/
│   ├── components/             # Reusable UI & Layout Components
│   │   ├── ui/                 # Button, Badge, CustomSelect, CustomCursor, Modal, Skeleton
│   │   ├── Footer.tsx          # 5-column luxury glassmorphic footer
│   │   ├── Navbar.tsx          # Hysteresis frosted header with mobile drawer
│   │   ├── LocationDetectorModal.tsx # Dual-mode GPS & city geocoding modal
│   │   └── WeatherWidget.tsx   # Live OpenWeather display with error states
│   ├── data/
│   │   └── destinations.json   # 34 Curated global destinations & places
│   ├── features/
│   │   ├── hero/               # HeroSection with looping video & search
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
├── .gitignore                  # Strict secret protection (ignores .env)
├── package.json                # Project dependencies & build scripts
├── tailwind.config.js          # Custom theme tokens & keyframes
├── vercel.json                 # SPA rewrites & serverless API configuration
└── vite.config.ts              # Vite configuration with React plugin
```

---

## 📄 License & Attribution

- **License**: MIT License © 2026 Voyager Travel Inc.
- **Photography Attribution**: All photography dynamically fetched via the [Pexels API](https://www.pexels.com) with embedded photographer credits.
- **Meteorological Data**: Live weather intelligence provided by [OpenWeatherMap](https://openweathermap.org/).
- **AI Intelligence**: Conversational guidance and itineraries synthesized by [Google Gemini AI](https://deepmind.google/technologies/gemini/).
