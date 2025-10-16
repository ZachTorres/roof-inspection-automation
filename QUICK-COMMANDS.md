# Quick Command Reference

Your essential command cheat sheet for this project.

---

## 🚀 Development Commands

### First Time Setup

```bash
# Navigate to project
cd c:/Users/torre/Downloads/roof-inspection-automation

# Install dependencies
npm install

# Start development server
npm run dev
```

**Open:** http://localhost:3000

### Daily Development

```bash
# Start dev server
npm run dev

# Build for production (test)
npm run build

# Run production build locally
npm start

# Check for errors
npm run lint
```

---

## 📦 Git Commands

### First Time Git Setup

```bash
# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit"

# Set branch to main
git branch -M main

# Add GitHub remote (change YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/roof-inspection-automation.git

# Push to GitHub
git push -u origin main
```

### Daily Git Workflow

```bash
# Check what changed
git status

# Stage all changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub (triggers auto-deploy)
git push

# Pull latest changes
git pull
```

### Useful Git Commands

```bash
# View commit history
git log

# View recent commits (short)
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature-name

# Delete branch
git branch -d feature-name
```

---

## ☁️ Vercel Commands

### Vercel CLI Installation

```bash
# Install globally
npm install -g vercel

# Login
vercel login
```

### Deployment Commands

```bash
# Deploy (preview)
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# View logs (production)
vercel logs --prod

# List deployments
vercel ls

# Remove deployment
vercel remove [deployment-url]

# View project info
vercel inspect
```

---

## 🔧 Troubleshooting Commands

### Fix Dependencies

```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install

# Update all packages
npm update

# Check for outdated packages
npm outdated

# Audit security issues
npm audit

# Fix security issues
npm audit fix
```

### Clear Caches

```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Full clean and reinstall
rm -rf node_modules .next package-lock.json
npm install
```

### Port Issues

```bash
# Windows: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Use different port
npm run dev -- -p 3001
```

---

## 📁 File Operations

### Create Files

```bash
# Create new file
touch filename.txt

# Create multiple files
touch file1.txt file2.txt file3.txt

# Create directory
mkdir dirname

# Create nested directories
mkdir -p dir1/dir2/dir3
```

### View Files

```bash
# List files
ls

# List files (detailed)
ls -la

# View file contents
cat filename.txt

# View file (paginated)
less filename.txt

# View first 10 lines
head filename.txt

# View last 10 lines
tail filename.txt
```

### Navigate Directories

```bash
# Change directory
cd dirname

# Go to parent directory
cd ..

# Go to home directory
cd ~

# Go to previous directory
cd -

# Show current directory
pwd
```

---

## 🔍 Search Commands

### Find Files

```bash
# Find file by name
find . -name "filename.txt"

# Find all TypeScript files
find . -name "*.tsx"

# Find directories
find . -type d -name "dirname"
```

### Search in Files

```bash
# Search for text in files
grep -r "search text" .

# Search in specific file types
grep -r "search text" --include="*.tsx"

# Case-insensitive search
grep -ri "search text" .
```

---

## 📊 Project Commands

### Check Project Status

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check git version
git --version

# List installed packages
npm list --depth=0

# Check package details
npm info package-name

# View package.json scripts
npm run
```

### Project Information

```bash
# Count lines of code
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Size of project
du -sh .

# Size of node_modules
du -sh node_modules

# Number of files
find . -type f | wc -l
```

---

## 🌐 Network Commands

### Test Local Server

```bash
# Check if port is in use
netstat -an | findstr :3000  # Windows
lsof -i :3000                # Mac/Linux

# Test URL
curl http://localhost:3000

# Test with headers
curl -I http://localhost:3000
```

---

## 📝 Common Workflows

### Make a Change

```bash
# 1. Pull latest code
git pull

# 2. Make your changes in code editor

# 3. Test locally
npm run dev

# 4. Build test
npm run build

# 5. Commit and push
git add .
git commit -m "Description"
git push
```

### Create New Feature

```bash
# 1. Create feature branch
git checkout -b new-feature

# 2. Make changes

# 3. Test
npm run dev

# 4. Commit to branch
git add .
git commit -m "Add new feature"
git push origin new-feature

# 5. Merge to main (after testing)
git checkout main
git merge new-feature
git push

# 6. Delete branch
git branch -d new-feature
```

### Emergency Rollback

```bash
# Option 1: Revert last commit
git revert HEAD
git push

# Option 2: Reset to previous commit
git log  # Find commit hash
git reset --hard [commit-hash]
git push --force

# Option 3: Use Vercel dashboard
# Go to Deployments → Select previous → Promote to Production
```

---

## 🎯 Shortcuts

### Quick Start Development

```bash
cd c:/Users/torre/Downloads/roof-inspection-automation && npm run dev
```

### Quick Build and Test

```bash
npm run build && npm start
```

### Quick Commit and Push

```bash
git add . && git commit -m "Update" && git push
```

### Quick Clean Install

```bash
rm -rf node_modules .next && npm install
```

---

## 📋 Verification Commands

### Before Deployment

```bash
# Check everything works
npm install          # ✓ Dependencies install
npm run build        # ✓ Build succeeds
npm start            # ✓ Production runs
git status           # ✓ All committed
```

### After Deployment

```bash
# Verify deployment
git log -1           # Check last commit
vercel ls            # Check deployments
curl [your-url]      # Test live site
```

---

## 💾 Backup Commands

### Backup Your Work

```bash
# Create zip backup
tar -czf backup-$(date +%Y%m%d).tar.gz roof-inspection-automation

# Or use zip
zip -r backup-$(date +%Y%m%d).zip roof-inspection-automation
```

### Restore Backup

```bash
# Extract tar.gz
tar -xzf backup-20240101.tar.gz

# Extract zip
unzip backup-20240101.zip
```

---

## 🔐 Security

### Environment Variables

```bash
# Create .env.local file
touch .env.local

# Edit with nano
nano .env.local

# Never commit .env files!
# Already in .gitignore
```

---

## 📚 Help Commands

### Get Help

```bash
# npm help
npm help

# Git help
git help

# Specific command help
git help commit
npm help install

# Vercel help
vercel --help
```

---

## 🎨 Customization Quick Edits

### Update Company Name

**File:** `app/layout.tsx`
```bash
# Open file
code app/layout.tsx
# or
nano app/layout.tsx

# Change title and description
```

### Update Default Costs

**File:** `components/DamageAnalyzer.tsx`
```bash
# Open file
code components/DamageAnalyzer.tsx

# Find line ~45-90
# Edit estimatedCost values
```

---

## 🚨 Emergency Commands

### Something Broke!

```bash
# Reset everything
git reset --hard HEAD
rm -rf node_modules .next
npm install
npm run dev
```

### Can't Push to Git

```bash
# Force push (CAREFUL!)
git push --force

# Or pull first
git pull --rebase
git push
```

### Vercel Build Failing

```bash
# Test locally
npm run build

# If works locally:
# Clear Vercel cache: Dashboard → Settings → Clear Cache
# Redeploy manually
```

---

## ⚡ Pro Tips

### Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# Development
alias dev='npm run dev'
alias build='npm run build'

# Git shortcuts
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline -10'

# Quick update
alias update='git add . && git commit -m "Update" && git push'
```

Then use:
```bash
dev      # Instead of npm run dev
gs       # Instead of git status
update   # Add, commit, push in one command
```

---

## 📖 More Information

For detailed explanations, see:
- **SETUP.md** - Local development
- **DEPLOYMENT.md** - Production deployment
- **GITHUB-VERCEL-GUIDE.md** - Git and Vercel concepts
- **WALKTHROUGH.md** - Step-by-step tutorial

---

**Print this file and keep it handy!**

Or bookmark it in your browser for quick reference.
