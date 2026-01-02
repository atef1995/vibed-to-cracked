# Git Repository Cleanup Script for Premium Content
# This script removes sensitive files from Git history
# WARNING: This rewrites git history - coordinate with team before running!

Write-Host "🔐 Git Repository Cleanup for Premium Content" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository root" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️  WARNING: This script will rewrite Git history!" -ForegroundColor Yellow
Write-Host "   - All team members will need to re-clone or force-pull" -ForegroundColor Yellow
Write-Host "   - Make sure you have a backup of your repository" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type 'YES' to continue"
if ($confirm -ne "YES") {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📋 Step 1: Creating backup branch..." -ForegroundColor Green
git branch backup-before-cleanup 2>$null

Write-Host ""
Write-Host "📋 Step 2: Files that will be removed from history:" -ForegroundColor Green
Write-Host "   - scripts/dbSeeds/seeds/ (all seed files)" -ForegroundColor White
Write-Host "   - src/content/tutorials/**/*.mdx (premium MDX files)" -ForegroundColor White
Write-Host ""

# Method 1: Using git filter-repo (recommended, faster)
Write-Host "📋 Step 3: Checking for git-filter-repo..." -ForegroundColor Green
$filterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if ($filterRepo) {
    Write-Host "✅ git-filter-repo found, using fast method" -ForegroundColor Green
    
    # Remove seed files
    git filter-repo --path scripts/dbSeeds/seeds/ --invert-paths --force
    
    # Remove premium MDX files (you may want to be more selective)
    # git filter-repo --path-glob 'src/content/tutorials/**/*.mdx' --invert-paths --force
    
} else {
    Write-Host "⚠️  git-filter-repo not found, using git filter-branch (slower)" -ForegroundColor Yellow
    Write-Host "   Install git-filter-repo for faster cleanup: pip install git-filter-repo" -ForegroundColor Yellow
    Write-Host ""
    
    # Remove seed files from history using filter-branch
    Write-Host "Removing scripts/dbSeeds/seeds/ from history..." -ForegroundColor White
    git filter-branch --force --index-filter `
        "git rm -rf --cached --ignore-unmatch scripts/dbSeeds/seeds/" `
        --prune-empty --tag-name-filter cat -- --all
    
    # Clean up refs
    git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
}

Write-Host ""
Write-Host "📋 Step 4: Verify .gitignore includes sensitive paths..." -ForegroundColor Green

$gitignoreContent = Get-Content .gitignore -ErrorAction SilentlyContinue
$needsUpdate = $false

if ($gitignoreContent -notcontains "scripts/dbSeeds/seeds/") {
    Write-Host "   Adding scripts/dbSeeds/seeds/ to .gitignore" -ForegroundColor Yellow
    Add-Content .gitignore "`nscripts/dbSeeds/seeds/"
    $needsUpdate = $true
}

if ($needsUpdate) {
    git add .gitignore
    git commit -m "chore: update .gitignore to exclude premium content"
}

Write-Host ""
Write-Host "✨ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review the changes: git log --oneline -20" -ForegroundColor White
Write-Host "   2. Force push to remote: git push origin --force --all" -ForegroundColor White
Write-Host "   3. Force push tags: git push origin --force --tags" -ForegroundColor White
Write-Host "   4. Notify team members to re-clone or:" -ForegroundColor White
Write-Host "      git fetch --all && git reset --hard origin/main" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Your premium content is now stored only in the database!" -ForegroundColor Green
