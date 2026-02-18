# Relic Rush - Testing Guide

## 🧪 Complete Testing Checklist

### Phase 1: Home Page Testing

#### Visual Elements
- [ ] 4 Arabian lamps visible and centered
- [ ] Lamps are glowing with golden animation
- [ ] Title "RELIC RUSH" displays with gradient effect
- [ ] Subtitle "Find the True Relic Among the Fakes" visible
- [ ] Description text displays
- [ ] Stars twinkling in background
- [ ] Footer text visible at bottom

#### Button Functionality
- [ ] "Enter the Desert" button visible and styled
- [ ] Button glows on hover
- [ ] Button lifts on hover (transform effect)
- [ ] Clicking button with no login → redirects to login.html
- [ ] Clicking button with login → redirects to round1.html

#### Responsive Design
- [ ] Mobile view (480px): All lamps stack properly
- [ ] Tablet view (768px): Proper spacing maintained
- [ ] Desktop view: Full layout displayed

---

### Phase 2: Login Page Testing

#### Form Elements
- [ ] Email input field visible
- [ ] Password input field visible
- [ ] Email label colored in desert gold
- [ ] Password label colored in desert gold
- [ ] Input fields have proper styling (glassmorphism)
- [ ] Placeholder text visible

#### Form Validation
- [ ] Empty form submission shows error message
- [ ] Invalid email format shows error message
- [ ] Short password (< 6 chars) shows error message
- [ ] All error messages have red background

#### Submit Functionality
- [ ] Submit button visible and styled
- [ ] Spinner shows during submission
- [ ] Successful login shows success message
- [ ] Failed login shows error message
- [ ] User object stored in localStorage:
  ```javascript
  localStorage.getItem('user')
  // Should return: { email, name, id }
  ```
- [ ] Scores initialized:
  ```javascript
  localStorage.getItem('round1Score') // "0"
  localStorage.getItem('round2Score') // "0"
  localStorage.getItem('round3Score') // "0"
  localStorage.getItem('lampsRemaining') // "4"
  ```

#### After Successful Login
- [ ] Redirect to round1.html after 1.5s
- [ ] Smooth animation during redirect

---

### Phase 3: Round 1 Testing

#### Header Display
- [ ] Title shows "ROUND 1" with gradient
- [ ] Lamps indicator shows "4 Lamps Remaining"
- [ ] Timer displays "5:00" initially
- [ ] "Time Remaining:" label visible

#### Question Display
- [ ] Question text displays: "Q1. Find the intruder"
- [ ] Question image displays (q1.webp)
- [ ] Options grid shows 5 options
- [ ] Each option has proper styling

#### Timer Functionality
- [ ] Timer counts down second by second
- [ ] Format is MM:SS (5:00 → 4:59 → ... → 0:00)
- [ ] At > 30s: Gold color
- [ ] At 30-10s: Changes to orange, animation changes
- [ ] At < 10s: Changes to red, faster pulse animation
- [ ] At 0:00: Auto-submits round

#### Option Selection
- [ ] Clicking option removes selection from others
- [ ] Selected option highlights with golden border
- [ ] Selected option shows golden glow
- [ ] Selection persists when clicking "Submit Answer"

#### Submit Functionality
- [ ] "Submit Answer →" button visible
- [ ] Selecting answer then clicking Submit → next question
- [ ] If no answer selected → error message
- [ ] After question 5 submitted → calculates score
- [ ] Score calculation correct (5 questions max)

#### Score Submission
- [ ] Score submitted to backend API
- [ ] localStorage['round1Score'] updated
- [ ] lampsRemaining decremented to 3
- [ ] Success message shows
- [ ] Redirects to round2.html after 2s

---

### Phase 4: Round 2 Testing

#### Header Display
- [ ] Title shows "ROUND 2" with gradient
- [ ] Lamps indicator shows "3 Lamps Remaining"
- [ ] Timer shows "5:00" initially

#### Questions
- [ ] 5 new questions display correctly
- [ ] Question 1: "What does CSS stand for?"
- [ ] Question 2: "Which of these is NOT a JavaScript data type?"
- [ ] Question 3: "What is the time complexity of binary search?"
- [ ] Question 4: "In what year was Python first released?"
- [ ] Question 5: "What does REST stand for?"

#### Flow Identical to Round 1
- [ ] Timer counts down (5 min)
- [ ] Options select/deselect properly
- [ ] Submit button advances questions
- [ ] Score calculates on completion
- [ ] Score submitted to backend
- [ ] lampsRemaining decrements to 2

---

### Phase 5: Round 3 Testing

#### Header Display
- [ ] Title shows "ROUND 3" with gradient
- [ ] Lamps indicator shows "2 Lamps Remaining"
- [ ] Timer shows "5:00" initially

#### Questions
- [ ] 5 new questions display correctly
- [ ] All questions and options render properly

#### Completion
- [ ] Score calculates correctly
- [ ] Score submitted to backend
- [ ] lampsRemaining set to 1
- [ ] Redirects to result.html

---

### Phase 6: Result Page Testing

#### Visual Display
- [ ] Page loads with proper styling
- [ ] Title "JOURNEY'S END" displays
- [ ] Final lamp visible and much larger
- [ ] Final lamp glows with ultra-bright animation
- [ ] Lamp glows with 50px+ shadow radius
- [ ] Victory message displays: "You Have Found The True Relic!"
- [ ] Subtitle: "Your mystical journey is complete"

#### Score Display
- [ ] Score card visible with rounded corners
- [ ] "Round 1 Score" label + value
- [ ] "Round 2 Score" label + value
- [ ] "Round 3 Score" label + value
- [ ] "Total Score" in different color (cyan)
- [ ] All scores correctly sum from localStorage
- [ ] Scores animate in with stagger effect

#### Leaderboard
- [ ] "Top 10 Winners" heading visible
- [ ] Leaderboard loads from backend
- [ ] Shows rank, name, score columns
- [ ] Top 10 entries displayed
- [ ] No more than 10 rows shown
- [ ] Proper spacing and styling

#### Buttons
- [ ] "Return Home" button visible
- [ ] "Share Score" button visible
- [ ] Both buttons have proper styling
- [ ] "Return Home" clears localStorage and goes to index.html
- [ ] "Share Score" copies text to clipboard
- [ ] "Share Score" shows success message

---

### Phase 7: API Integration Testing

#### Backend Requirements (Must Exist)
- [ ] Server running on http://localhost:5000
- [ ] POST /login endpoint responds
- [ ] POST /submit-score endpoint responds
- [ ] GET /leaderboard endpoint responds

#### Login API
- [ ] POST /login with valid credentials returns user data
- [ ] POST /login with invalid credentials returns error
- [ ] Response includes: id, name, or message

#### Submit Score API
- [ ] POST /submit-score saves round scores
- [ ] Accepts: email, round, score
- [ ] Returns success response

#### Leaderboard API
- [ ] GET /leaderboard returns array of scores
- [ ] Returns up to 10 entries
- [ ] Each entry has: name, email, totalScore

---

### Phase 8: LocalStorage Testing

#### After Login
```javascript
// Check in DevTools > Application > Local Storage
localStorage.getItem('user')         // Should exist
localStorage.getItem('round1Score')  // "0"
localStorage.getItem('round2Score')  // "0"
localStorage.getItem('round3Score')  // "0"
localStorage.getItem('lampsRemaining') // "4"
```

#### After Each Round
- [ ] round1Score updated after Round 1
- [ ] round2Score updated after Round 2
- [ ] round3Score undefined after Round 3 (set on timer end)
- [ ] lampsRemaining decrements: 4 → 3 → 2 → 1

#### After Result Page
- [ ] All scores persist until "Return Home" clicked
- [ ] Clicking "Return Home" clears score-related data
- [ ] User data can be cleared if wanted

---

### Phase 9: Animation Testing

#### On Home Page
- [ ] Title fades in and slides down
- [ ] Lamps fade in with scale effect
- [ ] Lamps glow continuously
- [ ] Stars twinkle smoothly
- [ ] Button glows on hover

#### On Round Pages
- [ ] Timer changes color smoothly
- [ ] Card slides up on load
- [ ] Options have hover effects
- [ ] Selection highlights smoothly
- [ ] Success message appears with animation

#### On Result Page
- [ ] Lamp appears with scale + rotation transform
- [ ] Victory message fades in after delay
- [ ] Score values animate in with stagger
- [ ] Final lamp pulses continuously

---

### Phase 10: Responsive Design Testing

#### Mobile (480px width)
```css
/* Expected changes:
- Event title: 2rem
- Lamps: 50×60px (smaller)
- All content stacked
- Buttons: Full width
- Scores: Single column
*/
```
- [ ] All content visible without horizontal scroll
- [ ] Touch targets (buttons) > 44×44px
- [ ] Text readable without zoom

#### Tablet (768px width)
```css
/* Expected changes:
- Event title: 2.5rem
- Lamps: 60×75px (medium)
- Some content side-by-side
- Proper spacing
*/
```
- [ ] Layout adapts properly
- [ ] Touch interactions work

#### Desktop (1200px width)
```css
/* Full layout with maximum effects */
```
- [ ] All animations smooth
- [ ] Hover effects work
- [ ] Maximum visual impact

---

### Phase 11: Error Handling Testing

#### Network Errors
- [ ] No internet → shows error message
- [ ] Backend down → shows connection error
- [ ] Invalid response → handles gracefully

#### Form Validation
- [ ] Empty fields → error messages
- [ ] Invalid email → error message
- [ ] Wrong credentials → error message

#### Timer Expiry
- [ ] Time expires → auto-submit happens
- [ ] Results calculated correctly
- [ ] User sees message before redirect

---

### Phase 12: Cross-Browser Testing

#### Chrome/Edge
- [ ] All features work
- [ ] Animations smooth
- [ ] Glassmorphism renders properly

#### Firefox
- [ ] Backdrop filters work
- [ ] Gradients render correctly
- [ ] Animations smooth

#### Safari (macOS/iOS)
- [ ] Animations smooth
- [ ] Responsive design works
- [ ] Touch interactions responsive

#### Mobile Browsers
- [ ] Portrait and landscape modes work
- [ ] Touch events work
- [ ] No horizontal scroll

---

## 🔍 Quick Debug Checklist

If something isn't working:

1. **Check Console** (F12 → Console tab)
   - Any red errors?
   - Check API URLs match

2. **Check Network** (F12 → Network tab)
   - Login API call status?
   - Leaderboard API response?
   - Any 404 errors?

3. **Check Storage** (F12 → Application → Local Storage)
   - User data stored?
   - Scores updated correctly?

4. **Check Elements** (F12 → Elements tab)
   - Elements have correct classes?
   - Inline styles applied?

5. **Check Styles** (F12 → Styles tab)
   - CSS rules applied?
   - Media queries active?

6. **Common Issues**

| Issue | Solution |
|-------|----------|
| Lamps not glowing | Check style.css is loaded |
| Timer not displaying | Check #timeDisplay element exists |
| API errors | Verify backend is running on :5000 |
| Login fails | Check network tab for response |
| Images not showing | Verify paths in assets/images/ |
| Layout broken on mobile | Check viewport meta tag |

---

## 📊 Test Results Template

```markdown
## Test Execution Date: [DATE]

### Home Page
- Lamps Display: ✅/❌
- Button Functionality: ✅/❌
- Animations: ✅/❌
- Responsive: ✅/❌

### Login Page
- Form Validation: ✅/❌
- API Integration: ✅/❌
- LocalStorage: ✅/❌

### Round Pages
- Questions Display: ✅/❌
- Timer: ✅/❌
- Scoring: ✅/❌
- Navigation: ✅/❌

### Result Page
- Final Lamp: ✅/❌
- Leaderboard: ✅/❌
- Buttons: ✅/❌

### Overall Status: PASSED/FAILED

### Notes:
[Any issues or observations]
```

---

## 🚀 Deployment Checklist

Before going live:

- [ ] All APIs implemented on backend
- [ ] Database ready for leaderboard
- [ ] Backend CORS configured properly
- [ ] API URLs point to production server
- [ ] All images optimized
- [ ] SSL certificate for HTTPS
- [ ] Performance tested
- [ ] All browsers tested
- [ ] Mobile responsiveness verified
- [ ] Error handling tested
- [ ] Backup and recovery plan ready

---

**Happy Testing! May your Relic Rush experience be smooth! 🏮✨**
