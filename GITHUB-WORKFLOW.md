# GitHub Workflow Guide for MSG Viewer

This guide explains how to properly interact with the GitHub repository to avoid common issues when pushing and pulling changes.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Daily Workflow](#daily-workflow)
3. [Before Making Changes](#before-making-changes)
4. [Committing Changes](#committing-changes)
5. [Pushing to GitHub](#pushing-to-github)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Best Practices](#best-practices)

---

## Initial Setup

### Repository Location
- **Active Repository:** `msg-viewer-repo/`
- **Old/Backup Folder:** `msg-viewer/` (do not use for development)

### Verify Git Configuration

Always work from the `msg-viewer-repo` folder. First, verify your git configuration:

```powershell
cd "c:\Users\MartinGonzalez\OneDrive - NGT TECHNOLOGY\Documents\CursorAI\MSG_VIEWER\msg-viewer-repo"

# Check remote URL
git remote -v

# Should show:
# origin  https://github.com/ngttech/msg-viewer.git (fetch)
# origin  https://github.com/ngttech/msg-viewer.git (push)

# Check your identity
git config user.name
git config user.email

# Should show:
# ngttech
# 115947181+ngttech@users.noreply.github.com
```

### Clear Proxy Issues (Important!)

If you encounter connection errors, clear proxy settings:

```powershell
# Clear global proxy
git config --global --unset http.proxy
git config --global --unset https.proxy

# Clear local proxy
git config --local --unset http.proxy
git config --local --unset https.proxy

# Verify no proxy is set
git config --list | Select-String proxy
```

---

## Daily Workflow

### 1. Start Your Day: Pull Latest Changes

**Always** pull the latest changes before starting work:

```powershell
cd "msg-viewer-repo"

# Fetch updates from GitHub
git fetch origin

# Pull changes
$env:http_proxy=''; $env:https_proxy=''; git pull origin main
```

### 2. Check Repository Status

Before making changes, check the current state:

```powershell
# See what branch you're on and any uncommitted changes
git status

# See recent commits
git log --oneline -5

# See what changed since last commit
git diff
```

---

## Before Making Changes

### Create a Backup of Your Current State (Optional)

If making significant changes:

```powershell
# Create a new branch for testing
git checkout -b feature/my-new-feature

# Or stay on main (if you're confident)
git checkout main
```

### Check File Status

```powershell
# List modified files
git status

# See detailed changes
git diff

# See staged changes
git diff --cached
```

---

## Committing Changes

### 1. Review Your Changes

**Critical:** Always review what you're committing:

```powershell
# See all changes
git diff

# See changes in a specific file
git diff path/to/file.ts

# Check which files are modified
git status
```

### 2. Stage Your Changes

Stage files selectively (recommended):

```powershell
# Stage specific files
git add build.ts
git add lib/components/message/index.ts
git add .dockerignore

# Or stage all changes (use with caution!)
git add .
```

**Never stage:**
- Temporary files
- Build artifacts (`build/` folder)
- `node_modules/`
- IDE settings (`.vscode/`, `.cursor/`)
- Personal configuration files

### 3. Verify Staged Changes

```powershell
# Check what's staged
git status

# Review staged changes
git diff --cached

# See a summary
git diff --stat --cached
```

### 4. Create a Commit

Write clear, descriptive commit messages:

```powershell
# Single-line commit
git commit -m "Add EML download feature"

# Multi-line commit (preferred for complex changes)
git commit -m "Add Docker deployment support" `
  -m "- Add Docker configuration files" `
  -m "- Update build script to copy favicon" `
  -m "- Include Nginx config with security headers"
```

**Good commit messages:**
- ✅ "Add EML download feature"
- ✅ "Fix attachment encoding in generate-eml.ts"
- ✅ "Update Docker nginx config for better security"

**Bad commit messages:**
- ❌ "Update"
- ❌ "Fix bug"
- ❌ "Changes"

---

## Pushing to GitHub

### 1. Verify Before Push

```powershell
# Check what will be pushed
git log origin/main..HEAD --oneline

# Verify you're on the correct branch
git branch

# Check commit details
git show
```

### 2. Push Changes

**Important:** Clear environment proxy variables before pushing:

```powershell
# Clear proxy and push
$env:http_proxy=''; $env:https_proxy=''; $env:HTTP_PROXY=''; $env:HTTPS_PROXY=''; git push origin main
```

If you get a permission error, you may need to authenticate:
- GitHub will prompt for credentials
- Use a Personal Access Token (not password)
- Or configure SSH keys for easier authentication

### 3. Verify Push Success

```powershell
# Check status
git status

# Should show: "Your branch is up to date with 'origin/main'"

# Verify on GitHub
# Visit: https://github.com/ngttech/msg-viewer/commits/main
```

---

## Common Issues & Solutions

### Issue 1: "Failed to connect to 127.0.0.1 port 9"

**Cause:** Proxy configuration issue

**Solution:**
```powershell
# Clear all proxy settings
git config --global --unset http.proxy
git config --global --unset https.proxy
git config --local --unset http.proxy
git config --local --unset https.proxy

# Push with cleared environment
$env:http_proxy=''; $env:https_proxy=''; git push origin main
```

### Issue 2: "Permission denied" or "Unable to create index.lock"

**Cause:** OneDrive sync or file in use

**Solutions:**
```powershell
# Option 1: Wait a few seconds and retry
Start-Sleep -Seconds 5
git add .

# Option 2: Check for locked files
# Close any editors/IDEs using the files

# Option 3: If persistent, remove lock file manually
Remove-Item ".git/index.lock" -Force -ErrorAction SilentlyContinue
```

### Issue 3: "Your branch is behind 'origin/main'"

**Cause:** Remote has changes you don't have locally

**Solution:**
```powershell
# Pull changes first
$env:http_proxy=''; $env:https_proxy=''; git pull origin main

# If conflicts occur, resolve them manually
# Then commit the merge
git add .
git commit -m "Merge remote changes"

# Now push
$env:http_proxy=''; $env:https_proxy=''; git push origin main
```

### Issue 4: "fatal: not a git repository"

**Cause:** You're in the wrong directory

**Solution:**
```powershell
# Navigate to the correct repository
cd "c:\Users\MartinGonzalez\OneDrive - NGT TECHNOLOGY\Documents\CursorAI\MSG_VIEWER\msg-viewer-repo"

# Verify you're in a git repo
git status
```

### Issue 5: Accidentally Committed to Wrong Folder

**If you committed to `msg-viewer` instead of `msg-viewer-repo`:**

```powershell
# 1. Copy the changes you made
# 2. Navigate to the correct repo
cd msg-viewer-repo

# 3. Apply changes manually
# 4. Commit in the correct repo
git add .
git commit -m "Your commit message"
git push origin main
```

---

## Best Practices

### ✅ DO:
1. **Always work in `msg-viewer-repo/`** - This is your active repository
2. **Pull before you start working** - `git pull origin main`
3. **Commit frequently** - Small, logical commits are better than large ones
4. **Write descriptive commit messages** - Explain what and why, not how
5. **Review changes before committing** - Use `git diff` and `git status`
6. **Test your changes** - Build and test before pushing
7. **Clear proxy before pushing** - Use the environment variable clearing command
8. **Check git status after operations** - Verify success

### ❌ DON'T:
1. **Don't work in `msg-viewer/`** - Use `msg-viewer-repo/` only
2. **Don't commit without reviewing** - Always check `git status` and `git diff`
3. **Don't push without testing** - Make sure the build works
4. **Don't commit build artifacts** - The `build/` folder should be gitignored
5. **Don't commit sensitive data** - No passwords, API keys, or credentials
6. **Don't use generic commit messages** - "Update" or "Fix" are not helpful
7. **Don't force push to main** - Never use `git push --force` on main branch
8. **Don't commit with unresolved conflicts** - Fix merge conflicts properly

---

## Quick Reference Commands

### Essential Commands
```powershell
# Navigate to repo
cd "c:\Users\MartinGonzalez\OneDrive - NGT TECHNOLOGY\Documents\CursorAI\MSG_VIEWER\msg-viewer-repo"

# Pull latest changes
$env:http_proxy=''; $env:https_proxy=''; git pull origin main

# Check status
git status

# Review changes
git diff

# Stage changes
git add file1.ts file2.ts

# Commit
git commit -m "Descriptive message"

# Push (with proxy clearing)
$env:http_proxy=''; $env:https_proxy=''; $env:HTTP_PROXY=''; $env:HTTPS_PROXY=''; git push origin main
```

### Troubleshooting Commands
```powershell
# Clear proxy settings
git config --global --unset http.proxy
git config --global --unset https.proxy

# Check remote
git remote -v

# View recent commits
git log --oneline -10

# Discard local changes (CAREFUL!)
git restore file.ts

# Unstage file
git restore --staged file.ts

# See commit history
git log --graph --oneline --all
```

---

## Workflow Checklist

Before every push, complete this checklist:

- [ ] I'm in the `msg-viewer-repo/` directory
- [ ] I pulled the latest changes (`git pull origin main`)
- [ ] I reviewed my changes (`git diff`)
- [ ] I tested my changes locally (build works)
- [ ] I staged only the files I want to commit
- [ ] I wrote a clear commit message
- [ ] I cleared proxy environment variables
- [ ] I verified the push was successful

---

## Getting Help

If you encounter issues not covered here:

1. **Check git status:** `git status` often tells you what to do
2. **Read error messages carefully:** They usually contain the solution
3. **Check GitHub repository:** https://github.com/ngttech/msg-viewer
4. **Verify branch and commits:** `git log --oneline -5`
5. **When in doubt, DON'T force anything:** Ask for help instead

---

## Repository Structure

```
msg-viewer-repo/              ← WORK HERE
├── .git/                     ← Git configuration
├── .gitignore               ← Ignored files
├── .dockerignore            ← Docker ignored files
├── build.ts                 ← Build script
├── package.json             ← Dependencies
├── DOCKER-README.md         ← Docker guide
├── GITHUB-WORKFLOW.md       ← This file
├── lib/                     ← Source code
│   ├── components/
│   ├── scripts/
│   │   └── utils/
│   │       └── eml/
│   │           └── generate-eml.ts
│   └── styles/
└── build/                   ← Build output (gitignored)

msg-viewer/                  ← DON'T WORK HERE (backup only)
```

---

## Important Reminders

1. **Single Source of Truth:** Only `msg-viewer-repo` should be used for development
2. **Proxy Issues:** Always clear proxy before git network operations
3. **OneDrive Sync:** May cause file locking - wait a few seconds if errors occur
4. **Commit Often:** Better to have many small commits than one large one
5. **Branch Name:** We work on `main` branch (mapped to production on Cloudflare)

---

*Last Updated: January 24, 2026*
*Repository: https://github.com/ngttech/msg-viewer*
