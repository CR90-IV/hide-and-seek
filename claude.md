# Claude Context: Hider Cheat Sheet

## About Jet Lag: The Game

This application is designed for playing **Jet Lag: The Game**, a physically and mentally demanding hide-and-seek game played across large geographic areas (potentially spanning multiple days). The game is based on the popular YouTube series "Jet Lag: The Game."

### Game Mechanics

**Players:** The game involves two roles:
- **Hiders**: Choose and travel to a hiding zone within the map, then work to remain undiscovered
- **Seekers**: Use strategic questions to locate hiders while managing question costs

**Objective:** The hider who stays hidden the longest wins.

### The Seeking System

Seekers have access to **80 questions across 6 categories** they can ask hiders at any time. Hiders must respond truthfully, but each answer costs the seeker because the hider receives cards from their deck as compensation.

**The 6 Question Categories:**

1. **MATCHING QUESTIONS** (Answer: Yes/No | Reward: Draw 3, Keep 1 | Time: 5 min)
   - Format: "Is your nearest [location] the same as my [location]?"
   - Used to determine if seeker and hider share the same nearest location of a specific type
   - Examples: airports, transit lines, parks, hospitals, museums

2. **MEASURING QUESTIONS** (Answer: Closer/Further | Reward: Draw 3, Keep 1 | Time: 5 min)
   - Format: "Compared to me, are you closer to or further from [location]?"
   - Divides the map into two zones based on distance from a reference point
   - Covers transit, borders, natural features, points of interest

3. **RADAR QUESTIONS** (Answer: Yes/No | Reward: Draw 2, Keep 1 | Time: 5 min)
   - Format: "Are you within [distance] of me?"
   - Checks if hider is within a circular radius of seeker's current position
   - Available distances: ¼, ½, 1, 3, 5, 10, 25, 50, 100 miles, or custom
   - Important: Asks about hider's actual location, not their hiding zone

4. **THERMOMETER QUESTIONS** (Answer: Hotter/Colder | Reward: Draw 2, Keep 1 | Time: 5 min)
   - Format: "After traveling [distance], am I hotter or colder?"
   - Seeker shares start location, travels a distance, then asks if they're closer (hotter) or farther (colder)
   - Available distances vary by game size (½ mile, 3 miles, 10 miles, 50 miles)
   - Special mechanic: Has START (announcement) and END (actual question) phases

5. **PHOTO QUESTIONS** (Answer: Photo or "Cannot answer" | Reward: Draw 1, Keep 1 | Time: 10-20 min)
   - Format: "Send me a photo of [subject]"
   - Hider must take and send a photo matching exact specifications
   - Requests include: buildings from transit stations, widest street, selfies, restaurant interiors
   - Cannot use Google Street View

6. **TENTACLE QUESTIONS** (Answer: Specific location | Reward: Draw 4, Keep 2 | Time: 5 min)
   - Format: "Within [distance] of me, which [location type] are you nearest to?"
   - Most expensive questions for seekers (highest card reward)
   - Only available in medium/large games
   - Used late-game to quickly narrow down dense areas

### The Hider Deck

When hiders answer questions, they draw cards from the **Hider Deck** based on the question cost:
- **Time Bonuses**: Add time to the hiding clock
- **Powerups**: Enhanced abilities or increased hand capacity (base limit: 6 cards)
- **Curses**: Create complications for the hider (forced to play)

This creates a strategic trade-off: seekers need information but give hiders powerful cards.

### How This App Fits In

This app serves as the **seeker's question management tool**. It:
- Organizes all 80 questions by category for easy browsing
- Provides WhatsApp-formatted messages for asking questions
- Tracks which questions have been used to avoid repetition
- Shows question costs (answer format and card rewards)
- Maintains history of asked questions with timestamps
- Displays response time limits and question format structure

The seeker uses this app to select appropriate questions strategically, copy them to WhatsApp to send to the hider, and track their investigation progress.

### Important Gameplay Context for Development

When modifying this app, keep in mind:

1. **Question Balance**: The six categories have different costs (card rewards) for a reason:
   - Tentacle questions are most expensive (Draw 4, Keep 2) - very powerful
   - Matching/Measuring are mid-cost (Draw 3, Keep 1) - workhorse questions
   - Radar/Thermometer are cheaper (Draw 2, Keep 1) - frequent use
   - Photo is cheapest (Draw 1, Keep 1) - confirmation tool

2. **Strategic Question Use**: Seekers must balance getting information vs. giving hiders powerful cards. Asking too many questions overwhelms seekers with curses and time bonuses for hiders.

3. **One Question at a Time**: Seekers cannot ask multiple questions simultaneously while waiting for answers. The app's history tracking helps prevent confusion about which questions are pending.

4. **Physical Game**: This is played outdoors across real geography (cities, regions). Questions reference real locations (museums, train stations, etc.) that exist on the map.

5. **WhatsApp Integration**: The game is typically played remotely via WhatsApp, which is why the app formats messages for easy copy-paste.

6. **Safety First**: Players may be separated by many miles, potentially overnight. The app's history feature helps maintain a record of the game progression.

## Project Overview

A mobile-friendly web application for managing game questions with WhatsApp integration. The app allows users to browse, select, and copy formatted questions to their clipboard for sharing via WhatsApp. It tracks which questions have been used and maintains a history of all asked questions.

**Tech Stack:** Vanilla JavaScript, Tailwind CSS (via CDN), HTML5

**Key Features:**
- Three view modes: Detail (full question cards), Overview (icon grid), History (chronological list)
- Click-to-copy functionality with WhatsApp formatting
- Persistent state management using localStorage
- Toggle questions between used/unused states
- Bottom navigation bar for view switching

## File Structure

### Core Files
- **index.html** - Main application structure, view containers, navigation
- **app.js** - Application logic, rendering, state management, event handlers
- **questions-data.js** - Question content organized by category (data source)
- **styles.css** - Custom styles, category colors, animations
- **README.md** - User-facing documentation

### Supporting Files
- **jtlg.pdf** - Game rules reference document

## Architecture & Data Flow

### State Management
```javascript
// Global state stored in localStorage
usedQuestions: string[]        // Array of "Category:Title" keys
questionHistory: object[]      // Array of {category, title, question, timestamp}
```

### Data Structure
Questions are organized in `questionsData` object:
```javascript
{
  categoryKey: {
    title: string,
    description: string,
    badges: string[],
    color: string,
    answer: string,      // Default for category
    reward: string,      // Default for category
    note?: string,       // Optional category-level note
    gridCols?: number,   // Optional grid layout (2 or 3)
    questions: [
      {
        subcategory?: string,
        items: [
          {
            title: string,
            question: string,
            icon: string,        // Material Symbols icon name
            note?: string,       // Optional item-level note
            answer?: string,     // Overrides category default
            subtitle?: string    // For grid layout cards
          }
        ]
      }
    ]
  }
}
```

### View Rendering Flow
1. **DOMContentLoaded** triggers initialization
2. **renderAllQuestions()** creates Detail view from questionsData
3. **renderOverview()** creates Overview grid
4. **renderHistory()** populates History list from localStorage
5. Event listeners attached to all interactive elements

### Copy-to-Clipboard Flow
1. User clicks question card/icon
2. Check if already used:
   - If used: toggle back to unused, don't copy
   - If not used: proceed with copy
3. Build WhatsApp-formatted message
4. Copy to clipboard via navigator.clipboard API
5. Mark as used, save to localStorage
6. Add to history with timestamp
7. Show toast notification
8. Sync state across all views

## Design System

### Transit Map Aesthetic
Inspired by metro/underground railway systems with bold colors, geometric typography, and clean layouts.

**Typography:**
- Primary: Outfit (400-800 weights)
- All text uses sentence case
- Geometric, clean sans-serif throughout

**Color Palette:**
- MATCHING: #1C3F94 (Deep Blue)
- MEASURING: #009B3A (Kelly Green)
- RADAR: #EE352E (Signal Red)
- THERMOMETER: #FCCC0A (Yellow)
- PHOTO: #00A9E0 (Sky Blue)
- TENTACLE: #6D28D9 (Purple)

**Visual Elements:**
- 20px × 20px grid background pattern
- Filled circular icon shapes with category colors
- Station-style cards with subtle shadows
- 2px borders, 4-6px border radius
- Staggered slide-in animations on load

**Icons:**
- Google Material Symbols (Outlined variant)
- Browse at: https://fonts.google.com/icons

## Key Implementation Details

### Thermometer Questions (Special Case)
Unlike other categories, thermometer questions have two buttons:
- **START**: Copies "Starting a [distance] thermometer" (doesn't mark as used)
- **END**: Copies full question with answer/reward (marks as used)

Implementation:
```javascript
// Thermometer cards have class 'thermometer-card' instead of 'question-card'
// Buttons call separate functions: copyThermometerStart() and copyThermometerEnd()
```

### State Synchronization
State must be kept in sync across:
1. Detail view (.question-card / .thermometer-card)
2. Overview view (.overview-icon)
3. localStorage (usedQuestions, questionHistory)

When marking used/unused, update ALL three locations.

### WhatsApp Message Format
```
*Category: Title*
Question text here?
Answer: answer format
_Optional note in italics_
Reward: reward amount
```

### HTML Link Handling
Notes may contain HTML links. Use `convertLinksToPlainText()` to convert:
```html
<a href="url">text</a>  →  "text: url"
```

## Development Guidelines

### Adding New Questions
1. Edit `questions-data.js` only
2. Find appropriate category
3. Add to relevant subcategory's items array
4. Include: title, question, icon, optional note
5. Use sentence case for titles
6. Choose icon from Material Symbols

### Modifying Categories
1. Update category object in `questions-data.js`
2. If changing colors, update both:
   - Category `color` field
   - Corresponding CSS class in `styles.css`
3. Update `getCategoryTextColor()` in app.js if needed

### Code Conventions
- Use camelCase for JavaScript variables/functions
- Use kebab-case for CSS classes
- Prefer const over let when possible
- Use template literals for HTML generation
- Comment sections with banner comments:
  ```javascript
  /* ============================================
     SECTION NAME
     ============================================ */
  ```

### CSS Architecture
- Tailwind utility classes for layout/spacing
- Custom classes in styles.css for:
  - Category colors (matching-header, matching-card, etc.)
  - Icon shapes (.icon-shape)
  - Card states (.card-used)
  - Animations (slide-in)
  - Bottom navigation

### Testing Checklist
When making changes, verify:
- [ ] Question copies to clipboard with correct formatting
- [ ] Used state persists across page reloads
- [ ] State syncs between Detail/Overview views
- [ ] History shows questions in chronological order
- [ ] Toggle used→unused works without copying
- [ ] Thermometer START/END buttons work correctly
- [ ] Reset button clears all state
- [ ] Bottom nav switches views correctly
- [ ] Mobile responsive (check at 320px, 375px, 768px)

## Common Tasks

### Add a New Category
1. Add category data to `questions-data.js`
2. Define category color in `styles.css`:
   ```css
   .newcategory-header { background: #COLOR; }
   .newcategory-card .icon-shape { background: #COLOR; }
   ```
3. Update `getCategoryTextColor()` in app.js
4. Add color documentation to README.md

### Add Grid Layout to Category
1. Set `gridCols: 2` or `gridCols: 3` in category data
2. Use `subtitle` field in items for secondary text
3. Cards will auto-render in grid layout

### Modify WhatsApp Message Format
Update these functions in app.js:
- `copyQuestion()` - for regular questions
- `copyThermometerEnd()` - for thermometer end
- `copyQuestionFromOverview()` - for overview mode

### Change Icon for Question
1. Browse https://fonts.google.com/icons
2. Copy icon name (e.g., "museum")
3. Update `icon` field in questions-data.js

## Performance Considerations

- **No Build Process**: Pure vanilla JS, instant reload during development
- **CDN Resources**: Tailwind CSS and Google Fonts loaded from CDN
- **localStorage**: Minimal data storage, no backend needed
- **Event Delegation**: Could be improved by using delegation on containers instead of per-card listeners
- **Rendering**: All views rendered on DOMContentLoaded; consider lazy loading for large datasets

## Browser Compatibility

**Requirements:**
- navigator.clipboard API (HTTPS required for production)
- localStorage API
- ES6+ JavaScript features (const, let, arrow functions, template literals)
- CSS Grid and Flexbox

**Tested on:**
- Mobile browsers (iOS Safari, Chrome Android)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Deployment

### GitHub Pages Deployment

**IMPORTANT:** This application is deployed to GitHub Pages. When implementing PWA features or any features that require specific file paths, use relative paths to ensure compatibility.

**Key Considerations:**

1. **Deployment URL Structure:**
   - GitHub Pages may deploy to: `https://username.github.io/repo-name/`
   - Or custom domain: `https://custom-domain.com/`
   - Use relative paths (`./ `) to work in both scenarios

2. **PWA Configuration for GitHub Pages:**
   - **manifest.json**: Use relative paths
     ```json
     {
       "start_url": "./",
       "scope": "./",
       "icons": [{ "src": "./icons/icon-192.png", ... }]
     }
     ```
   - **Service Worker**: Use relative cache paths
     ```javascript
     const ASSETS_TO_CACHE = [
       './',
       './index.html',
       './app.js',
       './questions-data.js',
       './styles.css'
     ];
     ```
   - **Service Worker Registration**: Include scope
     ```javascript
     navigator.serviceWorker.register('./sw.js', { scope: './' })
     ```

3. **HTTPS Requirements:**
   - ✅ GitHub Pages provides HTTPS automatically
   - ✅ Required for Service Workers (PWA)
   - ✅ Required for Clipboard API
   - ✅ Required for WhatsApp deep linking

4. **Static Assets Only:**
   - No backend/server required
   - All functionality client-side
   - localStorage for persistence
   - CDN for external resources (Tailwind, Google Fonts)

5. **Testing on GitHub Pages:**
   - Always test PWA install from actual GitHub Pages URL
   - Test offline mode from deployed version
   - Verify WhatsApp deep linking works from HTTPS context
   - Check that all relative paths resolve correctly

6. **Build Process:**
   - No build required (pure HTML/CSS/JS)
   - Direct git push to main/gh-pages branch
   - Changes go live immediately after push

**Deployment Checklist:**
- [ ] All paths are relative (no absolute URLs for local assets)
- [ ] Service worker cache paths match deployment structure
- [ ] Manifest start_url and scope are relative
- [ ] Icons accessible from deployed URL
- [ ] Test clipboard API on HTTPS
- [ ] Test PWA install from live URL
- [ ] Verify offline functionality post-deployment

## Future Enhancement Ideas

- Search/filter functionality
- Export history to CSV
- Import custom question sets
- Dark mode support
- Offline PWA capabilities
- Undo last action
- Keyboard shortcuts
- Bulk operations (mark multiple as used)
- Question categories can be collapsed/expanded
- Share link to specific question
