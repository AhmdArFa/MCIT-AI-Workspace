# TuT AI - Automated Push to GitHub Repository
#
# Usage:
#   .\scripts\push_to_tut_ai.ps1

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         TuT AI - GitHub Repository Publisher            " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Ensure remote is configured
$repoUrl = "https://github.com/AhmdArFa/TuT-AI.git"
git remote remove tut-ai 2>$null
git remote add tut-ai $repoUrl
Write-Host "`nTarget Remote: $repoUrl" -ForegroundColor Green

# 2. Check git status
$status = git status --porcelain
if ($status) {
    Write-Host "Staging and committing any pending updates..." -ForegroundColor Gray
    git add .
    git commit -m "feat(tut-ai): final TuT AI sovereign platform build"
}

Write-Host "`nPushing main branch and all release tags to TuT-AI..." -ForegroundColor Yellow
Write-Host "(If prompted by GitHub in your browser, please authenticate)`n" -ForegroundColor Gray

git push -u tut-ai main --tags

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "   Successfully pushed TuT AI to GitHub!                  " -ForegroundColor Yellow
    Write-Host "   Repository URL: https://github.com/AhmdArFa/TuT-AI     " -ForegroundColor Cyan
    Write-Host "==========================================================`n" -ForegroundColor Green
} else {
    Write-Host "`n[!] Push failed or authentication was cancelled." -ForegroundColor Red
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "1. You created the repository 'TuT-AI' at: https://github.com/new" -ForegroundColor Yellow
    Write-Host "2. Your GitHub account has permission to push to AhmdArFa/TuT-AI" -ForegroundColor Yellow
}
