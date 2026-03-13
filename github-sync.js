// GitHub Repository Configuration
// IMPORTANT: You need to set these values for your repository
const GITHUB_CONFIG = {
    owner: 'will-pay',           // Your GitHub username
    repo: 'pool-team-dashboard', // Your repository name
    branch: 'main',              // Branch to commit to
    dataFile: 'team-data.json',  // Path to data file in repo
    token: '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'   // Personal Access Token
};

// GitHub API base URL
const GITHUB_API = 'https://api.github.com';

// Cache for file SHA (needed for updates)
let currentFileSHA = null;

// Track if GitHub sync is ready
let isGitHubReady = false;

/**
 * Check if GitHub is properly configured
 * @returns {boolean} True if configured
 */
function isGitHubConfigured() {
    return GITHUB_CONFIG.token && GITHUB_CONFIG.token !== 'YOUR_GITHUB_TOKEN';
}

/**
 * Initialize GitHub sync
 */
async function initializeGitHub() {
    if (!isGitHubConfigured()) {
        console.warn('GitHub not configured. Set your token in github-sync.js');
        isGitHubReady = false;
        return false;
    }

    try {
        // Test API access by fetching repo info
        const response = await fetch(`${GITHUB_API}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            console.log('GitHub API initialized successfully');
            isGitHubReady = true;
            return true;
        } else {
            console.error('GitHub API access failed:', response.status, response.statusText);
            isGitHubReady = false;
            return false;
        }
    } catch (error) {
        console.error('Error initializing GitHub:', error);
        isGitHubReady = false;
        return false;
    }
}

/**
 * Load data from GitHub repository
 * @returns {Promise<Object>} Object containing scheduleData, playersData, teamsData
 */
async function loadDataFromGitHub() {
    if (!isGitHubReady) {
        throw new Error('GitHub is not initialized');
    }

    try {
        const url = `${GITHUB_API}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}?ref=${GITHUB_CONFIG.branch}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const fileData = await response.json();

            // Store SHA for future updates
            currentFileSHA = fileData.sha;

            // Decode base64 content
            const content = atob(fileData.content);
            const data = JSON.parse(content);

            console.log('Data loaded from GitHub');
            return {
                scheduleData: data.scheduleData || [],
                playersData: data.playersData || [],
                teamsData: data.teamsData || []
            };
        } else if (response.status === 404) {
            // File doesn't exist yet
            console.log('Data file not found in GitHub, will create on first save');
            return null;
        } else {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error loading data from GitHub:', error);
        throw error;
    }
}

/**
 * Save data to GitHub repository
 * @param {Object} data - Object containing scheduleData, playersData, teamsData
 * @returns {Promise<void>}
 */
async function saveDataToGitHub(data) {
    if (!isGitHubReady) {
        console.warn('GitHub not ready, data not saved to GitHub');
        return;
    }

    try {
        // Convert data to JSON string
        const content = JSON.stringify(data, null, 2);

        // Encode to base64
        const encodedContent = btoa(unescape(encodeURIComponent(content)));

        // Prepare commit message
        const timestamp = new Date().toISOString();
        const message = `Update team data - ${timestamp}`;

        // Prepare request body
        const body = {
            message: message,
            content: encodedContent,
            branch: GITHUB_CONFIG.branch
        };

        // Add SHA if we're updating an existing file
        if (currentFileSHA) {
            body.sha = currentFileSHA;
        }

        // Make API request
        const url = `${GITHUB_API}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const result = await response.json();

            // Update SHA for next save
            currentFileSHA = result.content.sha;

            console.log('Data saved to GitHub successfully');
        } else {
            const errorText = await response.text();
            throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
    } catch (error) {
        console.error('Error saving data to GitHub:', error);
        throw error;
    }
}

/**
 * Save all data (helper function for app)
 * @param {Array} scheduleData - Schedule data
 * @param {Array} playersData - Players data
 * @param {Array} teamsData - Teams data
 * @returns {Promise<void>}
 */
async function saveAllDataToGitHub(scheduleData, playersData, teamsData) {
    return saveDataToGitHub({
        scheduleData,
        playersData,
        teamsData
    });
}

console.log('GitHub sync module loaded');
