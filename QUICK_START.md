# Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

## First Steps

1. **Log your first session:**
   - Tap the "Log" tab in the bottom navigation
   - Select a date (defaults to today)
   - Choose Option A or Option B
   - Enter weights for each exercise
   - Tap "Save Session"

2. **View your calendar:**
   - Tap the "Calendar" tab
   - See your training days highlighted
   - Blue dots = Option A, Green dots = Option B

3. **Check your progress:**
   - View the Dashboard for statistics
   - See personal records for each exercise
   - Review recent sessions

4. **Configure settings:**
   - Set your preferred weight unit (kg/lbs)
   - Enable dark mode
   - Set up training reminders
   - Export your data for backup

## PWA Installation

To install the app on your mobile device:

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Customize the name if desired
5. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen" or "Install app"
4. Confirm installation

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click to install
3. The app will open in its own window

## Features Overview

- **Dashboard**: Overview of your training statistics
- **Calendar**: Visual calendar with training days marked
- **Log**: Create new training sessions
- **History**: View and manage all past sessions
- **Settings**: Configure app preferences and manage data

## Data Storage

- All data is stored locally in your browser
- No account or internet connection required
- Export your data regularly for backup
- Import data to restore from backup

## Troubleshooting

**App won't load:**
- Clear browser cache
- Check browser console for errors
- Ensure JavaScript is enabled

**Data missing:**
- Check if localStorage is enabled
- Try exporting data before clearing browser data
- Check browser storage settings

**Notifications not working:**
- Grant notification permissions when prompted
- Check device notification settings
- Ensure app is installed as PWA

## Next Steps

- Add PWA icons (see PWA_ICONS.md)
- Customize colors in tailwind.config.js
- Add more features as needed
