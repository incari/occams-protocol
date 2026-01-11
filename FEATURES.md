# Occam's Protocol Training App - Feature Specification

## Project Overview
A Progressive Web App (PWA) for tracking Occam's Protocol training sessions. The app follows a mobile-first, responsive design approach and stores all data locally using browser storage.

## Technology Stack
- **Framework**: React
- **Build Tool**: Vite
- **Storage**: LocalStorage (browser)
- **PWA**: Service Worker + Web App Manifest
- **Styling**: CSS/Tailwind (mobile-first responsive design)

---

## Core Training Protocol

### Exercise Structure
- **Total Exercises**: 6 exercises per session
- **Cadence**: 5 seconds up, 5 seconds down (5-5 timing)
- **Two Training Variants**:


#### Option A (Variant 1)
1. Lat Pulldown (Lat Pulldown)
2. Shoulder Press
3. Abdominal Exercises

#### Option B (Variant 2)
1. Chest Press
2. Leg Press
3. Kettlebells swinging

---

## Feature Requirements

### 1. Session Tracking

#### 1.1 Log Training Session
- **Date Selection**: 
  - Default to today's date
  - Ability to select past/future dates via date picker
  - Display selected date prominently
  
- **Variant Selection**:
  - Radio buttons or toggle to select Option A or Option B
  - Visual distinction between variants
  - Show which exercises are included in selected variant

- **Weight Input**:
  - Input field for each exercise in the selected variant
  - Numeric input with decimal support (e.g., 20.5 kg)
  - Unit selector (kg/lbs) - stored in user preferences
  - Validation to ensure weight is entered
  - Optional: Previous weight suggestion from last session

- **Session Save**:
  - Save button to store session data
  - Confirmation message on successful save
  - Error handling for failed saves

#### 1.2 Session History
- **List View**:
  - Chronological list of all training sessions
  - Display: Date, Variant (A/B), Exercises with weights
  - Sort by date (newest first by default)
  - Filter by variant (Option A, Option B, or All)
  
- **Session Details**:
  - Tap/click to view full session details
  - Edit capability for past sessions
  - Delete capability with confirmation

---

### 2. Calendar View

#### 2.1 Monthly Calendar
- **Display**:
  - Monthly grid view (mobile-optimized)
  - Highlight days with training sessions
  - Different visual indicators for Option A vs Option B
  - Current date indicator
  - Navigation: Previous/Next month buttons
  - Month/Year selector for quick navigation

#### 2.2 Calendar Interactions
- **Day Selection**:
  - Tap a day to view sessions for that date
  - Tap empty day to log a new session for that date
  - Swipe gestures for month navigation (mobile)

#### 2.3 Calendar Indicators
- **Visual Markers**:
  - Dot/badge on days with sessions
  - Color coding: Option A (e.g., blue), Option B (e.g., green)
  - Intensity indicator (optional: darker shade for heavier weights)
  - Legend explaining color coding

---

### 3. Progress Tracking

#### 3.1 Weight Progression
- **Per Exercise Charts**:
  - Line or bar chart showing weight progression over time
  - Filter by exercise name
  - X-axis: Date, Y-axis: Weight
  - Touch-friendly chart interactions (mobile)

#### 3.2 Statistics Dashboard
- **Overview Metrics**:
  - Total sessions completed
  - Sessions this month
  - Average weight per exercise
  - Personal records (max weight per exercise)
  - Training frequency (sessions per week)
  - Last training date

#### 3.3 Exercise-Specific Stats
- **Individual Exercise View**:
  - Total sessions for specific exercise
  - Weight progression timeline
  - Best performance date
  - Average weight used

---

### 4. Notifications & Alerts

#### 4.1 Training Reminders
- **Notification Setup**:
  - Enable/disable notifications toggle
  - Set preferred training days (e.g., Monday, Wednesday, Friday)
  - Set preferred time for reminder
  - Multiple reminder times per day (optional)

#### 4.2 Notification Types
- **Scheduled Reminders**:
  - Push notification on scheduled training days
  - "Time to train!" message
  - Link to log new session
  
- **Missed Training Alerts**:
  - Alert if no session logged after scheduled day
  - Configurable grace period (e.g., 1 day after)

- **Achievement Notifications**:
  - Personal record notifications
  - Milestone celebrations (e.g., 10th session, 50th session)

#### 4.3 PWA Notification Support
- **Browser Notifications API**:
  - Request permission on first use
  - Service worker for background notifications
  - Notification click opens app

---

### 5. Data Management

#### 5.1 Local Storage Structure
```json
{
  "sessions": [
    {
      "id": "unique-id",
      "date": "2024-01-15",
      "variant": "A" | "B",
      "exercises": [
        {
          "name": "Chest Press",
          "weight": 50.5,
          "unit": "kg"
        }
      ],
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "settings": {
    "unit": "kg" | "lbs",
    "notifications": {
      "enabled": true,
      "days": ["monday", "wednesday", "friday"],
      "time": "18:00"
    },
    "theme": "light" | "dark"
  }
}
```

#### 5.2 Data Persistence
- **Storage Methods**:
  - Primary: localStorage (persistent)
  - Backup: IndexedDB (for larger datasets if needed)
  - Export/Import functionality (JSON file)

#### 5.3 Data Export/Import
- **Export**:
  - Export all data as JSON file
  - Export as CSV for spreadsheet compatibility
  - Download button in settings

- **Import**:
  - Import JSON backup file
  - Validation and error handling
  - Merge or replace options
  - Confirmation before import

---

### 6. User Interface & Experience

#### 6.1 Mobile-First Design
- **Responsive Breakpoints**:
  - Mobile: 320px - 768px (primary focus)
  - Tablet: 768px - 1024px
  - Desktop: 1024px+ (optional optimization)

- **Touch Interactions**:
  - Large tap targets (minimum 44x44px)
  - Swipe gestures for navigation
  - Pull-to-refresh on lists
  - Smooth animations and transitions

#### 6.2 Navigation
- **Bottom Navigation Bar** (Mobile):
  - Home/Dashboard
  - Calendar
  - Log Session
  - History
  - Settings

- **Navigation Patterns**:
  - Breadcrumbs for deep navigation
  - Back button support
  - Deep linking support

#### 6.3 Visual Design
- **Color Scheme**:
  - Accessible color contrast (WCAG AA minimum)
  - Light/Dark theme support
  - Variant color coding (A vs B)

- **Typography**:
  - Readable font sizes (minimum 16px for body)
  - Clear hierarchy
  - Support for system fonts

- **Icons**:
  - Consistent icon set
  - Meaningful iconography
  - Accessible (text labels where needed)

---

### 7. Progressive Web App (PWA) Features

#### 7.1 Installability
- **Web App Manifest**:
  - App name: "Occam's Protocol Tracker"
  - Short name for home screen
  - Icons (multiple sizes: 192x192, 512x512)
  - Theme color
  - Display mode: "standalone" or "fullscreen"
  - Start URL
  - Orientation: portrait preferred

#### 7.2 Service Worker
- **Offline Support**:
  - Cache app shell for offline access
  - Cache static assets
  - Offline fallback page
  - Background sync for data (future enhancement)

#### 7.3 PWA Capabilities
- **Install Prompt**:
  - Custom install prompt
  - "Add to Home Screen" instructions
  - Install button in settings

- **App-like Experience**:
  - No browser chrome when installed
  - Splash screen
  - Status bar theming

---

### 8. Settings & Preferences

#### 8.1 User Preferences
- **Units**:
  - Weight unit selection (kg/lbs)
  - Persist across sessions

- **Theme**:
  - Light/Dark mode toggle
  - System preference detection
  - Manual override

- **Language** (Future):
  - Multi-language support preparation
  - Default: English

#### 8.2 Notification Settings
- **Reminder Configuration**:
  - Enable/disable notifications
  - Training days selection
  - Time picker for reminders
  - Test notification button

#### 8.3 Data Management Settings
- **Storage**:
  - View storage usage
  - Clear all data (with confirmation)
  - Export data
  - Import data

---

### 9. Error Handling & Edge Cases

#### 9.1 Input Validation
- **Weight Input**:
  - Numeric validation
  - Range validation (reasonable limits)
  - Decimal precision handling
  - Empty field warnings

- **Date Validation**:
  - Valid date format
  - Future date warnings (optional)
  - Duplicate session warnings

#### 9.2 Storage Errors
- **Quota Exceeded**:
  - Warning message
  - Suggest data export/cleanup
  - Graceful degradation

- **Storage Unavailable**:
  - Fallback to session storage
  - User notification
  - Data loss prevention

#### 9.3 Offline Handling
- **Offline Mode**:
  - Queue actions when offline
  - Sync when online
  - Clear offline indicator
  - Offline data access

---

### 10. Performance Requirements

#### 10.1 Load Time
- **Initial Load**:
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3.5s
  - Optimized bundle size

#### 10.2 Runtime Performance
- **Smooth Interactions**:
  - 60fps animations
  - No janky scrolling
  - Fast list rendering (virtualization if needed)

#### 10.3 Data Operations
- **Storage Operations**:
  - Fast read/write operations
  - Efficient data queries
  - Minimal re-renders

---

### 11. Accessibility Features

#### 11.1 WCAG Compliance
- **Level AA Compliance**:
  - Keyboard navigation support
  - Screen reader compatibility
  - ARIA labels where needed
  - Focus indicators

#### 11.2 Inclusive Design
- **Text Alternatives**:
  - Alt text for images/icons
  - Descriptive button labels
  - Form field labels

- **Color Independence**:
  - Don't rely solely on color
  - Icons + color for variants
  - Text labels for status

---

### 12. Future Enhancements (Out of Scope for MVP)

#### 12.1 Advanced Features
- **Social Features**:
  - Share progress
  - Compare with friends

- **Advanced Analytics**:
  - Volume calculations
  - Training load tracking
  - Rest day recommendations

- **Exercise Customization**:
  - Add custom exercises
  - Modify exercise names
  - Exercise notes

- **Cloud Sync**:
  - Multi-device sync
  - Account system
  - Data backup to cloud

---

## Technical Implementation Notes

### Project Structure
```
occam-protocol-app/
├── src/
│   ├── components/
│   │   ├── Calendar/
│   │   ├── SessionForm/
│   │   ├── SessionList/
│   │   ├── Statistics/
│   │   └── Navigation/
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useNotifications.ts
│   │   └── useSessions.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── dateUtils.ts
│   │   └── validation.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── sw.js (service worker)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Key Libraries to Consider
- **Date Handling**: date-fns or dayjs
- **Charts**: recharts or chart.js (mobile-friendly)
- **Notifications**: Web Notifications API
- **PWA**: vite-plugin-pwa
- **Styling**: Tailwind CSS or CSS Modules

---

## Success Criteria

### MVP Must-Haves
1. ✅ Log training sessions with date, variant, and weights
2. ✅ View session history
3. ✅ Calendar view with training days marked
4. ✅ Local storage persistence
5. ✅ PWA installable on mobile devices
6. ✅ Mobile-responsive design
7. ✅ Basic notifications for training reminders

### Nice-to-Haves (Post-MVP)
- Progress charts
- Advanced statistics
- Data export/import
- Dark mode
- Offline support

---

## Development Phases

### Phase 1: Core Functionality
- Project setup (React + Vite)
- Basic session logging
- Local storage integration
- Session history view

### Phase 2: Calendar & UI
- Calendar component
- Mobile-first styling
- Navigation structure
- Date picker integration

### Phase 3: PWA & Notifications
- Service worker setup
- Web app manifest
- Notification system
- Install prompt

### Phase 4: Polish & Testing
- Error handling
- Input validation
- Performance optimization
- Accessibility improvements
- Testing on real devices

---

## Notes
- All data stored locally - no backend required
- Focus on mobile experience first
- Ensure app works offline (at least for viewing data)
- Test on real mobile devices during development
- Consider battery impact of notifications
