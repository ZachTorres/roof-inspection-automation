# Quick Setup Guide

Get your Roof Inspection Automation tool running in 5 minutes!

## Step 1: Install Dependencies

Open terminal in project folder and run:

```bash
npm install
```

This installs:
- Next.js (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- React Dropzone (file uploads)
- jsPDF (PDF generation)
- date-fns (date handling)
- Zustand (state management)

**Installation time**: 2-3 minutes

## Step 2: Run Development Server

```bash
npm run dev
```

Open browser to: **http://localhost:3000**

You should see the Roof Inspection Automation homepage!

## Step 3: Test the Application

### Test Photo Upload
1. Click or drag photos into the upload area
2. Fill in customer information
3. Categorize photos (shingles, flashing, etc.)
4. Click "Next: Analyze Damage"

### Test Damage Analysis
1. Wait for AI analysis (simulated, ~2 seconds)
2. Review auto-generated damage findings
3. Edit descriptions and costs
4. Add custom findings
5. Click "Next: Generate Report"

### Test PDF Generation
1. Review report contents
2. Click "Generate PDF Report"
3. Download and open the PDF
4. Verify all information is correct
5. Click "Next: Track Claim"

### Test Claim Tracking
1. Update claim status
2. Schedule follow-up tasks
3. Mark tasks complete
4. Add new follow-ups

## Troubleshooting

### Error: "Cannot find module"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 Already in Use
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
npm run dev -- -p 3001
```

### Build Errors
```bash
# Check TypeScript errors
npm run build

# Fix common issues
npm update
```

## Project Structure

```
roof-inspection-automation/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with steps
│   └── globals.css         # Global styles
├── components/
│   ├── PhotoUploader.tsx   # Step 1: Upload photos
│   ├── DamageAnalyzer.tsx  # Step 2: Analyze damage
│   ├── ReportGenerator.tsx # Step 3: Generate PDF
│   └── ClaimTracker.tsx    # Step 4: Track claims
├── lib/
│   └── store.ts            # State management
├── public/                 # Static assets
├── package.json            # Dependencies
├── tsconfig.json          # TypeScript config
└── tailwind.config.ts     # Tailwind config
```

## Customization Quick Start

### 1. Change Company Branding

Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Your Company Name - Roof Inspections",
  description: "Your custom description",
};
```

### 2. Adjust Cost Estimates

Edit `components/DamageAnalyzer.tsx`:
```typescript
// Line ~45-50
estimatedCost: 2500, // Change default costs
```

### 3. Modify Report Template

Edit `components/ReportGenerator.tsx`:
```typescript
// Line ~25-30 - Change header
doc.text('YOUR COMPANY NAME', 105, 15, { align: 'center' });
```

### 4. Add Your Logo

1. Place logo in `public/logo.png`
2. Edit `app/page.tsx`:
```typescript
<img src="/logo.png" alt="Logo" className="h-12" />
```

## Next Steps

1. ✅ Test all features thoroughly
2. ✅ Customize branding and costs
3. ✅ Deploy to Vercel (see DEPLOYMENT.md)
4. ✅ Share with team
5. ✅ Start saving 10+ hours weekly!

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Check for TypeScript errors
npm run type-check

# Lint code
npm run lint
```

## Performance Tips

1. **Optimize Images**: Use WebP format for photos
2. **Limit File Sizes**: Keep PDFs under 10MB
3. **Clear Browser Cache**: If changes don't appear
4. **Use Chrome DevTools**: Check console for errors

## Support

- **Documentation**: See README.md
- **Deployment**: See DEPLOYMENT.md
- **Issues**: Check browser console logs

---

**Ready to save 10+ hours weekly on roof inspection reports!**
