# Jonie's 25th Anniversary Raffle Wheel App

A fully offline, ad‑less, desktop raffle wheel application built for **Jonies's 25th Anniversary Event**. The app supports up to **1100+ dynamic entries**, features smooth animations, real‑time winner selection, and a polished UI suitable for live event presentation.

This application was developed using **Electron**, **Vite**, **Vue.js**, and **Quasar Framework**, packaged as a **Mac desktop application**.

---

## 🚀 Features

### 🎡 Dynamic Raffle Wheel

* Smooth spinning animation optimized for live events.
* Adjustable spin duration and easing.
* Highly visible, bold UI for stage displays.

### 👥 Supports 1100+ Entries

* Accepts JSON, CSV, or manual input.
* Internally optimized for performance despite large datasets.
* Auto‑deduplication and validation.

### 🖥️ Fully Offline Desktop App

* No ads, no trackers, no internet dependency.
* Bundled into a production Electron app.
* Local entry saving.

### 🎉 Winner Presentation

* Displays the selected winner in a clean, celebratory modal.
* Copies winner details to logs.
* Optionally removes winners from the pool.

### ⚙️ Entry Controls

* Import/export entries.
* Reset wheel.
* Toggle sound effects.
* Customize colors, spin speed, and wheel behavior.

---

## 🛠️ Tech Stack

**Core:**

* Electron 28+
* Vite
* Vue.js 3 (Composition API)
* Quasar Framework

**Build Tools:**

* electron-builder for packaging
* pnpm/npm for dependency management

---

## 📂 Project Structure

```
root
├─ electron/               # Electron main process
│  ├─ main.js              # App bootstrap, BrowserWindow config
│  └─ preload.js           # Secure bridging to renderer
├─ src/
│  ├─ components/          # Vue components (Wheel, WinnerModal, EntryPanel)
│  ├─ assets/              # Pinia store for entries, configs
│  └─ App.vue
├─ assets/                 # Images, sound effects
├─ dist/                   # Production build
├─ package.json
└─ electron-builder.yml    # Build configuration
```

---

## 📦 Setup & Installation

### 1. Clone the Repository

```
git clone https://github.com/your-username/jonies-wheel-app.git
cd jonies-wheel-app
```

### 2. Install Dependencies

```
pnpm install
```

### 3. Run in Development

```
pnpm dev
```

This will spin up Vite + Electron with hot reload.

### 4. Build for Production (Mac)

```
pnpm build
```

Output .dmg / .app will be generated in `dist/`.

---

## 📜 Packaging Notes

* Built with `electron-builder`.
* Signed/notarized variant (optional) for macOS.
* Uses preload isolation for security.

---

## ⚠️ Known Limitations

* Currently optimized for macOS only.
* Windows/Linux builds possible but untested.
* Extremely large CSVs (>5k entries) may require extended load time.

---

## 🧩 Future Improvements

* Theme presets (corporate, fiesta, tech, minimal).
* Multiplayer raffle modes.
* API-based entry sync (if needed).

---

## 📄 License

Proprietary — developed exclusively for **Jonies’s 25th Anniversary**.
