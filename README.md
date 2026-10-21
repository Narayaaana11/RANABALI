# Ranabaali: The Colonial Resistance

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Web / Mobile](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-blue.svg)]()
[![Engine: HTML5 Canvas + WebAudio](https://img.shields.io/badge/Engine-Vanilla%20Canvas%20%2B%20WebAudio-red.svg)]()

> A high-octane 2D Action Beat 'Em Up / Hack-and-Slash web game based on the movie ***Ranabaali*** starring **Vijay Deverakonda**, **Rashmika Mandanna**, and **Arnold Vosloo**, directed by **Rahul Sankrityan**, featuring real character artwork and music inspired by **Ajay–Atul**.

---

## 🎬 Story & Setting
Set against the backdrop of the **Great Famine of 1876–1878** in the Rayalaseema region of the Madras Presidency. Under Commissioner **Sir Theodore Hector**, the colonial British administration lays down railway lines from remote villages to the Madras coast to siphon Indian grain to the colonial homeland while millions of local villagers face starvation.

**Singanamala Bobbili Ranabaali** (Vijay Deverakonda), a fierce machete-wielding folk warrior, rises alongside **Jayamma** (Rashmika Mandanna) to spearhead an armed rebellion: defending starving villages, hijacking grain trains, and storming the colonial citadel.

---

## ⚔️ Key Features & Recent Enhancements

* **Real Character Visuals & Movie Artwork**:
  - High-resolution character portraits integrated for **Ranabaali** (Vijay Deverakonda), **Jayamma** (Rashmika Mandanna), **Commissioner Sir Theodore Hector** (Arnold Vosloo), and **British Colonial Troops**.
  - **Cinematic Battle Cut-In Cards**: Dramatic fighting-game special move banners slide across the screen when activating *Ranavatharam* (`I`/`Q`), summoning *Jayamma* (`Space`/`U`), or when *Hector* calls artillery barrages.
  - **Motion Comic Prologue**: Richly illustrated story panels setting up the historical resistance.
  - **Real Portrait HUD**: Custom ornate portrait frames for Ranabaali and Jayamma, plus Hector's Imperial Victorian crest.

* **Ajay–Atul Inspired Audio Engine**:
  - Real-time synthesized **Dappu folk war percussion** and authentic **Kombu war horn** motifs in Rayalaseema Bhairav raga.
  - Formant speech synthesis for Telugu war roars (*"RANABAALI!"*, *"UGRA RUPAM!"*).
  - External MP3/WAV support: drop any official movie track into `assets/audio/ranabaali_theme.mp3` for automatic playback.

* **Visceral Mass Action Combat**:
  - 3-hit fluid light machete combo strings (`J`).
  - Devastating heavy leap cleaves that shatter enemy iron shields (`K`).
  - Timed bullet deflections to parry British rifle bullets back at redcoats.
  - Dodge rolls with invulnerability frames (`L` / `Shift`).
  - **Ranavatharam (Fury Mode)**: Unleash divine rage (`I` / `Q`) when the Fury gauge fills—igniting your twin *Veta Katthulu* with fire, increasing speed, and creating screen-clearing shockwaves.

* **Campaign Stages & Endless Mode**:
  - **Act I: The Village of Singanamala**: Defend the harvest across 3 waves of raiding colonial forces.
  - **Act II: The Great Grain Train Heist**: Fight along 6 speeding locomotive carriages with rushing desert parallax terrain, gaps, and coal smoke.
  - **Act III: Fort St. George Citadel**: Storm the colonial fortress during a stormy night with rain and lightning flashes, culminating in the Hector boss duel.
  - **Endless Rayalaseema Resistance**: Test your endurance against infinite waves with high-score tracking.

---

## 🕹️ Controls

### Desktop Keyboard
| Action | Key |
| :--- | :--- |
| **Move Left / Right** | `A` / `D` or `Left` / `Right` Arrow Keys |
| **Jump** | `W` or `Up` Arrow Key |
| **Light Slash (Combo 1-2-3)** | `J` |
| **Heavy Cleave / Guard Break** | `K` |
| **Dodge Roll (I-Frames)** | `L` or `Shift` |
| **Bullet Deflect / Parry** | Timed `J` just before bullet impact |
| **Jayamma Support** | `Space` or `U` |
| **Ranavatharam Fury Mode** | `I` or `Q` |
| **Pause Game** | `Escape` or `P` |

### Mobile & Tablet Touch Controls (Landscape Mode)
* **Widescreen Landscape Orientation**: Full cinematic 16:9 combat with dynamic orientation detection (`#orientationOverlay`) guiding mobile and tablet users to play horizontally.
* **Floating Analog Joystick**: Touch and drag anywhere on the left half of the touchscreen to navigate smoothly, with upward flick jump support.
* **Ergonomic Combat Cluster**: Touch action buttons with tactile haptic vibration (`navigator.vibrate`):
  - `SLASH [J]` (Combos 1-2-3 & Bullet Deflections)
  - `HEAVY [K]` (Armor-shattering leap cleave)
  - `ROLL [L]` (Dodge roll with invulnerability frames)
  - `JUMP [SPC]` (Vertical leap)
  - `JAYAMMA [E]` (Summon Jayamma for healing/blinding support)
  - `TACTIC [R]` (Cycle companion strategy)
  - `FURY [F]` (Unleash fiery Ranavatharam rage)
* **Compact Header Controls**: Icon buttons (`🔊`, `📁`, `⌨`, `⏸`, `⛶`) dynamically collapse on mobile screens to preserve maximum viewport visibility.

---

## 🚀 How to Run Locally

You can run the game in any of the following ways:

### Option 1: Local HTTP Server (npm)
```bash
npm start
# or
npx serve . -l 3000
```
Then visit `http://localhost:3000` in your browser.

---

## ☁️ Deploying to Vercel

The project is **100% Vercel Ready** with zero-configuration required:

1. **Deploy with Vercel CLI**:
   ```bash
   npx vercel
   # Or for production:
   npx vercel --prod
   ```
2. **Deploy via Git / GitHub**:
   - Push your code to GitHub, GitLab, or Bitbucket.
   - Import the repository in your [Vercel Dashboard](https://vercel.com/new).
   - Vercel automatically detects the static configuration with `vercel.json` and `.vercelignore`.
   - Click **Deploy**.

### 📊 Vercel Web Analytics & Telemetry
- **Official Analytics Tag**: Configured with `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`.
- **Automatic Event Tracking**:
  - `game_session_start` (Device type: mobile/tablet/desktop, aspect ratio, DPR)
  - `campaign_started` & `endless_started`
  - `act_started` (Acts 1, 2, 3, 4)
  - `boss_fight_reached` (Hector duel)
  - `stage_cleared` & `game_victory_complete` (with grain counter and highest combo stats)
  - `game_over`
  - `ranavatharam_fury_activated`
  - `audio_toggle` & `custom_audio_loaded`
- To enable analytics on your live domain, open your project on the [Vercel Dashboard](https://vercel.com/), go to the **Analytics** tab, and click **Enable**.

