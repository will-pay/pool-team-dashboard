// Google Sheets API Configuration
// IMPORTANT: You need to set this value from your Google Apps Script deployment
const GOOGLE_SHEETS_CONFIG = {
    // Paste your Google Apps Script Web App URL here
    // It looks like: https://script.google.com/macros/s/AKfycby.../exec
    apiUrl: 'https://script.google.com/macros/s/AKfycbwpppFwswW8irB_DmNpD7b7CxWMOUC8zo1lr9LVFxeBklaJukLM898rm_dw7g3NPxE6/exec'
};

// Track if Google Sheets sync is ready
let isSheetsReady = false;

/**
 * Check if Google Sheets is properly configured
 * @returns {boolean} True if configured
 */
function isSheetsConfigured() {
    return GOOGLE_SHEETS_CONFIG.apiUrl &&
           GOOGLE_SHEETS_CONFIG.apiUrl !== 'YOUR_APPS_SCRIPT_URL_HERE' &&
           GOOGLE_SHEETS_CONFIG.apiUrl.includes('script.google.com');
}

/**
 * Initialize Google Sheets sync
 */
async function initializeGoogleSheets() {
    if (!isSheetsConfigured()) {
        console.warn('Google Sheets not configured. Set your Apps Script URL in google-sheets-sync.js');
        isSheetsReady = false;
        return false;
    }

    try {
        // Test API access by making a simple request
        const response = await fetch(GOOGLE_SHEETS_CONFIG.apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Google Sheets API initialized successfully');
            isSheetsReady = true;
            return true;
        } else {
            console.error('Google Sheets API access failed:', response.status, response.statusText);
            isSheetsReady = false;
            return false;
        }
    } catch (error) {
        console.error('Error initializing Google Sheets:', error);
        isSheetsReady = false;
        return false;
    }
}

/**
 * Load data from Google Sheets
 * @returns {Promise<Object>} Object containing scheduleData, playersData, teamsData
 */
async function loadDataFromGoogleSheets() {
    if (!isSheetsReady) {
        throw new Error('Google Sheets is not initialized');
    }

    try {
        const response = await fetch(GOOGLE_SHEETS_CONFIG.apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();

            if (result.success) {
                console.log('Data loaded from Google Sheets');
                return {
                    scheduleData: result.data.scheduleData || [],
                    playersData: result.data.playersData || [],
                    teamsData: result.data.teamsData || []
                };
            } else {
                throw new Error(result.error || 'Failed to load data');
            }
        } else {
            throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error loading data from Google Sheets:', error);
        throw error;
    }
}

/**
 * Save data to Google Sheets
 * @param {Object} data - Object containing scheduleData, playersData, teamsData
 * @returns {Promise<void>}
 */
async function saveDataToGoogleSheets(data) {
    if (!isSheetsReady) {
        console.warn('Google Sheets not ready, data not saved to Google Sheets');
        return;
    }

    try {
        const response = await fetch(GOOGLE_SHEETS_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();

            if (result.success) {
                console.log('Data saved to Google Sheets successfully');
            } else {
                throw new Error(result.error || 'Failed to save data');
            }
        } else {
            const errorText = await response.text();
            throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
    } catch (error) {
        console.error('Error saving data to Google Sheets:', error);
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
async function saveAllDataToGoogleSheets(scheduleData, playersData, teamsData) {
    return saveDataToGoogleSheets({
        scheduleData,
        playersData,
        teamsData
    });
}

console.log('Google Sheets sync module loaded');
