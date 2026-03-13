# GitHub Setup Instructions

This guide will help you configure GitHub as your data storage backend for the Pool Team Dashboard. The app will automatically save data changes to your GitHub repository.

## Why GitHub?

- **No database setup required** - Your data lives in your repository
- **Version controlled** - Full history of all changes
- **Works on mobile** - Automatic sync from any device
- **Free** - No additional services needed
- **Transparent** - You can see and edit your data directly in GitHub

## Step 1: Create a GitHub Personal Access Token

A Personal Access Token (PAT) allows the app to read and write to your repository.

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
   - Or navigate: GitHub.com → Your Profile Icon → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. Click **"Generate new token"** → **"Generate new token (classic)"**

3. Configure your token:
   - **Note**: "Pool Team Dashboard" (or any name to remember what it's for)
   - **Expiration**: Choose "No expiration" or "90 days" (you'll need to regenerate when it expires)
   - **Select scopes**: Check **`repo`** (this gives full control of private repositories)
     - ✓ repo
       - ✓ repo:status
       - ✓ repo_deployment
       - ✓ public_repo
       - ✓ repo:invite
       - ✓ security_events

4. Click **"Generate token"** at the bottom

5. **IMPORTANT**: Copy the token immediately - you won't be able to see it again!
   - It will look like: `ghp_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

## Step 2: Add Token to Your App

1. Open `github-sync.js` in your project directory

2. Find the `GITHUB_CONFIG` section at the top (around line 3):

```javascript
const GITHUB_CONFIG = {
    owner: 'will-pay',           // Your GitHub username
    repo: 'pool-team-dashboard', // Your repository name
    branch: 'main',              // Branch to commit to
    dataFile: 'team-data.json',  // Path to data file in repo
    token: 'YOUR_GITHUB_TOKEN'   // Personal Access Token (see GITHUB_SETUP.md)
};
```

3. Replace `'YOUR_GITHUB_TOKEN'` with your actual token:

```javascript
const GITHUB_CONFIG = {
    owner: 'will-pay',
    repo: 'pool-team-dashboard',
    branch: 'main',
    dataFile: 'team-data.json',
    token: 'ghp_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890'  // Your actual token
};
```

4. Verify the other settings:
   - **owner**: Your GitHub username (should be `will-pay`)
   - **repo**: Your repository name (should be `pool-team-dashboard`)
   - **branch**: The branch to save to (usually `main` or `master`)
   - **dataFile**: Leave as `team-data.json`

5. Save the file

## Step 3: Commit and Push Your Changes

```bash
cd /Users/will/Desktop/Claude\ Code\ Projects/pool-team-dashboard
git add .
git commit -m "Configure GitHub API integration"
git push origin main
```

## Step 4: Deploy to GitHub Pages

Your GitHub Pages site will automatically update with the new code.

## Step 5: Test the Integration

1. Open your dashboard in a browser
2. Open the browser console (F12 or Cmd+Option+I on Mac)
3. Look for these messages:
   - ✓ `"GitHub sync module loaded"`
   - ✓ `"GitHub API initialized successfully"`
   - ✓ `"Data loaded from GitHub"` (or localStorage on first run)

4. Make a change (add a player, update a match, etc.)
5. Check the console for:
   - ✓ `"Data saved to GitHub successfully"`

6. Go to your GitHub repository and check the `team-data.json` file:
   - It should show a recent commit with your changes
   - You can click on the file to see your data

## Security Considerations

### Is it safe to put my token in public code?

**For a public repository with non-sensitive data: Yes, with understanding**

- Your token is visible to anyone who views the source code
- However, it only has access to **your repositories**
- Since your pool team data is already public (repo is public), there's no privacy risk
- The worst case: someone could spam commits to your repo (annoying but not dangerous)

**Better option if you're concerned:**
- Keep your repository **private** on GitHub
- Still deploy to GitHub Pages (private repos can have public pages)
- Your token won't be visible to the public

### Revoking Access

If you ever need to revoke access:
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Find your "Pool Team Dashboard" token
3. Click "Delete"
4. The app will stop syncing until you create a new token

### Token Expiration

If you set an expiration date:
- The app will stop syncing when the token expires
- You'll see errors in the browser console
- Generate a new token and update `github-sync.js`

## How It Works

```
User edits data in browser
  ↓
Data saved to localStorage (instant, works offline)
  ↓
Data committed to GitHub via API (syncs across devices)
  ↓
GitHub Pages serves updated app
  ↓
Other devices load latest data from GitHub on page load
```

## Data File Location

Your data is stored in: `team-data.json` at the root of your repository

You can:
- View it on GitHub: `https://github.com/will-pay/pool-team-dashboard/blob/main/team-data.json`
- Edit it directly on GitHub (changes take effect on next page load)
- Download it as a backup
- See full version history

## Troubleshooting

### Error: "GitHub not configured"

- Check that you've replaced `YOUR_GITHUB_TOKEN` with your actual token
- Make sure the token is in quotes: `token: 'ghp_xxx...'`

### Error: "GitHub API access failed: 401"

- Your token is invalid or expired
- Generate a new token and update `github-sync.js`

### Error: "GitHub API access failed: 403"

- Your token doesn't have the right permissions
- Make sure you selected the `repo` scope when creating the token

### Error: "GitHub API access failed: 404"

- Check that `owner` and `repo` in `GITHUB_CONFIG` match your actual repository
- Verify the repository exists and you have access

### Changes not saving

1. Open browser console (F12)
2. Look for error messages
3. Verify GitHub API is initialized
4. Check your internet connection
5. Confirm token hasn't expired

### Offline Mode

The app works offline using localStorage:
- Changes save to localStorage immediately
- When you come back online, the app will sync to GitHub
- If sync fails, data remains in localStorage until next successful sync

## Rate Limits

GitHub API rate limits:
- **Authenticated requests**: 5,000 per hour
- For normal use (8-10 team members editing occasionally), you'll never hit this limit

## Cost

GitHub is free for public repositories and includes:
- Unlimited commits
- Free GitHub Pages hosting
- Free API access (with rate limits)

For a small pool team, this costs $0.

## Manual Data Management

### Backup Your Data

Download `team-data.json` from your repository:
```
https://github.com/will-pay/pool-team-dashboard/blob/main/team-data.json
```

### Restore from Backup

1. Go to your repository on GitHub
2. Click on `team-data.json`
3. Click the pencil icon to edit
4. Paste your backup data
5. Commit changes
6. Reload your dashboard

### Export/Import (Alternative)

If you prefer not to use GitHub sync:
- You can still use localStorage
- The app will work entirely offline
- No GitHub token needed
- Just commit your changes manually when desired

## Need Help?

- [GitHub Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- Check browser console for error messages
