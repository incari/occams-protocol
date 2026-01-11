# Occam's Protocol Training App

A Progressive Web App (PWA) for tracking Occam's Protocol training sessions. Built with React, Vite, and TypeScript.

## Features

- 📊 **Session Tracking**: Log training sessions with date, variant (Option A or V), and weights
- 📅 **Calendar View**: Visual calendar showing training days with color-coded variants
- 📋 **History**: View and manage all past training sessions
- 📈 **Statistics**: Track progress with personal records and session counts
- 🔔 **Notifications**: Set training reminders for specific days and times
- 💾 **Local Storage**: All data stored locally in your browser
- 📱 **PWA**: Installable on mobile devices for app-like experience
- 🌓 **Dark Mode**: Light and dark theme support

## Training Protocol

### Option A
1. Lat Pulldown
2. Shoulder Press
3. Abdominal Exercises

### Option V
1. Chest Press
2. Leg Press
3. Kettlebells swinging

**Cadence**: 5 seconds up, 5 seconds down (5-5 timing)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Start development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

## PWA Installation

### Mobile (iOS)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Mobile (Android)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click to install

## Data Management

- All data is stored locally in your browser's localStorage
- Export your data from Settings to create backups
- Import previously exported data to restore sessions
- Clear all data option available in Settings

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **date-fns** - Date utilities
- **Vite PWA Plugin** - PWA support

## License

MIT
