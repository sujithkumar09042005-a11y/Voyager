<div align="center">

# 🧭 VOYAGER
### Next-Generation Travel Explorer & AI Trip Engine

[![Live Application](https://img.shields.io/badge/Live_Demo-voyager--cyan.vercel.app-285ccc?style=for-the-badge&logo=vercel&logoColor=white)](https://voyager-cyan.vercel.app)
[![React 18](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![OpenWeather](https://img.shields.io/badge/OpenWeather-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white)](https://openweathermap.org/)
[![Pexels](https://img.shields.io/badge/Pexels_API-05A081?style=for-the-badge&logo=pexels&logoColor=white)](https://www.pexels.com/)

<p align="center">
  A design-led, full-stack travel platform featuring glassmorphism aesthetics, live GPS distance calculations, real-time weather telemetry, dynamic destination photography, and conversational AI trip planning — with all budget estimates tailored in Indian Rupees (₹ INR).
</p>

[🌐 Live Website](https://voyager-cyan.vercel.app) • [🚀 Quick Start](#-quick-start-3-minutes) • [✨ Features](#-features-walkthrough) • [🛠️ Tech Stack](#-tech-stack--architecture) • [❓ FAQ](#-frequently-asked-questions)

---

</div>

## 📖 Table of Contents

- [🧭 What is Voyager?](#-what-is-voyager)
- [✨ Features Walkthrough](#-features-walkthrough)
- [🚀 Quick Start (3 Minutes)](#-quick-start-3-minutes)
- [🔑 How to Get Free API Keys](#-how-to-get-free-api-keys)
- [🎨 Design System & Dual Themes](#-design-system--dual-themes)
- [🛠️ Tech Stack & Architecture](#-tech-stack--architecture)
- [📁 Folder Structure Explained](#-folder-structure-explained)
- [❓ Frequently Asked Questions](#-frequently-asked-questions)
- [📄 License & Credits](#-license--credits)

---

## 🧭 What is Voyager?

**Voyager** is an open-source travel discovery web application built to make planning your next journey effortless, beautiful, and intelligent. 

Instead of jumping across 5 different websites to check distances, check weather, view photos, read reviews, and build an itinerary, **Voyager brings everything into one unified, glassmorphic workspace**:

```
Your Location  ──►  Calculate Real Distances (km)
                     └──►  Browse 34 Global Escapes
                            └──►  Check Live Weather (°C)
                                   └──►  View Verified Pexels Photos
                                          └──►  Generate AI Itinerary (₹ INR)
```

---

## ✨ Features Walkthrough

<details open>
<summary><strong>1. 🎥 Cinematic Video Landing Experience</strong></summary>
<br>

- **High-Definition Looping Hero**: Plays an ambient travel film with frosted glass overlays.
- **Floating Command Search**: Type any destination name, vibe, or country to jump straight to matches.
- **Quick Location Prompt**: Tap "Detect Live Location" directly from the hero to measure distances instantly.
- **Theme Switcher**: Seamlessly toggle between Light Mode (Buttermilk & Blue) and Dark Mode (Cosmic Obsidian).

</details>

<details open>
<summary><strong>2. 📍 Dual-Mode Location Intelligence (GPS + City Search)</strong></summary>
<br>

- **Mode 1 (Live Device GPS)**: Calculates real geodesic distances in kilometers to all 34 destinations using the Haversine spherical algorithm.
- **Mode 2 (Global City Search)**: If location permissions are denied, users can type any city on Earth (e.g., *London*, *Delhi*, *Tokyo*, *New York*) to measure distances from that specific starting point.
- **One-Click Presets**: Quick buttons for popular origins (*Mumbai*, *Delhi*, *London*, *Tokyo*, *New York*).

</details>

<details open>
<summary><strong>3. 🌍 Destination Explorer & Filter Dock</strong></summary>
<br>

- **34 Hand-Curated Destinations**: Spanning all 7 continents (Asia, Europe, Africa, North America, South America, Oceania, Antarctica).
- **Glass Command Dock**: Unified floating toolbar with real-time text search and live match counter.
- **Budget Selector**: Quick filter by daily budget tier in Indian Rupees (`₹ <5k`, `₹ 5k-15k`, `₹ >15k`).
- **Atmosphere Vibes Matrix**: Filter by travel themes (*Ancient History*, *Street Food*, *Beaches*, *Mountain Treks*, *Wildlife & Safari*, *Romantic Getaway*).

</details>

<details open>
<summary><strong>4. 🏛️ Landmarks & Must-Visit Places</strong></summary>
<br>

- **Curated Attractions**: 3–5 famous spots per destination with category tags, descriptions, and recommended visit hours.
- **Dynamic Pexels Photography**: Photos fetched on the fly with verified photographer credits and direct links.
- **Interactive Modals**: Click any landmark card to open a focus-trapped glass modal with high-res imagery.

</details>

<details open>
<summary><strong>5. ☀️ Live Weather Telemetry (OpenWeatherMap)</strong></summary>
<br>

- **Real-Time Metrics**: Current temperature in °C, animated condition badges, feels-like readings, humidity (%), wind speed (km/h), and visibility.
- **Error Protection**: Includes an interactive retry button and informative error messages if network requests drop.

</details>

<details open>
<summary><strong>6. 🤖 Voyager AI Assistant & Itinerary Engine (Google Gemini)</strong></summary>
<br>

- **Conversational Travel Assistant**: Floating AI drawer ready 24/7 to answer packing, transit, food, and culture questions.
- **Pricing in ₹ INR**: Every cost estimate, ticket price, and budget recommendation is automatically converted and formatted in Indian Rupees.
- **Multi-Model Fallback Cascade**: Employs an automated resilience pool across Google Gemini models (`gemini-flash-latest`, `gemini-flash-lite`, `gemini-3.5-flash-lite`) to avoid rate limits and 500 errors.
- **Interactive Day-by-Day Accordion**: Generates customized multi-day schedules with activity timestamps, durations, and dining advice.

</details>

<details open>
<summary><strong>7. ⌨️ 100% Keyboard-Only Accessibility (WCAG Compliant)</strong></summary>
<br>

- **Animated Skip Link**: Press `Tab` once on any page to reveal the "Skip to main content" pill.
- **Luminous Focus Rings (`:focus-visible`)**: Dual-ring neon aura with a 3.5px offset ensures every active element is clearly visible.
- **Focus Trapping**: Modals trap `Tab` cycles within the dialog; pressing `Escape` dismisses overlays and restores focus to the trigger button.
- **Accessible Custom Select**: Navigate dropdowns with `ArrowUp` / `ArrowDown`, select with `Enter`, and close with `Escape`.

</details>

---

## 🚀 Quick Start (3 Minutes)

Follow these simple steps to run Voyager on your own computer:

### Step 1: Clone the Repository
Open your terminal (PowerShell, Command Prompt, or Terminal) and run:
```bash
git clone https://github.com/sujithkumar09042005-a11y/Voyager.git
cd Voyager
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Create a file named `.env` in the root folder and add your keys:
```env
# Client-Side Keys
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
VITE_PEXELS_API_KEY=your_pexels_key_here

# Server-Side Key
GEMINI_API_KEY=your_gemini_key_here

# Runtime
NODE_ENV=development
```
*(Don't have keys yet? See the [API Key Guide](#-how-to-get-free-api-keys) below — they are 100% free!)*

### Step 4: Run the Development Server
```bash
npm run dev
```
Voyager will launch locally at:
- **Frontend App**: `http://localhost:5173/`
- **Backend Proxy**: `http://localhost:3001/`

---

## 🔑 How to Get Free API Keys

All APIs used in Voyager offer generous **free tiers** with no credit card required:

<details>
<summary><strong>1. Google Gemini AI Key (Free)</strong> — Click to expand</summary>
<br>

1. Visit **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2. Sign in with any Google account.
3. Click the blue **"Create API Key"** button.
4. Select **"Create API key in new project"**.
5. Copy your key and paste it into `.env` as `GEMINI_API_KEY=your_key`.

</details>

<details>
<summary><strong>2. OpenWeatherMap API Key (Free)</strong> — Click to expand</summary>
<br>

1. Visit **[OpenWeatherMap Sign Up](https://home.openweathermap.org/users/sign_up)**.
2. Create a free account.
3. Go to the **API Keys** tab in your profile.
4. Copy your default key and paste it into `.env` as `VITE_OPENWEATHER_API_KEY=your_key`.

</details>

<details>
<summary><strong>3. Pexels Photography API Key (Free)</strong> — Click to expand</summary>
<br>

1. Visit **[Pexels API Portal](https://www.pexels.com/api/)**.
2. Create a free account and click **"Get Started"**.
3. Fill in a brief description (e.g., *"Personal travel explorer project"*).
4. Copy your API Key and paste it into `.env` as `VITE_PEXELS_API_KEY=your_key`.

</details>

---

## 🎨 Design System & Dual Themes

Voyager features an editorial aesthetic crafted with custom CSS tokens:

| Element | Light Theme (Soft Luxury) | Dark Theme (Cosmic Obsidian) |
|---|---|---|
| **Background** | Ivory Buttermilk (`#faf7ee`) | Cosmic Obsidian (`#060a14`) |
| **Accent Primary** | Mid Blue (`#285ccc`) | Electric Sapphire (`#3b82f6`) |
| **Accent Secondary** | Warm Buttermilk (`#fff2bd`) | Champagne Gold (`#fde047`) |
| **Glass Panels** | Frosted white sheen (`rgba(255,255,255,0.7)`) | Obsidian glass (`rgba(10,18,32,0.75)`) |
| **Text Primary** | Deep Navy (`#061128`) | Crisp White (`#f8fafc`) |
| **Typography** | Headlines: **Outfit** • Body: **Plus Jakarta Sans** | Headlines: **Outfit** • Body: **Plus Jakarta Sans** |

---

## 🛠️ Tech Stack & Architecture

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

- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & Motion**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Iconography**: [Lucide React](https://lucide.dev/) (pure vector icons)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **APIs**: [Google Gemini AI](https://deepmind.google/technologies/gemini/), [OpenWeatherMap](https://openweathermap.org/), [Pexels](https://www.pexels.com/)
- **Deployment**: [Vercel](https://vercel.com/) (Edge Serverless Functions)

---

## 📁 Folder Structure Explained

<details>
<summary><strong>Click to view the directory tree</strong></summary>
<br>

```text
voyager/
├── api/                        # Vercel Serverless Functions (Backend)
│   ├── chat.ts                 # Gemini AI assistant with multi-model fallback
│   └── itinerary.ts            # Gemini AI structured trip planner
├── public/                     # Static media files
│   ├── Hero_Video.mp4          # Ambient looping video
│   ├── favicon.ico             # Browser tab icon (multi-resolution)
│   ├── favicon.png             # 128x128 circular PNG tab icon
│   ├── favicon-32x32.png       # 32x32 circular PNG tab icon
│   ├── favicon.svg             # Self-contained circular SVG
│   └── icon.png                # Original brand asset
├── server/                     # Local Express development proxy
│   └── index.cjs               # Mirrors Vercel serverless functions locally
├── src/                        # React Frontend Source Code
│   ├── components/             # Reusable UI building blocks
│   │   ├── ui/                 # Buttons, Badges, Modals, Custom Select, Cursor
│   │   ├── Navbar.tsx          # Frosted header with mobile drawer & theme toggle
│   │   ├── Footer.tsx          # 5-column glassmorphic footer
│   │   ├── LocationDetectorModal.tsx # Dual-mode GPS & City Geocoding modal
│   │   └── WeatherWidget.tsx   # Live OpenWeather display widget
│   ├── data/
│   │   └── destinations.json   # 34 global destinations catalog
│   ├── features/               # Main page features
│   │   ├── hero/               # HeroSection with search capsule
│   │   ├── explorer/           # ExplorerPage & DestinationCard grid
│   │   ├── destination-detail/ # Single destination page & place modals
│   │   ├── chatbot/            # Floating Voyager AI conversational drawer
│   │   └── itinerary/          # Day-by-day itinerary builder
│   ├── hooks/                  # Custom React hooks (weather, search, pexels)
│   ├── lib/                    # API client configurations
│   ├── styles/
│   │   └── tokens.css          # Glassmorphic CSS design system tokens
│   └── types/                  # TypeScript interface definitions
├── .gitignore                  # Keeps .env safe from git
├── package.json                # Project dependencies
├── vercel.json                 # Vercel routing & serverless configuration
└── vite.config.ts              # Vite configuration
```

</details>

---

## ❓ Frequently Asked Questions

<details>
<summary><strong>Q: What happens if I deny browser location permissions?</strong></summary>
<br>
Voyager is built with graceful fallbacks. If you deny GPS permission, the app automatically shows a friendly banner and enables the <strong>Global City Search Bar</strong>. You can type any city (e.g. <em>London</em> or <em>Mumbai</em>) to calculate distances from there instead.
</details>

<details>
<summary><strong>Q: Why are all budgets and prices quoted in Indian Rupees (₹ INR)?</strong></summary>
<br>
Voyager's AI engine and destination database standardize estimates in Indian Rupees (₹) to provide clear, consistent budgeting across hotel stays, dining, transit, and landmark tickets.
</details>

<details>
<summary><strong>Q: How does the AI Assistant handle Google rate limits?</strong></summary>
<br>
Voyager features a multi-model resilience pool. If Google's primary model is busy or hits a rate limit, the serverless function cascades across <code>gemini-flash-latest</code>, <code>gemini-flash-lite</code>, and <code>gemini-3.5-flash-lite</code> in milliseconds. If all external APIs are temporarily offline, an intelligent fallback guide is generated in ₹ INR so users never see an error banner.
</details>

<details>
<summary><strong>Q: Can I navigate the entire website using only my keyboard?</strong></summary>
<br>
Yes! Voyager is 100% keyboard accessible. You can press <code>Tab</code> to reveal the skip link, navigate cards with bright luminous focus rings, press <code>Enter</code> to open modals, navigate custom dropdowns with <code>ArrowUp</code> / <code>ArrowDown</code>, and press <code>Escape</code> to close any popup.
</details>

---

## 📄 License & Credits

- **License**: [MIT License](LICENSE) © 2026 Voyager. Free for personal and educational use.
- **Photography**: Dynamically powered by the [Pexels API](https://www.pexels.com) with embedded photographer credits.
- **Weather Telemetry**: Live data powered by [OpenWeatherMap](https://openweathermap.org/).
- **AI Intelligence**: Conversational planning powered by [Google Gemini AI](https://deepmind.google/technologies/gemini/).

<div align="center">
  <sub>Crafted with precision & passion. Star ⭐ this repository if you enjoyed exploring Voyager!</sub>
</div>
