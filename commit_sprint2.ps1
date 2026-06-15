Write-Host "Starting Sprint 2 Commits..." -ForegroundColor Cyan

# Unstage everything first so we can commit file-by-file
git reset

function Commit-Ensure {
    param (
        [string[]]$Files,
        [string]$Message
    )

    foreach ($file in $Files) {
        if (Test-Path $file) {
            git add $file
        }
    }
    
    $staged = git diff --cached --name-only
    if ($staged) {
        git commit -m $Message
    }
}

Commit-Ensure -Files @("backend/src/routes/slots.ts") -Message "added 1hr slots"
Commit-Ensure -Files @("frontend/src/pages/HomePage.tsx") -Message "updated homepage time selectors"
Commit-Ensure -Files @("backend/src/models/User.ts") -Message "added notification prefs to user model"
Commit-Ensure -Files @("backend/src/routes/auth.ts") -Message "profile update route"
Commit-Ensure -Files @("frontend/src/store/index.ts") -Message "auth store sync"
Commit-Ensure -Files @("frontend/src/pages/ProfilePage.tsx") -Message "built profile page ui"
Commit-Ensure -Files @("frontend/public/khalti_logo.png") -Message "added khalti logo"
Commit-Ensure -Files @("frontend/src/components/layout/Logo.tsx") -Message "updated logo component"
Commit-Ensure -Files @("frontend/src/components/layout/Navbar.tsx") -Message "navbar styling fixes"
Commit-Ensure -Files @("frontend/src/index.css") -Message "fixed button alignments"
Commit-Ensure -Files @("backend/src/server.ts") -Message "increased json upload limit"
Commit-Ensure -Files @("frontend/src/pages/VenuesPage.tsx") -Message "venue search page"
Commit-Ensure -Files @("backend/package.json") -Message "updated backend packages"
Commit-Ensure -Files @("frontend/package.json") -Message "added ui deps"

# Catch-all
$remaining = git status --porcelain
if ($remaining) {
    git add -A
    git commit -m "completed sprint 2 final touches"
}

Write-Host "Sprint 2 Commits finished!" -ForegroundColor Green
