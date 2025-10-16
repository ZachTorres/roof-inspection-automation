# GitHub to Vercel: Complete Visual Guide

This guide explains how code flows from your computer → GitHub → Vercel → Live website.

---

## The Big Picture

```
┌─────────────────┐
│  Your Computer  │  ← Write code here
│   (localhost)   │
└────────┬────────┘
         │
         │ git push
         ▼
┌─────────────────┐
│     GitHub      │  ← Store code here
│  (Repository)   │
└────────┬────────┘
         │
         │ Auto-trigger
         ▼
┌─────────────────┐
│     Vercel      │  ← Build & host here
│   (Platform)    │
└────────┬────────┘
         │
         │ Deploy
         ▼
┌─────────────────┐
│   Live Website  │  ← Users access here
│ (your-app.com)  │
└─────────────────┘
```

---

## Part 1: Understanding Git and GitHub

### What is Git?

**Git** = Version control system (like "Track Changes" for code)

**What it does:**
- Saves snapshots of your code (commits)
- Tracks who changed what and when
- Allows undo/redo
- Enables collaboration

### What is GitHub?

**GitHub** = Cloud storage for Git repositories

**What it does:**
- Backs up your code online
- Enables team collaboration
- Integrates with deployment tools
- Provides version history

### Key Git Commands

```bash
# Initialize Git in your project
git init

# Check what changed
git status

# Stage files for commit
git add .                    # All files
git add file.txt             # Specific file

# Save snapshot (commit)
git commit -m "Description"

# Upload to GitHub
git push

# Download from GitHub
git pull
```

---

## Part 2: Setting Up GitHub

### Step-by-Step: Create Repository

1. **Sign up at GitHub.com** (if you haven't)
   - Go to: https://github.com/signup
   - Free account is fine

2. **Create New Repository**
   ```
   Click "+" → "New repository"

   Repository name: roof-inspection-automation
   Description: Automated roof inspection reports
   Public/Private: Your choice

   ❌ Don't check "Add README"
   ❌ Don't check "Add .gitignore"
   ❌ Don't check "Add license"

   Click "Create repository"
   ```

3. **Copy Repository URL**
   ```
   You'll see: https://github.com/YOUR_USERNAME/roof-inspection-automation.git

   Keep this handy!
   ```

### Step-by-Step: Push Your Code

Open terminal in project folder:

```bash
# 1. Initialize Git
git init
# Creates hidden .git folder to track changes

# 2. Add all files
git add .
# Stages all files for commit

# 3. Create first commit
git commit -m "Initial commit: Roof inspection automation"
# Saves snapshot with description

# 4. Set branch to main
git branch -M main
# Renames default branch to 'main'

# 5. Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/roof-inspection-automation.git
# Links local folder to GitHub repository

# 6. Push code
git push -u origin main
# Uploads code to GitHub
```

**Replace YOUR_USERNAME with your GitHub username!**

### Authentication

**First time pushing?** GitHub will ask for credentials.

**Option 1: Personal Access Token (Recommended)**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Vercel Deploy"
4. Check scope: `repo` (full control)
5. Click "Generate token"
6. **Copy token immediately** (you won't see it again!)
7. Use token as password when git asks

**Option 2: SSH Key**

1. Generate key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: https://github.com/settings/keys
3. Change remote URL: `git remote set-url origin git@github.com:YOUR_USERNAME/roof-inspection-automation.git`

---

## Part 3: Understanding Vercel

### What is Vercel?

**Vercel** = Cloud platform that hosts websites

**What it does:**
- Builds your Next.js app
- Hosts on global CDN
- Provides free SSL
- Auto-deploys from GitHub
- Gives you a URL

### Why Vercel?

✅ **Free tier is generous**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic SSL
- Global CDN
- Preview deployments

✅ **Next.js creators**
- Built by the Next.js team
- Perfect integration
- Zero configuration

✅ **Developer-friendly**
- Easy setup
- Great documentation
- Excellent support

---

## Part 4: Deploying to Vercel

### Step-by-Step: First Deployment

1. **Sign up for Vercel**
   ```
   Go to: https://vercel.com/signup

   Click "Continue with GitHub"
   (This connects Vercel to your GitHub account)

   Authorize Vercel
   ```

2. **Import Project**
   ```
   Click "Add New..." → "Project"

   You'll see your GitHub repositories

   Find: roof-inspection-automation

   Click "Import"
   ```

3. **Configure (Auto-detected!)**
   ```
   Vercel automatically detects:

   Framework Preset: Next.js ✓
   Root Directory: ./ ✓
   Build Command: npm run build ✓
   Output Directory: .next ✓
   Install Command: npm install ✓

   ❌ Don't change anything!
   ```

4. **Deploy**
   ```
   Click "Deploy"

   Watch build logs in real-time:
   - Installing dependencies...
   - Building application...
   - Optimizing...
   - Deploying...

   Wait 2-3 minutes

   ✅ Success!
   ```

5. **Get Your URL**
   ```
   Vercel gives you:

   Production URL: roof-inspection-automation.vercel.app

   Click to open your live site!
   ```

### Understanding the Build Process

```
GitHub Code
    ↓
Vercel downloads
    ↓
npm install (install dependencies)
    ↓
npm run build (build production version)
    ↓
Upload to CDN (global distribution)
    ↓
Live Website!
```

---

## Part 5: Automatic Updates

### How Auto-Deploy Works

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  1. You make changes locally                            │
│     └─→ Edit files in your code editor                  │
│                                                          │
│  2. Commit changes                                       │
│     └─→ git add .                                        │
│     └─→ git commit -m "Updated feature X"               │
│                                                          │
│  3. Push to GitHub                                       │
│     └─→ git push                                         │
│                                                          │
│  4. GitHub notifies Vercel (webhook)                     │
│     └─→ "New code pushed!"                               │
│                                                          │
│  5. Vercel automatically:                                │
│     ├─→ Downloads new code                               │
│     ├─→ Installs dependencies                            │
│     ├─→ Runs build                                       │
│     ├─→ Tests build                                      │
│     └─→ Deploys to production                            │
│                                                          │
│  6. Live site updates (2-3 minutes)                      │
│     └─→ Users see new version                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Example Workflow

**Scenario:** You want to change the homepage title

1. **Edit the file**
   ```typescript
   // File: app/page.tsx
   // Line 12

   <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
     UC Roofing - Inspection Automation  ← Add your company name
   </h1>
   ```

2. **Test locally**
   ```bash
   npm run dev
   # Check http://localhost:3000
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "Add company name to homepage"
   git push
   ```

4. **Watch Vercel**
   - Go to Vercel dashboard
   - See new deployment starting
   - Monitor build logs
   - Wait 2-3 minutes
   - Check live URL
   - ✅ See your changes!

### Deployment Types

**Production Deploy** (main branch)
```bash
git push origin main
→ Deploys to: your-app.vercel.app
```

**Preview Deploy** (other branches)
```bash
git checkout -b new-feature
git push origin new-feature
→ Deploys to: your-app-git-new-feature.vercel.app
```

---

## Part 6: Vercel Dashboard Tour

### Main Dashboard

```
┌─────────────────────────────────────────────┐
│ roof-inspection-automation                  │
├─────────────────────────────────────────────┤
│                                             │
│ 🟢 Production                               │
│    roof-inspection-automation.vercel.app    │
│    Last deployed: 5 minutes ago             │
│                                             │
│ Recent Deployments                          │
│ ✓ Update homepage title   (2 min ago)      │
│ ✓ Add company logo        (1 hour ago)     │
│ ✓ Initial deployment      (Yesterday)      │
│                                             │
└─────────────────────────────────────────────┘
```

### Key Sections

**1. Overview**
- Production URL
- Recent deployments
- Analytics preview

**2. Deployments**
- All deployment history
- Build logs
- Preview URLs
- Rollback option

**3. Analytics** (if enabled)
- Page views
- Performance metrics
- User locations

**4. Settings**
- Environment variables
- Custom domains
- Git integration
- Team members

**5. Logs**
- Real-time application logs
- Error tracking
- Performance monitoring

---

## Part 7: Common Workflows

### Daily Development

```bash
# Morning: Pull latest changes
git pull

# Make changes to code
# Test locally
npm run dev

# Afternoon: Commit progress
git add .
git commit -m "Implemented feature X"
git push

# Vercel auto-deploys
# Check live site in 2-3 minutes
```

### Feature Development

```bash
# Create feature branch
git checkout -b new-feature

# Make changes
# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin new-feature

# Vercel creates preview URL
# Test at: your-app-git-new-feature.vercel.app

# If good, merge to main
git checkout main
git merge new-feature
git push

# Production auto-deploys
```

### Emergency Rollback

```bash
# Option 1: Vercel Dashboard
# Deployments → Previous version → "Promote to Production"

# Option 2: Git Revert
git revert HEAD
git push
```

---

## Part 8: Troubleshooting

### Issue: Build Fails

**Check:**
1. Build logs in Vercel dashboard
2. Does `npm run build` work locally?
3. All dependencies in package.json?

**Fix:**
```bash
# Test locally
npm run build

# If works locally:
# - Clear Vercel build cache
# - Redeploy manually
```

### Issue: Changes Not Showing

**Check:**
1. Did git push succeed?
2. Is Vercel building?
3. Try hard refresh (Ctrl+F5)

**Fix:**
```bash
# Verify push
git status
git log

# Manual trigger
# Vercel Dashboard → Redeploy
```

### Issue: Git Push Rejected

**Error:** "Updates were rejected"

```bash
# Pull first
git pull origin main

# Then push
git push origin main
```

---

## Part 9: Best Practices

### Git Commit Messages

**Good:**
```bash
git commit -m "Add claim tracking feature"
git commit -m "Fix PDF generation bug"
git commit -m "Update homepage styling"
```

**Bad:**
```bash
git commit -m "changes"
git commit -m "fix"
git commit -m "asdf"
```

### Branch Strategy

**Main branch:**
- Always production-ready
- Only merge tested code
- Direct commits ok for small changes

**Feature branches:**
- New features
- Experiments
- Major changes

### Deployment Frequency

**Recommended:**
- Small changes: Deploy immediately
- Large features: Test in preview first
- Multiple changes: Batch in one deploy

---

## Part 10: Next Level

### Custom Domain

1. **Add in Vercel:**
   - Settings → Domains
   - Add your domain
   - Follow DNS instructions

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: inspections
   Value: cname.vercel-dns.com
   ```

3. **Wait for SSL:**
   - 5-30 minutes usually
   - Automatic HTTPS

### Environment Variables

**For sensitive data (API keys, etc.):**

1. Vercel Dashboard → Settings → Environment Variables
2. Add variables
3. Redeploy
4. Access in code: `process.env.VARIABLE_NAME`

### Team Collaboration

**Add team members:**

1. **GitHub:**
   - Repository → Settings → Collaborators
   - Add GitHub username

2. **Vercel:**
   - Settings → Team
   - Invite email
   - Set permissions

---

## Cheat Sheet

### Essential Git Commands

```bash
git status              # Check what changed
git add .               # Stage all changes
git commit -m "msg"     # Save snapshot
git push                # Upload to GitHub
git pull                # Download from GitHub
git log                 # View history
git checkout -b branch  # Create branch
git merge branch        # Merge branch
```

### Essential Vercel Commands

```bash
# Install CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Local Development                              │
│  └─→ npm run dev                                │
│  └─→ http://localhost:3000                      │
│                                                 │
│  Make Changes                                   │
│  └─→ Edit code                                  │
│  └─→ Test locally                               │
│                                                 │
│  Version Control                                │
│  └─→ git add .                                  │
│  └─→ git commit -m "message"                    │
│  └─→ git push                                   │
│                                                 │
│  Auto-Deploy                                    │
│  └─→ Vercel detects push                        │
│  └─→ Builds automatically                       │
│  └─→ Deploys to production                      │
│  └─→ Live in 2-3 minutes                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Success!

You now understand:
- ✅ What Git and GitHub do
- ✅ What Vercel does
- ✅ How they work together
- ✅ How to deploy and update
- ✅ How to troubleshoot

**Ready to deploy?** Follow WALKTHROUGH.md!

---

*Questions? Review documentation or reach out for support.*
