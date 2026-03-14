// Default Data (loads on first visit)
const defaultData = {
    scheduleData: [{"id":1773119213910,"date":"2026-03-11","opponent":"The Enablers","location":"aunt ginnys"},{"id":1773120127143,"date":"2026-03-18","opponent":"Pool Clurb","opponentTeamId":1773117926953,"location":"brooklyn billiards"},{"id":1773120169047,"date":"2026-03-25","opponent":"Off The Rails","opponentTeamId":1773117932949,"location":"aunt ginnys"},{"id":1773120305371,"date":"2026-04-01","opponent":"8 Ball Yips","opponentTeamId":1773117946061,"location":"brooklyn billiards"},{"id":1773120321846,"date":"2026-04-08","opponent":"Bank you baby","opponentTeamId":1773118117955,"location":"aunt ginnys"}],
    playersData: [{"id":1773116598241,"name":"Will","skillLevel":4,"wins":10,"losses":8,"matchesPlayed":18,"avgPPM":2},{"id":1773116742822,"name":"Andrew","skillLevel":2,"wins":4,"losses":15,"matchesPlayed":19,"avgPPM":0.75},{"id":1773116808101,"name":"Will H","skillLevel":3,"wins":9,"losses":15,"matchesPlayed":24,"avgPPM":1.6},{"id":1773116888558,"name":"Noah","skillLevel":4,"wins":8,"losses":16,"matchesPlayed":24,"avgPPM":1.67},{"id":1773116909225,"name":"Scott","skillLevel":3,"wins":3,"losses":11,"matchesPlayed":14,"avgPPM":0.67},{"id":1773116925699,"name":"Sarah","skillLevel":2,"wins":7,"losses":14,"matchesPlayed":21,"avgPPM":1.6},{"id":1773116939658,"name":"Jacob","skillLevel":3,"wins":9,"losses":13,"matchesPlayed":22,"avgPPM":1.4},{"id":1773116952207,"name":"Max","skillLevel":4,"wins":5,"losses":11,"matchesPlayed":16,"avgPPM":1.4}],
    teamsData: [{"id":1773117849067,"name":"H8 it or love it","points":88},{"id":1773117860325,"name":"Gently, pool out","points":87},{"id":1773117867120,"name":"Rack ball","points":85},{"id":1773117873962,"name":"The Enablers","points":78},{"id":1773117879883,"name":"Beer in Hand","points":74},{"id":1773117890625,"name":"Cutie Pies","points":74},{"id":1773117902166,"name":"The Crazy 8's","points":68},{"id":1773117912783,"name":"Barracuedas","points":66},{"id":1773118117955,"name":"Bank you baby","points":66},{"id":1773117803699,"name":"Sticks & Stoned","points":65},{"id":1773117919979,"name":"Gimme A Break","points":64},{"id":1773117926953,"name":"Pool Clurb","points":57},{"id":1773117932949,"name":"Off The Rails","points":56},{"id":1773117939920,"name":"Top Corner, Lovely","points":48},{"id":1773117946061,"name":"8 Ball Yips","points":43},{"id":1773117951936,"name":"8 Balls Deep","points":22}]
};

// Data Storage (will be loaded from Google Sheets)
let scheduleData = [];
let playersData = [];
let teamsData = [];

// Sorting state
let currentSort = { column: 'avgPPM', direction: 'desc' };

// Debounce timer for Google Sheets saves
let sheetsSaveTimer = null;

// Debounce function - delays execution until after wait time has elapsed since last call
function debounce(func, wait) {
    return function executedFunction(...args) {
        clearTimeout(sheetsSaveTimer);
        sheetsSaveTimer = setTimeout(() => func(...args), wait);
    };
}

// Debounced Google Sheets save function (1.5 second delay)
const debouncedSheetsSave = debounce(async (schedule, players, teams) => {
    try {
        await saveAllDataToGoogleSheets(schedule, players, teams);
        console.log('Changes synced to Google Sheets');
    } catch (error) {
        console.error('Failed to save data to Google Sheets:', error);
    }
}, 1500);

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
    const container = document.getElementById('schedule-cards');

    if (scheduleData.length === 0) {
        container.innerHTML = '<div class="empty-message">No matches scheduled</div>';
        return;
    }

    // Sort teams by points to get rankings
    const sortedTeams = [...teamsData].sort((a, b) => (b.points || 0) - (a.points || 0));

    container.innerHTML = scheduleData.map(match => {
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

        // Get team rank
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

        // Filter out deleted players from assigned players
        const validAssignedPlayers = (match.assignedPlayers || []).filter(playerId =>
            playersData.some(p => p.id === playerId)
        );

        // Get player names for display
        const playerPills = validAssignedPlayers
            .map(playerId => {
                const player = playersData.find(p => p.id === playerId);
                return player ? `<span class="player-pill-removable" data-player-id="${playerId}" onclick="showRemoveOption(${match.id}, ${playerId}, event)">${player.name}</span>` : '';
            })
            .filter(pill => pill !== '')
            .join('');

        return `
            <div class="match-card" id="match-card-${match.id}">
                <div class="match-card-header">
                    <span class="rank-badge-card">${rankDisplay}</span>
                    <div class="match-menu">
                        <button class="menu-btn" onclick="toggleMatchMenu(${match.id})">⋯</button>
                        <div class="menu-dropdown" id="menu-${match.id}">
                            <button onclick="editMatch(${match.id})">Edit</button>
                            <button onclick="deleteMatch(${match.id})">Delete</button>
                        </div>
                    </div>
                </div>
                <h2 class="opponent-name">${opponentDisplay}</h2>
                <div class="match-info">${dateDisplay} • ${match.location}</div>
                <div class="player-pills-container" id="pills-container-${match.id}">
                    ${playerPills}
                    <div class="add-player-wrapper" id="add-wrapper-${match.id}">
                        <button class="add-player-btn" onclick="showPlayerInput(${match.id})" id="add-btn-${match.id}">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleMatchMenu(matchId) {
    // Close all other menus
    document.querySelectorAll('.menu-dropdown').forEach(menu => {
        if (menu.id !== `menu-${matchId}`) {
            menu.classList.remove('show');
        }
    });

    // Toggle current menu
    const menu = document.getElementById(`menu-${matchId}`);
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.match-menu')) {
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

function deleteMatch(id) {
    if (confirm('Delete this match?')) {
        scheduleData = scheduleData.filter(match => match.id !== id);
        saveSchedule();
        renderSchedule();
    }
}

function editMatch(id) {
    const match = scheduleData.find(m => m.id === id);
    if (!match) return;

    // Close all menus and other panels
    document.querySelectorAll('.menu-dropdown').forEach(menu => menu.classList.remove('show'));
    document.querySelectorAll('.assignment-panel-container').forEach(panel => panel.remove());
    document.querySelectorAll('.edit-panel-container').forEach(panel => panel.remove());
    document.querySelectorAll('.match-card.expanded').forEach(card => card.classList.remove('expanded'));

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

    // Create edit panel
    const matchCard = document.getElementById(`match-card-${id}`);
    matchCard.classList.add('expanded');

    const editPanel = document.createElement('div');
    editPanel.className = 'edit-panel-container';
    editPanel.id = `edit-panel-${id}`;
    editPanel.innerHTML = `
        <div class="assignment-panel">
            <div class="assignment-header">
                <h4>Edit Match Details</h4>
            </div>
            <div class="edit-form">
                <div class="form-group">
                    <label>Opponent</label>
                    <div class="autocomplete-wrapper-edit">
                        <input type="text" id="edit-opponent-${id}" value="${opponentValue}" placeholder="Team name" autocomplete="off">
                        <div id="edit-opponent-dropdown-${id}" class="autocomplete-dropdown"></div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Month</label>
                        <input type="number" id="edit-month-${id}" value="${parseInt(month)}" min="1" max="12" placeholder="MM">
                    </div>
                    <div class="form-group">
                        <label>Day</label>
                        <input type="number" id="edit-day-${id}" value="${parseInt(day)}" min="1" max="31" placeholder="DD">
                    </div>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" id="edit-location-${id}" value="${match.location}" placeholder="Location">
                </div>
            </div>
            <div class="assignment-footer">
                <span class="selection-counter" id="edit-error-${id}"></span>
                <div class="action-buttons">
                    <button class="save" onclick="saveMatchEdit(${id})">Save</button>
                    <button class="cancel" onclick="cancelMatchEdit(${id})">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Insert after match card
    matchCard.insertAdjacentElement('afterend', editPanel);

    // Setup autocomplete for opponent field
    setupEditAutocomplete(id);
}

function setupEditAutocomplete(matchId) {
    const input = document.getElementById(`edit-opponent-${matchId}`);
    const dropdown = document.getElementById(`edit-opponent-dropdown-${matchId}`);

    if (!input || !dropdown) return;

    let selectedOptionIndex = -1;

    // Show dropdown on focus
    input.addEventListener('focus', () => {
        showEditDropdownOptions(matchId, '');
    });

    // Filter options as user types
    input.addEventListener('input', () => {
        const filter = input.value.toLowerCase();
        showEditDropdownOptions(matchId, filter);
    });

    // Handle keyboard navigation
    input.addEventListener('keydown', (e) => {
        const options = dropdown.querySelectorAll('.autocomplete-option');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedOptionIndex = Math.min(selectedOptionIndex + 1, options.length - 1);
            updateSelectedOption(options, selectedOptionIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedOptionIndex = Math.max(selectedOptionIndex - 1, -1);
            updateSelectedOption(options, selectedOptionIndex);
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

function showEditDropdownOptions(matchId, filter) {
    const dropdown = document.getElementById(`edit-opponent-dropdown-${matchId}`);
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
            document.getElementById(`edit-opponent-${matchId}`).value = option.dataset.value;
            dropdown.classList.remove('show');
        });
    });

    dropdown.classList.add('show');
}

function updateSelectedOption(options, selectedIndex) {
    options.forEach((option, index) => {
        if (index === selectedIndex) {
            option.classList.add('selected');
            option.scrollIntoView({ block: 'nearest' });
        } else {
            option.classList.remove('selected');
        }
    });
}

function saveMatchEdit(id) {
    const opponent = document.getElementById(`edit-opponent-${id}`).value.trim();
    const month = document.getElementById(`edit-month-${id}`).value;
    const day = document.getElementById(`edit-day-${id}`).value;
    const location = document.getElementById(`edit-location-${id}`).value.trim();

    const errorSpan = document.getElementById(`edit-error-${id}`);

    if (!opponent || !month || !day || !location) {
        errorSpan.textContent = 'All fields are required';
        errorSpan.style.color = '#f85149';
        return;
    }

    // Validate month and day
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (monthNum < 1 || monthNum > 12) {
        errorSpan.textContent = 'Month must be between 1 and 12';
        errorSpan.style.color = '#f85149';
        return;
    }

    if (dayNum < 1 || dayNum > 31) {
        errorSpan.textContent = 'Day must be between 1 and 31';
        errorSpan.style.color = '#f85149';
        return;
    }

    // Construct date string with current year
    const currentYear = new Date().getFullYear();
    const dateString = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Find matching team
    const matchingTeam = teamsData.find(team =>
        team.name.toLowerCase() === opponent.toLowerCase()
    );

    const match = scheduleData.find(m => m.id === id);
    if (match) {
        match.date = dateString;
        match.opponent = opponent;
        match.opponentTeamId = matchingTeam ? matchingTeam.id : null;
        match.location = location;

        scheduleData.sort((a, b) => new Date(a.date) - new Date(b.date));
        saveSchedule();

        // Close panel
        cancelMatchEdit(id);

        // Re-render
        renderSchedule();
    }
}

function cancelMatchEdit(id) {
    const editPanel = document.getElementById(`edit-panel-${id}`);
    if (editPanel) {
        editPanel.remove();
    }

    const matchCard = document.getElementById(`match-card-${id}`);
    if (matchCard) {
        matchCard.classList.remove('expanded');
    }
}

// Inline Player Assignment Functions - Rewritten from scratch
function showPlayerInput(matchId) {
    console.log('showPlayerInput called for match:', matchId);

    // Close any existing dropdowns first
    closeAllPlayerInputs();

    const match = scheduleData.find(m => m.id === matchId);
    if (!match) return;

    // Check max players
    const assignedPlayers = match.assignedPlayers || [];
    if (assignedPlayers.length >= 5) {
        alert('Maximum 5 players per match');
        return;
    }

    // Check if roster has players
    if (playersData.length === 0) {
        alert('Add players to your roster first');
        return;
    }

    // Hide + button
    const addBtn = document.getElementById(`add-btn-${matchId}`);
    if (addBtn) {
        addBtn.style.display = 'none';
    }

    // All players, sorted alphabetically
    const allPlayers = [...playersData].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    // Create dropdown and append to wrapper (not container)
    const wrapper = document.getElementById(`add-wrapper-${matchId}`);
    const dropdown = document.createElement('div');
    dropdown.className = 'inline-player-dropdown';
    dropdown.id = `player-dropdown-${matchId}`;
    dropdown.innerHTML = allPlayers.map(player => `
        <div class="inline-dropdown-option" data-player-id="${player.id}">
            ${player.name}
        </div>
    `).join('');

    wrapper.appendChild(dropdown);

    // Add click handlers to each option
    dropdown.querySelectorAll('.inline-dropdown-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const playerId = parseInt(option.dataset.playerId);
            addPlayerToMatch(matchId, playerId);
        });
    });

    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 0);
}

function handleOutsideClick(e) {
    const dropdown = document.querySelector('.inline-player-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        closeAllPlayerInputs();
        document.removeEventListener('click', handleOutsideClick);
    }
}

function closeAllPlayerInputs() {
    // Remove all dropdowns
    document.querySelectorAll('.inline-player-dropdown').forEach(d => d.remove());

    // Show all + buttons
    document.querySelectorAll('.add-player-btn').forEach(btn => {
        btn.style.display = 'inline-block';
    });

    // Remove click listener
    document.removeEventListener('click', handleOutsideClick);
}

function addPlayerToMatch(matchId, playerId) {
    console.log('Adding player', playerId, 'to match', matchId);

    const match = scheduleData.find(m => m.id === matchId);
    if (!match) return;

    // Initialize assignedPlayers if needed
    if (!match.assignedPlayers) {
        match.assignedPlayers = [];
    }

    // Check if player already assigned (prevent duplicates)
    if (match.assignedPlayers.includes(playerId)) {
        alert('Player already assigned to this match');
        closeAllPlayerInputs();
        return;
    }

    // Check max limit
    if (match.assignedPlayers.length >= 5) {
        alert('Maximum 5 players per match');
        closeAllPlayerInputs();
        return;
    }

    // Add player
    match.assignedPlayers.push(playerId);

    // Save to localStorage and debounced GitHub
    saveSchedule();

    // Close dropdown and update card
    closeAllPlayerInputs();
    updateMatchCardPlayers(matchId);
}

function showRemoveOption(matchId, playerId, event) {
    event.stopPropagation();

    const pill = event.currentTarget;

    // Check if clicking on the X specifically
    if (event.target.classList.contains('remove-x')) {
        removePlayerFromMatch(matchId, playerId);
        return;
    }

    // Toggle selection state
    if (pill.classList.contains('removing')) {
        // Deselect - remove X and green state
        pill.classList.remove('removing');
        const player = playersData.find(p => p.id === playerId);
        if (player) {
            pill.innerHTML = player.name;
        }
    } else {
        // Remove 'removing' class from all other pills
        document.querySelectorAll('.player-pill-removable').forEach(p => {
            if (p !== pill) {
                p.classList.remove('removing');
                const otherId = parseInt(p.getAttribute('data-player-id'));
                const otherPlayer = playersData.find(pl => pl.id === otherId);
                if (otherPlayer) {
                    p.innerHTML = otherPlayer.name;
                }
            }
        });

        // Select this pill - add X and green state
        pill.classList.add('removing');
        const player = playersData.find(p => p.id === playerId);
        if (player) {
            pill.innerHTML = `${player.name} <span class="remove-x">×</span>`;
        }
    }
}

function removePlayerFromMatch(matchId, playerId) {
    const match = scheduleData.find(m => m.id === matchId);
    if (!match) return;

    // Remove player
    match.assignedPlayers = (match.assignedPlayers || []).filter(id => id !== playerId);

    // Save and update only this card (fast!)
    saveSchedule();
    updateMatchCardPlayers(matchId);
}

// Fast update - only refreshes player pills for one match card
function updateMatchCardPlayers(matchId) {
    const match = scheduleData.find(m => m.id === matchId);
    if (!match) return;

    const container = document.getElementById(`pills-container-${matchId}`);
    if (!container) return;

    // Filter out deleted players
    const validAssignedPlayers = (match.assignedPlayers || []).filter(playerId =>
        playersData.some(p => p.id === playerId)
    );

    // Build player pills HTML
    const playerPills = validAssignedPlayers
        .map(playerId => {
            const player = playersData.find(p => p.id === playerId);
            return player ? `<span class="player-pill-removable" data-player-id="${playerId}" onclick="showRemoveOption(${matchId}, ${playerId}, event)">${player.name}</span>` : '';
        })
        .filter(pill => pill !== '')
        .join('');

    // Update the container (keep the + button in wrapper)
    container.innerHTML = `
        ${playerPills}
        <div class="add-player-wrapper" id="add-wrapper-${matchId}">
            <button class="add-player-btn" onclick="showPlayerInput(${matchId})" id="add-btn-${matchId}">+</button>
        </div>
    `;
}

async function saveSchedule() {
    // Save to localStorage immediately (fast)
    localStorage.setItem('scheduleData', JSON.stringify(scheduleData));

    // Debounce Google Sheets save (batches rapid changes)
    debouncedSheetsSave(scheduleData, playersData, teamsData);
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

async function savePlayers() {
    // Save to localStorage immediately (fast)
    localStorage.setItem('playersData', JSON.stringify(playersData));

    // Debounce Google Sheets save (batches rapid changes)
    debouncedSheetsSave(scheduleData, playersData, teamsData);
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

async function saveTeams() {
    // Save to localStorage immediately (fast)
    localStorage.setItem('teamsData', JSON.stringify(teamsData));

    // Debounce Google Sheets save (batches rapid changes)
    debouncedSheetsSave(scheduleData, playersData, teamsData);
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

// Initial Data Load and Render
async function initializeApp() {
    console.log('Initializing app...');

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }

    // Initialize Google Sheets API
    await initializeGoogleSheets();

    try {
        // Try to load from Google Sheets first
        const sheetsData = await loadDataFromGoogleSheets();

        if (sheetsData) {
            // Data exists in Google Sheets
            scheduleData = sheetsData.scheduleData || [];
            playersData = sheetsData.playersData || [];
            teamsData = sheetsData.teamsData || [];
            console.log('Data loaded from Google Sheets');

            // Save to localStorage as cache
            localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
            localStorage.setItem('playersData', JSON.stringify(playersData));
            localStorage.setItem('teamsData', JSON.stringify(teamsData));
        } else {
            // No data in Google Sheets, try localStorage
            const localSchedule = localStorage.getItem('scheduleData');
            const localPlayers = localStorage.getItem('playersData');
            const localTeams = localStorage.getItem('teamsData');

            if (localSchedule || localPlayers || localTeams) {
                // Load from localStorage
                scheduleData = localSchedule ? JSON.parse(localSchedule) : defaultData.scheduleData;
                playersData = localPlayers ? JSON.parse(localPlayers) : defaultData.playersData;
                teamsData = localTeams ? JSON.parse(localTeams) : defaultData.teamsData;
                console.log('Data loaded from localStorage, saving to Google Sheets...');

                // Save to Google Sheets
                await saveAllDataToGoogleSheets(scheduleData, playersData, teamsData);
            } else {
                // No data anywhere, use defaults
                scheduleData = defaultData.scheduleData;
                playersData = defaultData.playersData;
                teamsData = defaultData.teamsData;
                console.log('Using default data, saving to Google Sheets...');

                // Save to Google Sheets
                await saveAllDataToGoogleSheets(scheduleData, playersData, teamsData);

                // Save to localStorage as cache
                localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
                localStorage.setItem('playersData', JSON.stringify(playersData));
                localStorage.setItem('teamsData', JSON.stringify(teamsData));
            }
        }
    } catch (error) {
        console.error('Error loading from Google Sheets, falling back to localStorage:', error);

        // Fall back to localStorage
        scheduleData = JSON.parse(localStorage.getItem('scheduleData') || 'null') || defaultData.scheduleData;
        playersData = JSON.parse(localStorage.getItem('playersData') || 'null') || defaultData.playersData;
        teamsData = JSON.parse(localStorage.getItem('teamsData') || 'null') || defaultData.teamsData;

        // Save to localStorage
        localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
        localStorage.setItem('playersData', JSON.stringify(playersData));
        localStorage.setItem('teamsData', JSON.stringify(teamsData));
    }

    // Hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }

    // Data migration - ensure all matches have assignedPlayers field
    scheduleData.forEach(match => {
        if (!match.assignedPlayers) {
            match.assignedPlayers = [];
        }
    });

    // Render initial UI
    renderSchedule();
    renderPlayers();
    renderTeams();
    setupAutocomplete();

    console.log('App initialized successfully');
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
