# Physical Measurements Tracking Feature

## Overview
Add a new section to track physical body measurements over time. This allows users to monitor their physical changes during training sessions.

## Data Structure

### Measurement Entry
Each measurement log should contain:
- **Date**: When the measurement was taken (ISO date string YYYY-MM-DD)
- **Height**: Initial/current height (cm or inches)
- **Weight**: Body weight (kg or lbs)
- **Body Fat Percentage**: Body fat percentage (%)
- **Measurements** (all in cm or inches):
  - **Left Arm**: Diameter/circumference of left arm
  - **Right Arm**: Diameter/circumference of right arm
  - **Left Leg**: Diameter/circumference of left leg
  - **Right Leg**: Diameter/circumference of right leg
  - **Waist**: Waist circumference
  - **Hip**: Hip circumference
- **Metadata**:
  - `id`: Unique identifier
  - `createdAt`: Timestamp when created
  - `updatedAt`: Timestamp when last updated

### Storage Structure
```json
{
  "measurements": [
    {
      "id": "measurement-1234567890",
      "date": "2024-01-15",
      "height": 175.5,
      "weight": 75.2,
      "bodyFat": 15.5,
      "measurements": {
        "leftArm": 32.5,
        "rightArm": 32.8,
        "leftLeg": 58.2,
        "rightLeg": 58.0,
        "waist": 85.0,
        "hip": 95.5
      },
      "unit": "cm" | "inches",
      "weightUnit": "kg" | "lbs",
      "createdAt": 1705276800000,
      "updatedAt": 1705276800000
    }
  ]
}
```

## Feature Requirements

### 1. Measurement Form

#### 1.1 Input Fields
- **Date Picker**:
  - Default to today's date
  - Ability to select past dates
  - Display selected date prominently

- **Height Input**:
  - Numeric input with decimal support
  - Unit selector (cm/inches) - should match measurement unit
  - Validation: positive number, reasonable range (e.g., 100-250 cm)

- **Weight Input**:
  - Numeric input with decimal support
  - Unit selector (kg/lbs) - can be different from measurement unit
  - Validation: positive number, reasonable range
  - Should use the same unit preference as training sessions

- **Body Fat Percentage**:
  - Numeric input with decimal support
  - Range: 0-100%
  - Validation: positive number, max 100

- **Body Measurements** (all in same unit - cm or inches):
  - **Left Arm**: Numeric input, decimal support
  - **Right Arm**: Numeric input, decimal support
  - **Left Leg**: Numeric input, decimal support
  - **Right Leg**: Numeric input, decimal support
  - **Waist**: Numeric input, decimal support
  - **Hip**: Numeric input, decimal support
  - All should have validation for positive numbers
  - Unit selector for all measurements (cm/inches)

#### 1.2 Form Behavior
- Similar structure to SessionForm
- Save button to store measurement data
- Confirmation message on successful save
- Error handling for failed saves
- Form validation before submission
- Optional: Show previous measurement values for comparison

### 2. Measurement History

#### 2.1 List View
- Chronological list of all measurements
- Display: Date, Weight, Body Fat %, Key measurements summary
- Sort by date (newest first by default)
- Card-based layout similar to SessionList

#### 2.2 Measurement Details
- Tap/click to view full measurement details
- Edit capability for past measurements
- Delete capability with confirmation
- Show all measurements in organized layout

### 3. Progress Visualization

#### 3.1 Charts/Graphs
- **Weight Progression**: Line chart showing weight over time
- **Body Fat Progression**: Line chart showing body fat % over time
- **Measurement Progression**: 
  - Line chart for each body part (arms, legs, waist, hip)
  - Option to show left/right separately or average
  - X-axis: Date, Y-axis: Measurement value
  - Touch-friendly chart interactions (mobile)

#### 3.2 Statistics
- **Overview Metrics**:
  - Total measurements logged
  - First measurement date
  - Latest measurement date
  - Weight change (from first to last)
  - Body fat change (from first to last)
  - Measurement changes (from first to last)

- **Comparison View**:
  - Compare current vs previous measurement
  - Show differences (gains/losses)
  - Visual indicators (up/down arrows, colors)

### 4. Integration with Existing Features

#### 4.1 Navigation
- Add "Measurements" tab to bottom navigation
- Or add as a section in Dashboard
- Accessible from main navigation

#### 4.2 Dashboard Integration
- Show latest measurement on dashboard
- Quick stats: Current weight, body fat %
- Link to full measurements page

#### 4.3 Calendar Integration
- Optional: Show measurement days on calendar
- Different visual indicator (e.g., different color/shape)

### 5. Data Management

#### 5.1 Storage
- Store in localStorage alongside sessions
- Use same storage utility pattern
- Export/import should include measurements
- Clear data option should include measurements

#### 5.2 Data Validation
- All numeric fields must be positive
- Reasonable range validation
- Date validation
- Unit consistency checks

### 6. User Interface

#### 6.1 Form Layout
- Mobile-first design
- Grouped sections:
  - Basic Info (Date, Height, Weight, Body Fat %)
  - Body Measurements (Arms, Legs, Waist, Hip)
- Clear labels and placeholders
- Input validation feedback
- Large touch targets

#### 6.2 Measurement Display
- Card-based layout
- Organized sections for easy reading
- Comparison with previous measurement (if available)
- Visual indicators for changes

#### 6.3 Charts
- Responsive charts that work on mobile
- Touch interactions for zoom/pan
- Clear axis labels
- Legend for multiple data series

## Technical Implementation

### New Components Needed
1. **MeasurementForm**: Form to log new measurements
2. **MeasurementList**: List view of all measurements
3. **MeasurementCard**: Individual measurement display card
4. **MeasurementCharts**: Progress visualization charts
5. **MeasurementStats**: Statistics and comparison view

### New Hooks Needed
1. **useMeasurements**: Hook to manage measurement data (similar to useSessions)

### Updated Files
1. **storage.ts**: Add measurement storage functions
2. **types/index.ts**: Add Measurement type definitions
3. **App.tsx**: Add measurement routes
4. **BottomNav.tsx**: Add measurements navigation item

### New Routes
- `/measurements` - Main measurements page (list + form)
- `/measurements/new` - New measurement form
- `/measurements/:id` - View/edit specific measurement

## User Flow

1. **Log New Measurement**:
   - Navigate to Measurements page
   - Tap "Add Measurement" button
   - Fill in form fields
   - Select units (measurement unit and weight unit)
   - Save measurement
   - See confirmation and redirect to list

2. **View History**:
   - Navigate to Measurements page
   - See list of all measurements
   - Tap measurement to view details
   - Option to edit or delete

3. **Track Progress**:
   - View charts showing progression
   - Compare current vs previous
   - See statistics and changes

## Validation Rules

- **Height**: 100-250 cm (39-98 inches)
- **Weight**: 30-300 kg (66-660 lbs)
- **Body Fat**: 0-100%
- **Measurements**: 10-200 cm (4-79 inches) - reasonable ranges for body parts
- **Date**: Valid date, not in future (optional warning)

## Success Criteria

- ✅ User can log measurements with all required fields
- ✅ Measurements are stored in localStorage
- ✅ User can view measurement history
- ✅ User can edit/delete measurements
- ✅ Progress charts show measurement changes over time
- ✅ Form validation prevents invalid data
- ✅ Mobile-responsive design
- ✅ Data export/import includes measurements

## Future Enhancements (Out of Scope)

- Photo uploads for progress photos
- Body composition analysis
- BMI calculation and tracking
- Goal setting for measurements
- Reminders for measurement days
- Integration with fitness trackers
- Advanced analytics and predictions
