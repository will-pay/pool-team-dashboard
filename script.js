// Default Data (loads on first visit)
const defaultData = {
    scheduleData: [{"id":1773119213910,"date":"2026-03-11","opponent":"The Enablers","location":"aunt ginnys"},{"id":1773120127143,"date":"2026-03-18","opponent":"Pool Clurb","opponentTeamId":1773117926953,"location":"brooklyn billiards"},{"id":1773120169047,"date":"2026-03-25","opponent":"Off The Rails","opponentTeamId":1773117932949,"location":"aunt ginnys"},{"id":1773120305371,"date":"2026-04-01","opponent":"8 Ball Yips","opponentTeamId":1773117946061,"location":"brooklyn billiards"},{"id":1773120321846,"date":"2026-04-08","opponent":"Bank you baby","opponentTeamId":1773118117955,"location":"aunt ginnys"}],
    playersData: [{"id":1773116598241,"name":"Will","skillLevel":4,"wins":10,"losses":8,"matchesPlayed":18,"avgPPM":2},{"id":1773116742822,"name":"Andrew","skillLevel":2,"wins":4,"losses":15,"matchesPlayed":19,"avgPPM":0.75},{"id":1773116808101,"name":"Will H","skillLevel":3,"wins":9,"losses":15,"matchesPlayed":24,"avgPPM":1.6},{"id":1773116888558,"name":"Noah","skillLevel":4,"wins":8,"losses":16,"matchesPlayed":24,"avgPPM":1.67},{"id":1773116909225,"name":"Scott","skillLevel":3,"wins":3,"losses":11,"matchesPlayed":14,"avgPPM":0.67},{"id":1773116925699,"name":"Sarah","skillLevel":2,"wins":7,"losses":14,"matchesPlayed":21,"avgPPM":1.6},{"id":1773116939658,"name":"Jacob","skillLevel":3,"wins":9,"losses":13,"matchesPlayed":22,"avgPPM":1.4},{"id":1773116952207,"name":"Max","skillLevel":4,"wins":5,"losses":11,"matchesPlayed":16,"avgPPM":1.4}],
    teamsData: [{"id":1773117849067,"name":"H8 it or love it","points":88},{"id":1773117860325,"name":"Gently, pool out","points":87},{"id":1773117867120,"name":"Rack ball","points":85},{"id":1773117873962,"name":"The Enablers","points":78},{"id":1773117879883,"name":"Beer in Hand","points":74},{"id":1773117890625,"name":"Cutie Pies","points":74},{"id":1773117902166,"name":"The Crazy 8's","points":68},{"id":1773117912783,"name":"Barracuedas","points":66},{"id":1773118117955,"name":"Bank you baby","points":66},{"id":1773117803699,"name":"Sticks & Stoned","points":65},{"id":1773117919979,"name":"Gimme A Break","points":64},{"id":1773117926953,"name":"Pool Clurb","points":57},{"id":1773117932949,"name":"Off The Rails","points":56},{"id":1773117939920,"name":"Top Corner, Lovely","points":48},{"id":1773117946061,"name":"8 Ball Yips","points":43},{"id":1773117951936,"name":"8 Balls Deep","points":22}]
};

// Initialize localStorage with default data if empty
if (!localStorage.getItem('scheduleData')) {
    localStorage.setItem('scheduleData', JSON.stringify(defaultData.scheduleData));
}
if (!localStorage.getItem('playersData')) {
    localStorage.setItem('playersData', JSON.stringify(defaultData.playersData));
}
if (!localStorage.getItem('teamsData')) {
    localStorage.setItem('teamsData', JSON.stringify(defaultData.teamsData));
}

// Data Storage
let scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || [];
let playersData = JSON.parse(localStorage.getItem('playersData')) || [];
let teamsData = JSON.parse(localStorage.getItem('teamsData')) || [];

// Sorting state
let currentSort = { column: 'avgPPM', direction: 'desc' };

// Tab Switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Table Sorting
document.querySelectorAll('#players-table th.sortable').forEach(header => {
    header.addEventListener('click', () => {
        const sortColumn = header.dataset.sort;

        // Toggle direction if clicking same column
        if (currentSort.column === sortColumn) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = sortColumn;
            currentSort.direction = 'desc';
        }

        renderPlayers();
    });
});

// Schedule Management
document.getElementById('schedule-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const opponentName = document.getElementById('opponent').value;
    const month = document.getElementById('match-month').value;
    const day = document.getElementById('match-day').value;

    // Construct date string with current year
    const currentYear = new Date().getFullYear();
    const dateString = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Find matching team (case-insensitive)
    const matchingTeam = teamsData.find(team =>
        team.name.toLowerCase() === opponentName.toLowerCase()
    );

    const match = {
        id: Date.now(),
        date: dateString,
        opponent: opponentName,
        opponentTeamId: matchingTeam ? matchingTeam.id : null,
        location: document.getElementById('location').value
    };

    scheduleData.push(match);
    scheduleData.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveSchedule();
    renderSchedule();
    e.target.reset();
});

// Helper function to parse date string in local timezone
function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
}

function renderSchedule() {
    const tbody = document.getElementById('schedule-body');

    if (scheduleData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No matches scheduled</td></tr>';
        return;
    }

    // Sort teams by points to get rankings
    const sortedTeams = [...teamsData].sort((a, b) => (b.points || 0) - (a.points || 0));

    tbody.innerHTML = scheduleData.map(match => {
        // Look up current team name by ID
        let opponentDisplay = match.opponent; // Default to stored string
        let opponentTeam = null;

        if (match.opponentTeamId) {
            opponentTeam = teamsData.find(t => t.id === match.opponentTeamId);
            if (opponentTeam) {
                opponentDisplay = opponentTeam.name; // Use current team name
            }
        }

        // If no team ID match, try to find by name (case-insensitive)
        if (!opponentTeam) {
            opponentTeam = teamsData.find(t =>
                t.name.toLowerCase() === match.opponent.toLowerCase()
            );
        }

        // Get team rank (plain text, no badge styling)
        let rankDisplay = '-';
        if (opponentTeam) {
            const rank = sortedTeams.findIndex(t => t.id === opponentTeam.id) + 1;
            if (rank > 0) {
                rankDisplay = `#${rank}`;
            }
        }

        // Format date as month/day only
        const dateObj = parseLocalDate(match.date);
        const dateDisplay = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

        return `
            <tr id="match-row-${match.id}">
                <td>${dateDisplay}</td>
                <td>${rankDisplay}</td>
                <td>${opponentDisplay}</td>
                <td>${match.location}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn edit-icon" onclick="editMatch(${match.id})" title="Edit">✏️</button>
                        <button class="icon-btn delete-icon" onclick="deleteMatch(${match.id})" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteMatch(id) {
    scheduleData = scheduleData.filter(match => match.id !== id);
    saveSchedule();
    renderSchedule();
}

function editMatch(id) {
    const match = scheduleData.find(m => m.id === id);
    if (!match) return;

    const row = document.getElementById(`match-row-${id}`);
    row.classList.add('editing');

    // Extract month and day from date string
    const [year, month, day] = match.date.split('-');

    // Get current team name by ID if available
    let opponentValue = match.opponent;
    if (match.opponentTeamId) {
        const team = teamsData.find(t => t.id === match.opponentTeamId);
        if (team) {
            opponentValue = team.name;
        }
    }

    row.innerHTML = `
        <td>
            <input type="number" id="edit-match-month-${id}" value="${parseInt(month)}" min="1" max="12" style="width: 50px;">
            <input type="number" id="edit-match-day-${id}" value="${parseInt(day)}" min="1" max="31" style="width: 50px;">
        </td>
        <td></td>
        <td><input type="text" id="edit-match-opponent-${id}" value="${opponentValue}"></td>
        <td><input type="text" id="edit-match-location-${id}" value="${match.location}"></td>
        <td>
            <div class="action-buttons">
                <button class="icon-btn save-icon" onclick="saveMatch(${id})" title="Save">✓</button>
                <button class="icon-btn cancel-icon" onclick="cancelMatchEdit(${id})" title="Cancel">✕</button>
            </div>
        </td>
    `;
}

function saveMatch(id) {
    const month = document.getElementById(`edit-match-month-${id}`).value;
    const day = document.getElementById(`edit-match-day-${id}`).value;
    const opponentName = document.getElementById(`edit-match-opponent-${id}`).value;
    const location = document.getElementById(`edit-match-location-${id}`).value;

    if (!month || !day || !opponentName || !location) {
        alert('All fields are required');
        return;
    }

    // Construct date string with current year
    const currentYear = new Date().getFullYear();
    const dateString = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Find matching team
    const matchingTeam = teamsData.find(team =>
        team.name.toLowerCase() === opponentName.toLowerCase()
    );

    const match = scheduleData.find(m => m.id === id);
    if (match) {
        match.date = dateString;
        match.opponent = opponentName;
        match.opponentTeamId = matchingTeam ? matchingTeam.id : null;
        match.location = location;

        scheduleData.sort((a, b) => new Date(a.date) - new Date(b.date));
        saveSchedule();
        renderSchedule();
    }
}

function cancelMatchEdit(id) {
    renderSchedule();
}

function saveSchedule() {
    localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
}

// Player Management
document.getElementById('player-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const skillLevel = parseInt(document.getElementById('skill-level').value);
    const avgPPM = parseFloat(document.getElementById('avg-ppm').value);

    if (skillLevel < 2 || skillLevel > 8) {
        alert('Skill level must be between 2 and 8');
        return;
    }

    if (avgPPM < 0 || avgPPM > 2) {
        alert('Average PPM must be between 0 and 2');
        return;
    }

    const wins = parseInt(document.getElementById('player-wins').value);
    const losses = parseInt(document.getElementById('player-losses').value);

    const player = {
        id: Date.now(),
        name: document.getElementById('player-name').value,
        skillLevel: skillLevel,
        wins: wins,
        losses: losses,
        matchesPlayed: wins + losses,
        avgPPM: avgPPM
    };

    playersData.push(player);
    savePlayers();
    renderPlayers();
    e.target.reset();
});

function renderPlayers() {
    const tbody = document.getElementById('players-body');

    if (playersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No players added</td></tr>';
        return;
    }

    // Sort players based on current sort settings
    const sortedPlayers = [...playersData].sort((a, b) => {
        let aVal, bVal;

        switch (currentSort.column) {
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                return currentSort.direction === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);

            case 'skillLevel':
                aVal = a.skillLevel || 0;
                bVal = b.skillLevel || 0;
                break;

            case 'wins':
                aVal = a.wins || 0;
                bVal = b.wins || 0;
                break;

            case 'losses':
                aVal = a.losses || 0;
                bVal = b.losses || 0;
                break;

            case 'winPct':
                const aTotalGames = a.wins + a.losses;
                const bTotalGames = b.wins + b.losses;
                aVal = aTotalGames > 0 ? (a.wins / aTotalGames) : 0;
                bVal = bTotalGames > 0 ? (b.wins / bTotalGames) : 0;
                break;

            case 'avgPPM':
                aVal = a.avgPPM || 0;
                bVal = b.avgPPM || 0;
                break;

            default:
                aVal = a.avgPPM || 0;
                bVal = b.avgPPM || 0;
        }

        return currentSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Update header sort indicators
    document.querySelectorAll('#players-table th.sortable').forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
        if (header.dataset.sort === currentSort.column) {
            header.classList.add(`sort-${currentSort.direction}`);
        }
    });

    tbody.innerHTML = sortedPlayers.map((player, index) => {
        const avgPPM = (player.avgPPM || 0).toFixed(2);

        const totalGames = player.wins + player.losses;
        const winPct = totalGames > 0
            ? ((player.wins / totalGames) * 100).toFixed(1)
            : '0.0';

        // Add rank badge styling
        let rankClass = '';
        if (index === 0) rankClass = 'rank-gold';
        else if (index === 1) rankClass = 'rank-silver';
        else if (index === 2) rankClass = 'rank-bronze';

        // Color code skill level
        let skillClass = 'skill-low';
        if (player.skillLevel >= 7) skillClass = 'skill-high';
        else if (player.skillLevel >= 5) skillClass = 'skill-medium';

        return `
            <tr id="player-row-${player.id}">
                <td><strong>${player.name}</strong></td>
                <td><span class="skill-badge ${skillClass}">${player.skillLevel}</span></td>
                <td>${player.wins}</td>
                <td>${player.losses}</td>
                <td><strong>${winPct}%</strong></td>
                <td><strong class="ppg">${avgPPM}</strong></td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn edit-icon" onclick="editPlayer(${player.id})" title="Edit">✏️</button>
                        <button class="icon-btn delete-icon" onclick="deletePlayer(${player.id})" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function deletePlayer(id) {
    playersData = playersData.filter(player => player.id !== id);
    savePlayers();
    renderPlayers();
}

function editPlayer(id) {
    const player = playersData.find(p => p.id === id);
    if (!player) return;

    const row = document.getElementById(`player-row-${id}`);
    row.classList.add('editing');

    // Get skill class for badge
    let skillClass = 'skill-low';
    if (player.skillLevel >= 7) skillClass = 'skill-high';
    else if (player.skillLevel >= 5) skillClass = 'skill-medium';

    // Calculate current values
    const totalGames = player.wins + player.losses;
    const winPct = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : '0.0';
    const avgPPM = (player.avgPPM || 0).toFixed(2);

    // Get current rank
    const sortedPlayers = [...playersData].sort((a, b) => (b.avgPPM || 0) - (a.avgPPM || 0));
    const index = sortedPlayers.findIndex(p => p.id === id);
    let rankClass = '';
    if (index === 0) rankClass = 'rank-gold';
    else if (index === 1) rankClass = 'rank-silver';
    else if (index === 2) rankClass = 'rank-bronze';

    row.innerHTML = `
        <td><input type="text" id="edit-name-${id}" value="${player.name}"></td>
        <td><input type="text" id="edit-skill-${id}" value="${player.skillLevel}"></td>
        <td><input type="text" id="edit-wins-${id}" value="${player.wins}"></td>
        <td><input type="text" id="edit-losses-${id}" value="${player.losses}"></td>
        <td><strong>${winPct}%</strong></td>
        <td><input type="text" id="edit-avgppm-${id}" value="${avgPPM}"></td>
        <td>
            <div class="action-buttons">
                <button class="icon-btn save-icon" onclick="savePlayer(${id})" title="Save">✓</button>
                <button class="icon-btn cancel-icon" onclick="cancelEdit(${id})" title="Cancel">✕</button>
            </div>
        </td>
    `;
}

// Simple math evaluator for addition and subtraction
function evalSimpleMath(expression) {
    try {
        // Remove all whitespace
        expression = expression.toString().replace(/\s/g, '');

        // Check if expression contains only numbers, +, -, and decimal points
        if (!/^[\d+\-.]+$/.test(expression)) {
            return parseFloat(expression);
        }

        // Split by + and - while keeping the operators
        let total = 0;
        let currentNumber = '';
        let operation = '+';

        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];

            if (char === '+' || char === '-') {
                if (currentNumber) {
                    if (operation === '+') {
                        total += parseFloat(currentNumber);
                    } else if (operation === '-') {
                        total -= parseFloat(currentNumber);
                    }
                    currentNumber = '';
                }
                operation = char;
            } else {
                currentNumber += char;
            }
        }

        // Add the last number
        if (currentNumber) {
            if (operation === '+') {
                total += parseFloat(currentNumber);
            } else if (operation === '-') {
                total -= parseFloat(currentNumber);
            }
        }

        return total;
    } catch (e) {
        return parseFloat(expression);
    }
}

function savePlayer(id) {
    const name = document.getElementById(`edit-name-${id}`).value;
    const skillLevelInput = document.getElementById(`edit-skill-${id}`).value;
    const winsInput = document.getElementById(`edit-wins-${id}`).value;
    const lossesInput = document.getElementById(`edit-losses-${id}`).value;
    const avgPPMInput = document.getElementById(`edit-avgppm-${id}`).value;

    const skillLevel = Math.round(evalSimpleMath(skillLevelInput));
    const wins = Math.round(evalSimpleMath(winsInput));
    const losses = Math.round(evalSimpleMath(lossesInput));
    const avgPPM = evalSimpleMath(avgPPMInput);

    if (isNaN(skillLevel) || skillLevel < 2 || skillLevel > 8) {
        alert('Skill level must be between 2 and 8');
        return;
    }

    if (isNaN(wins) || wins < 0) {
        alert('Wins must be a positive number');
        return;
    }

    if (isNaN(losses) || losses < 0) {
        alert('Losses must be a positive number');
        return;
    }

    if (isNaN(avgPPM) || avgPPM < 0 || avgPPM > 2) {
        alert('Average PPM must be between 0 and 2');
        return;
    }

    const player = playersData.find(p => p.id === id);
    if (player) {
        player.name = name;
        player.skillLevel = skillLevel;
        player.wins = wins;
        player.losses = losses;
        player.matchesPlayed = wins + losses;
        player.avgPPM = avgPPM;

        savePlayers();
        renderPlayers();
    }
}

function cancelEdit(id) {
    renderPlayers();
}

function savePlayers() {
    localStorage.setItem('playersData', JSON.stringify(playersData));
}

// CSV Import/Export Functions
function importCSV() {
    const fileInput = document.getElementById('csv-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file to import');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n');

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',').map(v => v.trim());

            if (values.length >= 5) {
                const wins = parseInt(values[2]) || 0;
                const losses = parseInt(values[3]) || 0;
                const avgPPM = parseFloat(values[4]) || 0;

                const player = {
                    id: Date.now() + i,
                    name: values[0],
                    skillLevel: parseInt(values[1]) || 2,
                    wins: wins,
                    losses: losses,
                    matchesPlayed: wins + losses,
                    avgPPM: avgPPM
                };

                playersData.push(player);
            }
        }

        savePlayers();
        renderPlayers();
        fileInput.value = '';
        alert(`Successfully imported ${lines.length - 1} players!`);
    };

    reader.readAsText(file);
}

function downloadTemplate() {
    const csvContent = `Player Name,Skill Level,Wins,Losses,Average PPM
John Smith,7,12,3,1.85
Sarah Johnson,5,8,7,1.60
Mike Davis,3,5,10,1.20`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team_data_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Team Management
document.getElementById('team-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const team = {
        id: Date.now(),
        name: document.getElementById('team-name').value,
        points: parseInt(document.getElementById('team-points').value)
    };

    teamsData.push(team);
    teamsData.sort((a, b) => (b.points || 0) - (a.points || 0));
    saveTeams();
    renderTeams();
    e.target.reset();
});

function renderTeams() {
    const tbody = document.getElementById('teams-body');

    if (teamsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No teams added</td></tr>';
        return;
    }

    // Sort teams by points (descending)
    const sortedTeams = [...teamsData].sort((a, b) => (b.points || 0) - (a.points || 0));

    tbody.innerHTML = sortedTeams.map((team, index) => {
        // Add rank badge styling
        let rankClass = '';
        if (index === 0) rankClass = 'rank-gold';
        else if (index === 1) rankClass = 'rank-silver';
        else if (index === 2) rankClass = 'rank-bronze';

        // Check if this is the user's team
        const isMyTeam = team.name.toLowerCase() === 'sticks & stoned';
        const rowClass = isMyTeam ? 'my-team-row' : '';

        return `
            <tr id="team-row-${team.id}" class="${rowClass}">
                <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
                <td><strong>${team.name}</strong></td>
                <td>${team.points}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn edit-icon" onclick="editTeam(${team.id})" title="Edit">✏️</button>
                        <button class="icon-btn delete-icon" onclick="deleteTeam(${team.id})" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteTeam(id) {
    teamsData = teamsData.filter(team => team.id !== id);
    saveTeams();
    renderTeams();
}

function editTeam(id) {
    const team = teamsData.find(t => t.id === id);
    if (!team) return;

    const row = document.getElementById(`team-row-${id}`);
    row.classList.add('editing');

    // Get current rank
    const sortedTeams = [...teamsData].sort((a, b) => (b.points || 0) - (a.points || 0));
    const index = sortedTeams.findIndex(t => t.id === id);
    let rankClass = '';
    if (index === 0) rankClass = 'rank-gold';
    else if (index === 1) rankClass = 'rank-silver';
    else if (index === 2) rankClass = 'rank-bronze';

    row.innerHTML = `
        <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
        <td><input type="text" id="edit-team-name-${id}" value="${team.name}"></td>
        <td><input type="text" id="edit-team-points-${id}" value="${team.points}"></td>
        <td>
            <div class="action-buttons">
                <button class="icon-btn save-icon" onclick="saveTeam(${id})" title="Save">✓</button>
                <button class="icon-btn cancel-icon" onclick="cancelTeamEdit(${id})" title="Cancel">✕</button>
            </div>
        </td>
    `;
}

function saveTeam(id) {
    const name = document.getElementById(`edit-team-name-${id}`).value;
    const pointsInput = document.getElementById(`edit-team-points-${id}`).value;
    const points = Math.round(evalSimpleMath(pointsInput));

    if (!name || name.trim() === '') {
        alert('Team name cannot be empty');
        return;
    }

    if (isNaN(points) || points < 0) {
        alert('Points must be a positive number');
        return;
    }

    const team = teamsData.find(t => t.id === id);
    if (team) {
        team.name = name;
        team.points = points;

        saveTeams();
        renderTeams();
    }
}

function cancelTeamEdit(id) {
    renderTeams();
}

function saveTeams() {
    localStorage.setItem('teamsData', JSON.stringify(teamsData));
}

// Custom Autocomplete for Opponent Team
let selectedOptionIndex = -1;

function setupAutocomplete() {
    const input = document.getElementById('opponent');
    const dropdown = document.getElementById('opponent-dropdown');

    if (!input || !dropdown) return;

    // Show dropdown on focus
    input.addEventListener('focus', () => {
        showDropdownOptions('');
    });

    // Filter options as user types
    input.addEventListener('input', () => {
        const filter = input.value.toLowerCase();
        showDropdownOptions(filter);
    });

    // Handle keyboard navigation
    input.addEventListener('keydown', (e) => {
        const options = dropdown.querySelectorAll('.autocomplete-option');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedOptionIndex = Math.min(selectedOptionIndex + 1, options.length - 1);
            updateSelectedOption(options);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedOptionIndex = Math.max(selectedOptionIndex - 1, -1);
            updateSelectedOption(options);
        } else if (e.key === 'Enter' && selectedOptionIndex >= 0) {
            e.preventDefault();
            options[selectedOptionIndex].click();
        } else if (e.key === 'Escape') {
            dropdown.classList.remove('show');
            selectedOptionIndex = -1;
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
            selectedOptionIndex = -1;
        }
    });
}

function showDropdownOptions(filter) {
    const dropdown = document.getElementById('opponent-dropdown');
    if (!dropdown) return;

    // Sort teams alphabetically by name
    const sortedTeams = [...teamsData].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    // Filter teams based on input
    const filteredTeams = sortedTeams.filter(team =>
        team.name.toLowerCase().includes(filter)
    );

    if (filteredTeams.length === 0) {
        dropdown.classList.remove('show');
        return;
    }

    dropdown.innerHTML = filteredTeams.map(team => `
        <div class="autocomplete-option"
             data-value="${team.name}"
             data-team-id="${team.id}">
            ${team.name}
        </div>
    `).join('');

    // Add click handlers to options
    dropdown.querySelectorAll('.autocomplete-option').forEach(option => {
        option.addEventListener('click', () => {
            document.getElementById('opponent').value = option.dataset.value;
            // Note: The team ID will be looked up during form submission
            dropdown.classList.remove('show');
            selectedOptionIndex = -1;
        });
    });

    dropdown.classList.add('show');
    selectedOptionIndex = -1;
}

function updateSelectedOption(options) {
    options.forEach((option, index) => {
        if (index === selectedOptionIndex) {
            option.classList.add('selected');
            option.scrollIntoView({ block: 'nearest' });
        } else {
            option.classList.remove('selected');
        }
    });
}

// Initial Render
renderSchedule();
renderPlayers();
renderTeams();
setupAutocomplete();
