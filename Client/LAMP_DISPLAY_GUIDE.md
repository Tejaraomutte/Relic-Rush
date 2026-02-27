# LampDisplay Component Integration Guide

## Overview
The LampDisplay component is a reusable, responsive component that displays lamps in your Relic Rush game. It integrates with the global lamp state system and provides visual feedback for the game progression.

## Setup Instructions

### 1. Add Lamp Image
Place your `lamp.png` file in:
```
src/assets/lamp.png
```

### 2. Component Files Created
- `src/components/LampDisplay.jsx` - Main component
- `src/styles/LampDisplay.css` - Component styles
- `src/App.jsx` - Updated with lamp state management

### 3. State Management

#### Initial Setup (App.jsx)
The lamp count is managed globally in `App.jsx` using React hooks:
- Initialized from localStorage on app mount
- Default: 4 lamps
- Synced to localStorage on every state change
- Passed to components as props

#### How Lamps Are Reduced
1. **Round 1**: User completes → calls `reduceLamps()` → 4 → 3
2. **Round 2**: User completes → calls `reduceLamps()` → 3 → 2
3. **Round 3**: User completes → calls `reduceLamps()` → 2 → 1
4. **Results**: Shows final lamp with glow animation

## Component Usage

### Basic Usage
```jsx
import LampDisplay from '../components/LampDisplay'

<LampDisplay 
  lampsRemaining={3} 
  showMessage={false}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lampsRemaining` | number | 4 | Current number of lamps to display |
| `showMessage` | boolean | false | Show victory message when `lampsRemaining === 1` |

### Results Page Usage
```jsx
<LampDisplay 
  lampsRemaining={lampsRemaining} 
  showMessage={true}
/>
```

## Features

### Default State (Multiple Lamps)
- Displays all remaining lamps in a centered grid
- Responsive layout adapts to screen size
- Shows counter: "X of 4 Lamps Remaining"
- Subtle hover effects on lamps
- Smooth transitions when lamps reduce

### Victory State (1 Lamp Remaining)
- Activates golden glow animation
- Shows mystical shadow/aura effect
- Displays victory message:
  - "You Have Found The True Relic!"
  - "The final lamp reveals your mystical triumph"
- Enhanced visual emphasis with darker background
- Stronger drop-shadow effects

### Animations
- **Lamp Glow**: Continuous pulse effect on final lamp
- **Glowing Aura**: Radial glow around the final lamp
- **Fade Out**: Smooth disappearance when lamps reduce
- **Message Appear**: Fade-in with slight scale effect
- **Hover Effect**: Lamp brightens on hover

## Styling Details

### Colors & Theme
- **Primary Gold**: `#daa520` (Goldenrod)
- **Dark Background**: Dark purple/midnight blue gradient
- **Accent**: Semi-transparent gold with drop shadows
- **Border**: Gold-tinted with shadow effects

### Responsive Breakpoints
- **Desktop (>768px)**: 120px lamps, 2rem gaps
- **Tablet (768px-480px)**: 100px lamps, 1rem gaps
- **Mobile (<480px)**: 80px lamps, 0.8rem gaps

## Integration Points

### App.jsx
```jsx
// Manage lamp state globally
const [lampsRemaining, setLampsRemaining] = useState(4)

// Reduce lamps after each round
const reduceLamps = () => {
  setLampsRemaining(prev => Math.max(prev - 1, 1))
}

// Pass to Round pages
<Route path="/round1" element={<Round1 reduceLamps={reduceLamps} />} />

// Pass final state to Results
<Route path="/results" element={<Results lampsRemaining={lampsRemaining} />} />
```

### Round Pages
```jsx
// Accept reduceLamps prop
export default function Round1({ reduceLamps }) {
  // ... round logic ...
  
  // Call before navigation
  if (reduceLamps) reduceLamps()
  navigate('/round2')
}
```

### Results Page
```jsx
// Receive lampRemaining from App
<LampDisplay 
  lampsRemaining={lampsRemaining} 
  showMessage={true}
/>
```

## localStorage Integration

The component uses localStorage to persist lamp state:

```javascript
// Read lamp count
const lampsRemaining = localStorage.getItem('lampsRemaining') || 4

// Update lamp count
localStorage.setItem('lampsRemaining', newCount.toString())

// Reset (on home return)
localStorage.removeItem('lampsRemaining')
```

## Customization

### Change Lamp Size
Edit `LampDisplay.css`:
```css
.lamp-item {
  width: 120px;    /* Change this */
  height: 120px;   /* And this */
}
```

### Adjust Glow Color
Edit `LampDisplay.css`:
```css
@keyframes lampGlow {
  50% {
    filter: drop-shadow(0 4px 20px rgba(218, 165, 32, 0.6));
    /* Change rgba values: (R, G, B, Alpha) */
  }
}
```

### Modify Animation Speed
```css
animation: lampGlow 3s ease-in-out infinite;
/* Change 3s to desired duration */
```

## Browser Compatibility
- Modern browsers with CSS Grid and Flexbox support
- CSS keyframe animations
- CSS filters and drop-shadows
- Works on all modern devices

## Performance Considerations
- Component uses React.memo for optimization
- CSS animations run on GPU
- No expensive re-renders on prop changes
- Smooth 60fps animations with `cubic-bezier` timing

## Troubleshooting

### Lamp Image Not Showing
- Ensure `lamp.png` is in `src/assets/`
- Check image file format and size
- Verify import path in component

### Animations Not Working
- Check browser support for CSS keyframes
- Verify CSS file is imported correctly
- Check browser DevTools for CSS errors

### State Not Updating
- Ensure `reduceLamps` is passed from parent
- Check localStorage in browser DevTools
- Verify App.js state management

## Testing

To test the lamp system:
1. Start on Home page → 4 lamps should display
2. Complete Round 1 → should reduce to 3
3. Complete Round 2 → should reduce to 2
4. Complete Round 3 → should reduce to 1
5. Glow animation should activate
6. Victory message should appear

Open DevTools Console and check:
```javascript
localStorage.getItem('lampsRemaining')
```

## Files Modified
- `src/App.jsx` - Added lamp state management
- `src/pages/Round1.jsx` - Added reduceLamps integration
- `src/pages/Round2.jsx` - Added reduceLamps integration
- `src/pages/Round3.jsx` - Added reduceLamps integration
- `src/pages/Results.jsx` - Integrated LampDisplay component

## Files Created
- `src/components/LampDisplay.jsx` - New component
- `src/styles/LampDisplay.css` - Component styles
- `src/assets/` - Directory for lamp image (must add lamp.png)
