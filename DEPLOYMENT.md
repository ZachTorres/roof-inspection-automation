# Deployment Guide

This guide walks you through deploying your Roof Inspection Automation tool to GitHub and Vercel.

## Prerequisites

- Git installed on your computer
- GitHub account (free): [github.com/signup](https://github.com/signup)
- Vercel account (free): [vercel.com/signup](https://vercel.com/signup)

## Part 1: Push to GitHub

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and log in
2. Click the **"+"** button in top-right corner
3. Select **"New repository"**
4. Fill in:
   - **Repository name**: `roof-inspection-automation`
   - **Description**: "Automated roof inspection reports - saves 10+ hours weekly"
   - **Visibility**: Choose Public or Private
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click **"Create repository"**

### Step 2: Initialize Git and Push Code

Open your terminal in the project directory and run:

```bash
# Navigate to project directory
cd c:/Users/torre/Downloads/roof-inspection-automation

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Roof inspection automation system"

# Set main branch
git branch -M main

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/roof-inspection-automation.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

### Step 3: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. The README.md will display on the repository homepage

## Part 2: Deploy to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository:
   - Click **"Import Git Repository"**
   - Find `roof-inspection-automation`
   - Click **"Import"**
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
5. Click **"Deploy"**
6. Wait 2-3 minutes for build to complete
7. You'll get a live URL like: `roof-inspection-automation.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - What's your project's name? roof-inspection-automation
# - In which directory is your code located? ./
# - Want to override settings? N

# Deploy to production
vercel --prod
```

## Part 3: Automatic Updates

### Enable Auto-Deployment

Vercel automatically deploys when you push to GitHub:

1. Make changes to your code
2. Commit and push:
```bash
git add .
git commit -m "Description of changes"
git push
```
3. Vercel automatically:
   - Detects the push
   - Builds the project
   - Deploys to production
   - Takes 2-3 minutes

### Configure Auto-Deploy Settings

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Git"**
3. Configure:
   - **Production Branch**: `main` (default)
   - **Deploy Hooks**: Enable for API-triggered deploys
   - **Auto-Deploy**: Enabled by default

## Part 4: Custom Domain (Optional)

### Add Custom Domain

1. In Vercel dashboard, go to **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter your domain (e.g., `inspections.uc-roofing.com`)
4. Follow DNS configuration instructions:
   - **Option A - CNAME**: Point to `cname.vercel-dns.com`
   - **Option B - A Record**: Point to Vercel's IP addresses
5. Wait for DNS propagation (5 minutes to 48 hours)
6. Vercel automatically provisions SSL certificate

## Part 5: Environment Variables (If Needed)

For future API integrations:

1. Go to Vercel dashboard → **"Settings"** → **"Environment Variables"**
2. Add variables:
   - `OPENAI_API_KEY` (for AI integration)
   - `DATABASE_URL` (for database)
   - etc.
3. Redeploy to apply changes

## Monitoring and Logs

### View Deployment Status

1. Go to Vercel dashboard
2. Click **"Deployments"** tab
3. See:
   - Build logs
   - Deployment status
   - Preview URLs
   - Performance metrics

### Check Logs

```bash
# View production logs
vercel logs

# View specific deployment logs
vercel logs [deployment-url]
```

## Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Ensure dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Build exceeded time limit"**
- Check Vercel plan limits
- Optimize build process
- Consider upgrading plan

### Deployment Not Updating

1. Check GitHub webhook is active
2. Manually trigger deployment in Vercel dashboard
3. Check build logs for errors

### Environment Variables Not Working

1. Add variables in Vercel dashboard
2. Restart deployment
3. Check variable names match code

## Rollback Deployment

If something goes wrong:

1. Go to Vercel dashboard → **"Deployments"**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

## Performance Optimization

### Enable Caching

Vercel automatically caches:
- Static assets
- API responses (configure in code)
- Image optimization

### Analytics

1. Enable Vercel Analytics:
   - Dashboard → **"Analytics"** → **"Enable"**
2. View:
   - Page load times
   - User traffic
   - Performance scores

## Maintenance

### Regular Updates

```bash
# Update dependencies monthly
npm update

# Check for security issues
npm audit

# Fix vulnerabilities
npm audit fix

# Commit and push
git add .
git commit -m "Update dependencies"
git push
```

### Backup Data

If using database:
1. Set up automated backups
2. Export data regularly
3. Store in separate location

## Cost Estimate

### Free Tier Includes:
- Unlimited deployments
- 100GB bandwidth/month
- Automatic SSL
- Preview deployments
- Analytics (basic)

### Paid Plans (if needed):
- **Pro**: $20/month (1TB bandwidth, advanced analytics)
- **Enterprise**: Custom pricing

## Next Steps

1. ✅ Test the live deployment
2. ✅ Share URL with team
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring
5. ✅ Plan future enhancements

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Docs**: [docs.github.com](https://docs.github.com)

---

**Congratulations!** Your roof inspection automation tool is now live and automatically updating with each push to GitHub.
