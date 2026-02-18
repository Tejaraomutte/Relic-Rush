# Relic Rush - Technical Event Website

## 🎪 Project Overview

**Relic Rush** is an immersive Arabian Nights themed technical event website where contestants complete 3 rounds of technical questions to find the "True Relic" (lamp).

### Key Features:
- ✨ **Arabian Nights Theme** with mystical animations
- 🏮 **Interactive Lamp System** - 4 lamps initially, one true winner
- 🎯 **3 Technical Rounds** with scoring and time management
- 📊 **Leaderboard System** to track top performers
- 🎨 **Glassmorphism UI** with golden glow effects
- 📱 **Fully Responsive Design** for all devices
- 🌙 **Mystical Background** with twinkling stars

---

## 📁 Project Structure

```
Client(Frontend)/
├── index.html              # Home page with lamps
├── login.html              # Login page
├── round1.html             # Round 1 questions
├── round2.html             # Round 2 questions
├── round3.html             # Round 3 questions
├── result.html             # Final results & leaderboard
├── style.css               # Main stylesheet (Arabian theme)
├── home.js                 # Home page logic
├── login.js                # Login functionality
├── round1.js               # Round 1 questions & logic
├── round2.js               # Round 2 questions & logic
├── round3.js               # Round 3 questions & logic
├── roundHelper.js          # Shared utilities
├── result.js               # Result page logic
├── script.js               # Deprecated (to be removed)
└── assets/
    └── images/             # Question images

Server(Backend)/
├── server.js               # Main server file
├── package.json            # Dependencies
├── config/
│   └── db.js               # Database configuration
├── controllers/
│   └── authController.js   # Authentication logic
├── middleware/
│   └── authMiddleware.js   # JWT middleware
├── models/
│   └── user.js             # User model
└── routes/
    └── authRoutes.js       # API routes
```

---

## 🎮 User Flow

```
Home Page (4 Glowing Lamps)
    ↓
    └─ "Enter the Desert" Button
        ↓
    Login Page (Email/Password)
        ↓ (on success, store user & initialize scores)
    Round 1 (5 Questions, 5 min timer)
        ↓ (Remove 1 lamp, 3 remain)
    Round 2 (5 Questions, 5 min timer)
        ↓ (Remove 1 lamp, 2 remain)
    Round 3 (5 Questions, 5 min timer)
        ↓ (Remove final lamp, 1 glowing lamp remains)
    Result Page
        ├─ Display final lamp with bright glow
        ├─ Show message: "You Have Found The True Relic!"
        ├─ Display scores (R1, R2, R3, Total)
        ├─ Show top 10 leaderboard
        └─ "Return Home" / "Share Score" buttons
```

---

## 🎨 Design Elements

### Color Scheme
- **Primary Gold**: `#FFD700` - Main accent color
- **Dark Purple**: `#1a0033` - Primary background
- **Navy Blue**: `#0f1419` - Secondary background
- **Desert Gold**: `#D4A574` - Subtle accents
- **Cyan**: `#00D9FF` - Active/highlight color
- **Soft Gold**: `#F4E4C1` - Text accents

### Animations
- **Lamp Glow**: Continuous pulsing golden glow
- **Lamp Disappear**: Fade-out animation with rotation when eliminated
- **Final Lamp**: Ultra-bright glowing animation
- **Button Hover**: Lift effect with enhanced glow
- **Timer Warning**: Color change (yellow → red) + scale pulse
- **Smoke Effect**: Rising, fading genie smoke from lamp

### Design Features
- Glassmorphism cards with backdrop blur
- Golden shadows and glows
- Smooth transitions and animations
- Star twinkling background
- Radial gradient backgrounds
- Box shadows for depth

---

## 📋 Features Details

### 1. Home Page
- Large "RELIC RUSH" title with golden gradient
- 4 interactive Arabian lamps that glow
- "Enter the Desert" CTA button
- Mystical background and twinkle effects
- Responsive layout

### 2. Login System
- Email and password fields
- Client-side validation
- Stores user in `localStorage`
- Initializes game state (scores, lamps)
- Error/success messages

### 3. Round Pages (1, 2, 3)
- **Question Display**:
  - Question text
  - Question image (optional)
  - Multiple choice options (text or image based)
  
- **Features**:
  - Countdown timer (5 minutes per round)
  - Lamps remaining indicator
  - Question navigation (next question button)
  - Selection highlighting
  - Time-based submission
  
- **Scoring**:
  - Auto-submit if time runs out
  - Display score after completion
  - Store scores in localStorage
  - Submit to backend API
  - Decrement lamps count

### 4. Result Page
- **Final Lamp Display**: Large, brightly glowing lamp
- **Victory Message**: "You Have Found The True Relic!"
- **Score Card**: Shows R1, R2, R3, and Total scores
- **Leaderboard**: Top 10 winners with ranks
- **Actions**: Return Home, Share Score buttons
- **Share Feature**: Copy score text to clipboard

---

## 💾 LocalStorage Schema

```javascript
{
  user: {
    email: "user@example.com",
    name: "Username",
    id: "user-id"
  },
  round1Score: "4",        // Out of 5
  round2Score: "3",        // Out of 5
  round3Score: "5",        // Out of 5
  lampsRemaining: "1"      // Decreases after each round
}
```

---

## 🔄 API Endpoints

Assuming backend runs on `http://localhost:5000`

### POST /login
```json
{
  "email": "user@email.com",
  "password": "password123"
}
```
Response:
```json
{
  "id": "user-id",
  "name": "Username",
  "message": "Login successful"
}
```

### POST /submit-score
```json
{
  "email": "user@email.com",
  "round": 1,
  "score": 4
}
```

### GET /leaderboard
Returns top scores:
```json
{
  "leaderboard": [
    { "name": "User1", "email": "user1@email.com", "totalScore": 15 },
    { "name": "User2", "email": "user2@email.com", "totalScore": 14 }
  ]
}
```

---

## 🚀 Getting Started

### Frontend Setup
1. Open the project in VS Code
2. All files are static HTML/CSS/JS - no build required
3. Start a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```
4. Open `http://localhost:8000` in browser

### Backend Setup
1. Navigate to `Server(Backend)/` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```
4. Ensure server is running on `http://localhost:5000`

---

## 📝 Question Structure

Each round has 5 questions with the following structure:

```javascript
{
  question: "Question text",
  questionImage: "path/to/image.jpg",  // Optional
  options: [
    { text: "Option 1", image: null },
    { text: "Option 2", image: null },
    // or image-based options
    { text: null, image: "path/to/option.png" }
  ],
  correct: 0  // Index of correct answer (0-3 or 0-4)
}
```

**Note**: Never modify the `questions` array - it's maintained separately per round.

---

## 🎯 Customization

### Change Theme Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary-gold: #FFD700;
    --dark-purple: #1a0033;
    /* ... update other colors ... */
}
```

### Modify Timer Duration
In each `roundX.js`:
```javascript
const ROUND_DURATION = 300; // Change from 300 seconds
```

### Add More Questions
Edit the `questions` array in each `roundX.js` file.

---

## 🐛 Troubleshooting

### Login Not Working
- Check backend is running on `localhost:5000`
- Verify API endpoints match the code
- Check browser console for errors

### Lamp Not Disappearing
- Check CSS animation is loading
- Ensure JavaScript is enabled
- Clear localStorage and refresh

### Timer Not Showing
- Check `timeDisplay` element exists in HTML
- Verify `formatTime()` function is working
- Check browser console for JavaScript errors

### Leaderboard Not Loading
- Verify `/leaderboard` endpoint is working
- Check browser network tab for API response
- Ensure CORS is configured on backend

---

## 📱 Browser Support
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🔐 Security Notes

- Passwords are validated on backend (use bcryptjs)
- JWT tokens for session management
- Validate all inputs on both frontend & backend
- Never store sensitive data in localStorage (currently just user email)

---

## 📊 Performance Optimizations

- ✅ CSS animations use GPU acceleration
- ✅ Minimal DOM manipulation
- ✅ Cached localStorage access
- ✅ Lazy loading of images
- ✅ Responsive image sizes

---

## 🎓 Educational Purpose

This project demonstrates:
- Real-time timer management
- State management with localStorage
- API integration
- CSS animations and transitions
- Responsive web design
- Event handling
- Form validation

---

## 📄 License

This project is for educational purposes. All rights reserved.

---

## 👨‍💻 Development Notes

### Key JavaScript Concepts Used:
- `localStorage` for client-side data persistence
- `async/await` for API calls
- Event listeners and delegation
- DOM manipulation and animation
- Timer intervals and countdown logic
- Array methods (map, filter, forEach)

### CSS Techniques:
- CSS Grid and Flexbox layouts
- Backdrop filters (glassmorphism)
- Gradient text and backgrounds
- CSS animations and keyframes
- Media queries for responsiveness
- CSS variables for theming

---

## 🤝 Support

For issues or questions:
1. Check the browser console for errors
2. Verify all files are in correct directories
3. Ensure backend API is running
4. Check localStorage is enabled in browser

---

**Happy questing! May you find the True Relic! 🏮✨**
