# 🧭 Voyager — Intelligent Glassmorphic Travel Explorer

A design-led, high-aesthetic global travel discovery platform built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Google Gemini AI**. Explore **34 extraordinary global destinations across 7 continents** with real-time GPS location detection, live OpenWeather intelligence, dynamic verified Pexels photography, and custom AI-powered day-by-day itineraries with Indian Rupee (₹ INR) budget estimates.

---

## 🌟 Visual Identity & Design System

- **Glassmorphism Architecture**: Multi-layered frosted glass panels (`backdrop-blur-2xl`), specular edge light reflections (`inset 0 1px 1px 0 rgba(255,255,255,0.45)`), dynamic radial gradient meshes, and glowing hover auras.
- **Harmonious Dual Themes**:
  - **Light Theme**: Soft warm Buttermilk (`#fff2bd`) and vibrant Mid Blue (`#285ccc`) over a creamy buttermilk ivory base (`#faf7ee`) with high-contrast deep navy text (`#061128`).
  - **Dark Theme**: Deep cosmic obsidian (`#060a14`) paired with electric sapphire (`#3b82f6`) and moonlight champagne gold (`#fde047`).
- **Pristine Typography**: Styled in **Outfit** (editorial headlines with negative tracking `-0.025em`) and **Plus Jakarta Sans** (clean, geometric body text and UI controls).
- **Dual-Element Custom Cursor**: Custom fluid magnetic glass cursor with active hover expansion; default OS cursor hidden on fine pointer devices.
- **Circular Browser Favicon**: Custom circular SVG and canvas-clipped favicon with gradient accent border.

---

## 📋 PDF Assignment Requirements Matrix

| # | Requirement | Implementation in Voyager | Status |
|:---:|---|---|:---:|
| **01** | **Landing Experience** | Looping high-definition video hero (`Hero_Video.mp4`) with glassmorphic search bar, real-time location prompt, scroll cue, and featured destinations rail. | ✅ Complete |
| **02** | **Destination Explorer** | Full catalog of **34 curated destinations** across 7 continents, real-time search, continental segment controls, collapsible Vibe & Atmosphere matrix, and INR budget quick-filters. | ✅ Complete |
| **03** | **Famous Places** | Per-destination Must-Visit Places cards with verified Pexels photos, category badges, descriptions, recommended visit times, and interactive detail modals. | ✅ Complete |
| **04** | **Location Awareness** | Dual-mode location engine: (1) One-click device GPS geolocation calculating geodesic distance in kilometers, (2) Direct city search powered by OpenWeather Geocoding so users can choose any starting city even if GPS is denied. | ✅ Complete |
| **05** | **Real-Time Weather** | OpenWeather API integration displaying live Celsius temperature, weather condition icons, feels-like metrics, humidity, wind speed, and visibility with error retry. | ✅ Complete |
| **06** | **Dynamic Photography** | Live Pexels API image fetching with query optimization, photographer attribution links, and resilient curated local fallbacks. | ✅ Complete |
| **07** | **AI Travel Chatbot** | Voyager AI assistant powered by Google Gemini (`gemini-3.5-flash`), supporting markdown, contextual destination questions, and ₹ INR pricing tips. | ✅ Complete |
| **08** | **Itinerary Planning** | Form-based AI itinerary planner generating interactive day-by-day accordion timeline plans with activity timestamps, durations, and authentic dining recommendations. | ✅ Complete |

---

## 🛠️ Tech Stack & APIs Used

| Component | Technology / Service | Role |
|---|---|---|
| **Framework** | React 18 + Vite | Blazing fast client runtime & instant HMR |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety |
| **Styling** | Vanilla CSS Tokens + Tailwind CSS | Custom glassmorphism design system |
| **Motion** | Framer Motion | Fluid spring physics, hover glows, page transitions |
| **Icons** | Lucide React | Modern geometric iconography |
| **Weather API** | OpenWeatherMap (`/weather`, `/geo`) | Live weather metrics & city geocoding |
| **Image API** | Pexels API (`/v1/search`) | Dynamic high-definition destination photography |
| **AI Engine** | Google Gemini (`gemini-3.5-flash`) | Chatbot assistant & structured itinerary generation |
| **Proxy Server** | Express.js (`server/index.cjs`) | Secure serverless API key proxy for Gemini |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 2. Clone and Install
```bash
git clone https://github.com/your-username/voyager.git
cd voyager
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root:
```env
# Client-side API Keys
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_PEXELS_API_KEY=your_pexels_api_key

# Server-side Gemini Key (kept secure, never bundled into client JS)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Development Server
```bash
npm run dev
```
This concurrently starts:
- **Vite Client**: `http://localhost:5173/`
- **Node API Proxy**: `http://localhost:3001/`

### 5. Production Build Verification
```bash
npm run build
```
Compiles TypeScript types (`tsc -b`) and bundles client assets via Vite.

---

## 🛡️ Resilient Failure Modes (Designed Error States)

1. **Denied Geolocation**: Surfaces an amber glass notice with helpful resolution tips and immediately allows the visitor to search any city or select curated destinations.
2. **Empty Search Query**: When no destinations match a search or filter combination, a glass empty state with an animated compass and a 1-click **"Reset All Filters"** button appears.
3. **Weather API Failure**: Renders a dedicated alert card with an `AlertCircle` icon, clear error message, and a working **"Retry"** button.
4. **Pexels API Rate Limits / Network Drops**: Automatically catches image errors and displays curated, high-resolution local photography without breaking layout.
5. **Gemini AI Disconnects**: Chat and itinerary builder surface formatted error banners with dismiss and retry actions.

---

## ♿ Accessibility & Standards

- **Semantic HTML5 Landmarks**: `<header>`, `<nav>`, `<main id="main-content">`, `<section>`, `<article>`, `<footer>`.
- **Keyboard Navigation**: All interactive elements (custom select popovers, modals, cards, buttons) are focusable with high-visibility rings.
- **Accessible Skip Link**: Includes a `sr-only focus:not-sr-only` skip link that surfaces on `Tab` focus for keyboard and screen-reader users.
- **Contrast**: Tested against WCAG AA standards (Light mode achieves 14.8:1 contrast; Dark mode achieves 16.2:1 contrast).

---

## 📄 License

MIT © 2026 Voyager Travel Inc. Crafted for modern global explorers.
