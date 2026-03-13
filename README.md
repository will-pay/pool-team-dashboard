# Pool Team Dashboard

A single-page web application for managing the "Sticks & Stoned" competitive pool team. Features automatic GitHub-based data persistence, player statistics tracking, match scheduling, and league standings management.

**Live Site**: GitHub Pages
**Repository**: https://github.com/will-pay/pool-team-dashboard

---

## Quick Start for Agents

This README provides complete context for understanding and working with this project. Read the sections below to get up to speed quickly.

---

## Technology Stack

### Frontend
- **Vanilla JavaScript** (ES6+) - No frameworks, ~943 lines in `script.js`
- **HTML5** - Single page structure in `index.html`
- **CSS3** - Custom dark theme, ~1043 lines in `styles.css`
- **GitHub API** - Automated data persistence to repository

### Backend/Storage
- **GitHub Repository** - Version-controlled data storage in `team-data.json`
- **localStorage** - Offline caching and immediate saves

### Deployment
- **GitHub Pages** - Static site hosting

---

## Project Structure

```
pool-team-dashboard/
├── index.html              # Main HTML page (5.6 KB)
│                          # Contains three tabs: Schedule, My Team, Other Teams
│
├── script.js              # Core application logic (943 lines, 33.9 KB)
│                          # Data management, GitHub sync, UI rendering
│
├── styles.css             # Complete styling (1043 lines, 20.1 KB)
│                          # Dark theme, responsive design, animations
│
├── github-sync.js         # GitHub API integration module
│                          # Handles automated commits to repository
│
├── team-data.json         # Data storage file (committed to repo)
│                          # Contains all schedule, player, and team data
│
├── GITHUB_SETUP.md        # GitHub token setup instructions
│
├── team_data.csv          # Sample CSV data template
│
└── README.md              # This file
```

---

## Key Features

### 1. Schedule Management (Tab 1)
- **View** upcoming matches with date, opponent, location, league ranking
- **Add** new matches with date picker, opponent autocomplete, location input
- **Edit/Delete** existing matches inline
- **Sorting** chronological by date
- **Autocomplete** opponent names from league standings

**Location**: `index.html` lines 32-68, `script.js` renderSchedule() at ~line 200

### 2. Roster Management - My Team (Tab 2)
- **Display** 8 team players with full statistics:
  - Name, Skill Level (2-8), Wins, Losses, Win %, Avg PPM (Points Per Match)
- **Sortable** table headers (click to toggle asc/desc)
- **Default sort** by Average PPM descending
- **Color-coded** skill level badges:
  - Blue (SL 2-4): Beginner/Intermediate
  - Orange (SL 5-6): Advanced
  - Red (SL 7-8): Expert
- **Add** players with validation
- **Edit/Delete** player records inline
- **Math expressions** supported in inputs (e.g., "10+2" → 12)

**Location**: `index.html` lines 70-113, `script.js` renderPlayers() at ~line 300

### 3. League Standings - Other Teams (Tab 3)
- **View** all 16 league teams ranked by points
- **Top 3 badges**: Gold (#1), Silver (#2), Bronze (#3)
- **Highlight** user's team ("Sticks & Stoned") with green background
- **Add/Update** opponent teams
- **Edit/Delete** team records inline
- **Math expressions** supported in inputs

**Location**: `index.html` lines 115-153, `script.js` renderTeams() at ~line 450

### 4. Automatic Data Persistence
- **GitHub API sync** - Automatic commits on every data change
- **localStorage cache** - Immediate saves, works offline
- **Version control** - Full history of all changes in Git
- **Cross-device sync** - Latest data loaded on page refresh
- **Graceful degradation** - Falls back to localStorage if GitHub unavailable

**Location**: `github-sync.js` all lines

---

## Data Models

### Schedule Entry
```javascript
{
  id: timestamp,              // Unique ID (Date.now())
  date: "YYYY-MM-DD",        // Match date
  opponent: "Team Name",      // Opponent team name
  opponentTeamId: teamId,     // Link to team in standings
  location: "Venue"          // Location/venue name
}
```

### Player Record
```javascript
{
  id: timestamp,              // Unique ID
  name: "Player Name",        // Player's name
  skillLevel: 2-8,           // APA skill level (integer)
  wins: number,              // Total wins
  losses: number,            // Total losses
  matchesPlayed: wins + losses,  // Calculated
  avgPPM: 0-2                // Average points per match (float)
}
```

### Team Record
```javascript
{
  id: timestamp,              // Unique ID
  name: "Team Name",          // Team name
  points: number             // League points
}
```

---

## Code Architecture

### Global State (`script.js`)
```javascript
let scheduleData = [];    // Array of schedule entries
let playerData = [];      // Array of player records
let teamData = [];        // Array of team records
let currentSort = { ... } // Current table sort state
```

### Key Functions

#### Data Management
- `loadData()` - Loads from GitHub or localStorage fallback
- `saveData()` - Saves to localStorage and syncs to GitHub
- `initializeDefaultData()` - Sets up default team data

#### Rendering
- `renderSchedule()` - Renders schedule table (line ~200)
- `renderPlayers()` - Renders player roster table (line ~300)
- `renderTeams()` - Renders league standings table (line ~450)

#### CRUD Operations
- `addMatch()`, `editMatch()`, `deleteMatch()` - Schedule management
- `addPlayer()`, `editPlayer()`, `deletePlayer()` - Player management
- `addTeam()`, `editTeam()`, `deleteTeam()` - Team management

#### Utilities
- `evaluateExpression(str)` - Parses math expressions (e.g., "10+2")
- `sortTable(data, key, order)` - Generic table sorting
- `showAutocomplete(input, suggestions, callback)` - Autocomplete dropdown

#### GitHub API (`github-sync.js`)
- `initializeGitHub()` - Sets up GitHub API connection
- `loadDataFromGitHub()` - Fetches data from repository
- `saveDataToGitHub(data)` - Commits data changes to repository
- `saveAllDataToGitHub()` - Helper to save all data types

### Event Handling
- **Tab switching**: Click handlers on tab buttons
- **Form submissions**: Add new entries
- **Inline editing**: Click edit button → transform row to form
- **Table sorting**: Click column headers
- **Autocomplete**: Keyboard navigation (arrows, enter, escape)

---

## Default Data

The app ships with pre-loaded data for demonstration:

### Players (8)
- Will (SL 4, 10W-8L, 2.00 PPM)
- Andrew (SL 2, 4W-15L, 0.75 PPM)
- Will H, Noah, Scott, Sarah, Jacob, Max

### Teams (16)
- Ranked from "H8 it or love it" (88 pts) to "8 Balls Deep" (22 pts)
- User's team: "Sticks & Stoned" (58 pts, rank #9)

### Matches (5)
- March 11, 18, 25; April 1, 8
- Locations: aunt ginnys, brooklyn billiards

**Location**: `script.js` initializeDefaultData() at ~line 100

---

## Design System

### Color Palette (Dark Theme)
```css
--primary-bg: #0d1117      /* Very dark blue background */
--secondary-bg: #161b22    /* Dark blue cards/containers */
--tertiary-bg: #1c2128     /* Slightly lighter sections */
--accent: #3fb950          /* Vibrant green accent */
--text-primary: #e6edf3    /* Light gray text */
--border: #30363d          /* Subtle borders */
```

### Typography
- **UI Font**: Inter (Google Fonts)
- **Data Font**: JetBrains Mono (monospace for tables)

### Responsive Breakpoints
- **Desktop**: Default (>768px)
- **Tablet**: 768px and below
- **Mobile**: 425px and below

### UI Components
- **Tab Navigation**: Green underline on active tab
- **Tables**: Hover effects, sortable headers with arrows
- **Forms**: Inline editing, green focus states
- **Buttons**: Icon buttons (✏️ ✓ ✕ 🗑️) with hover effects
- **Badges**: Skill level (color-coded), Rank (gold/silver/bronze)

**Location**: `styles.css` (all 1043 lines)

---

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/will-pay/pool-team-dashboard.git
cd pool-team-dashboard
```

### 2. GitHub API Configuration (Required for auto-sync)
For automatic data persistence:
1. Create GitHub Personal Access Token with `repo` scope
2. Add token to `github-sync.js` GITHUB_CONFIG.token
3. Verify repository owner and name are correct
4. Commit and push changes

See `GITHUB_SETUP.md` for detailed instructions.

### 3. Local Development
Simply open `index.html` in a browser:
```bash
open index.html
# or
python3 -m http.server 8000  # Then visit http://localhost:8000
```

### 4. Deploy to GitHub Pages
Already configured. Push to `main` branch:
```bash
git add .
git commit -m "Update"
git push origin main
```

---

## Development Notes

### Important Patterns

#### 1. Inline Editing Pattern
When user clicks edit button:
1. Store original row HTML
2. Transform row into form with inputs
3. Pre-fill inputs with current values
4. Replace edit/delete buttons with save/cancel
5. On save: validate → update data → re-render
6. On cancel: restore original HTML

**Example**: See `editPlayer()` in `script.js` line ~400

#### 2. Math Expression Support
Inputs support simple math for quick calculations:
- "10+2" → 12
- "100-5" → 95
- Useful for incrementing wins/losses or adjusting points

**Implementation**: `evaluateExpression()` in `script.js` line ~850

#### 3. GitHub Sync Flow
```
User Action → Update Local State → Save to localStorage → Commit to GitHub
                                                              ↓
Other Device → Page Load → Fetch from GitHub → Update Local State → Render UI
```

**Implementation**: `github-sync.js` all lines, `script.js` save functions

### Common Tasks

#### Add a New Tab
1. Add tab button in `index.html` header
2. Add content section with `tab-content` class
3. Add click handler in `script.js`
4. Create render function for new data
5. Update `loadData()` and `saveData()`

#### Add a New Field to Player
1. Update `initializeDefaultData()` player objects
2. Add column to table header in `index.html`
3. Update `renderPlayers()` to display field
4. Add input to edit form in `editPlayer()`
5. Update save logic to capture new field

#### Customize Theme Colors
1. Edit CSS variables in `styles.css` lines 1-20
2. Update color references throughout CSS
3. Consider contrast ratios for accessibility

---

## File-Specific Reference

### `index.html` (5.6 KB)
- Lines 1-31: Header, navigation, tabs
- Lines 32-68: Schedule tab structure
- Lines 70-113: Roster (My Team) tab structure
- Lines 115-153: League standings (Other Teams) tab structure
- Lines 122-127: Script tags for github-sync.js and script.js

### `script.js` (943 lines, 33.9 KB)
- Lines 1-50: Global state and initialization
- Lines 51-150: Default data definitions
- Lines 151-250: Schedule management functions
- Lines 251-450: Player management functions
- Lines 451-650: Team management functions
- Lines 651-750: Utility functions (sorting, autocomplete)
- Lines 751-850: Math expression evaluator
- Lines 851-943: Event listeners and initialization

### `styles.css` (1043 lines, 20.1 KB)
- Lines 1-100: CSS variables, resets, global styles
- Lines 101-300: Layout (container, header, tabs)
- Lines 301-600: Table styles (headers, rows, sorting indicators)
- Lines 601-800: Form styles (inputs, buttons, badges)
- Lines 801-900: Autocomplete dropdown
- Lines 901-1043: Responsive media queries

### `github-sync.js` (~200 lines)
- Lines 1-10: GitHub repository configuration
- Lines 11-50: Initialization and config check
- Lines 51-95: Load data from GitHub API
- Lines 96-170: Save/commit data to GitHub API
- Lines 171-180: Helper functions

---

## Git History

7 commits showing evolution:
1. Initial commit - Foundation
2. Add default data - Pre-loaded team info
3. Mobile optimization - 375px responsive design
4. Major redesign - Pool table theme
5. Improve readability - Enhanced layouts
6. Optimize columns - Content-width table sizing
7. Dark theme - Current minimalist aesthetic

---

## Browser Compatibility

- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓

Requires:
- ES6 support (const, let, arrow functions, template literals)
- CSS Grid and Flexbox
- localStorage API
- Fetch API (for GitHub API)

---

## Performance Considerations

- **No external frameworks**: Minimal bundle size (~60 KB total)
- **localStorage cache**: Instant saves, reduces API calls
- **Event delegation**: Minimizes event listeners
- **CSS Grid/Flexbox**: Efficient responsive layouts
- **GitHub API**: Efficient JSON-based data transfer

---

## Future Enhancement Ideas

- Match result recording (individual game scores)
- Player statistics graphs/charts
- Season history and archives
- Push notifications for upcoming matches
- Tournament bracket management
- Photo uploads for team/players
- Export data to CSV/PDF
- Advanced statistics (streak tracking, head-to-head records)
- GitHub Actions for automated backups

---

## Troubleshooting

### Data not syncing across devices
1. Check GitHub token in `github-sync.js` GITHUB_CONFIG.token
2. Verify repository owner and name are correct
3. Check browser console for errors
4. Confirm token has `repo` scope permissions
5. Check GitHub API rate limits (5000/hour authenticated)

### Tables not sorting
1. Check `currentSort` global state
2. Verify click handlers attached in `script.js` line ~900
3. Inspect `sortTable()` function for errors

### Autocomplete not working
1. Verify `teamData` is populated
2. Check `showAutocomplete()` implementation line ~700
3. Ensure CSS for `.autocomplete-items` is loaded

### Mobile layout broken
1. Check viewport meta tag in `index.html` line 5
2. Verify media queries in `styles.css` lines 901-1043
3. Test in device emulator with proper screen size

---

## License & Credits

Created for the "Sticks & Stoned" pool team.
Repository: https://github.com/will-pay/pool-team-dashboard

---

## Quick Reference for Agents

**To modify player stats**: Edit `renderPlayers()` in `script.js` ~line 300
**To change theme colors**: Edit CSS variables in `styles.css` lines 1-20
**To add new match**: Use `addMatch()` function ~line 200
**To customize default data**: Edit `defaultData` object in `script.js` ~line 2
**To update GitHub config**: Edit `GITHUB_CONFIG` in `github-sync.js` lines 3-9

**Primary files to understand**:
1. `script.js` - All application logic
2. `styles.css` - All visual design
3. `github-sync.js` - Data synchronization via GitHub API

This README provides complete context. Start here, then dive into specific files as needed.
