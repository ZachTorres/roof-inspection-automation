# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Roof Inspection Report Automation** for United Roofing - A Next.js application that automates insurance claim documentation for roofing companies. The application processes inspection photos, generates AI-powered damage analysis, creates professional PDF reports, and tracks insurance claims.

**Branding**: UC Roofing with tagline "Experience the Royal Treatment"

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm lint
```

## Architecture

### Tech Stack
- **Next.js 15** with App Router (React Server Components)
- **TypeScript** with strict mode enabled
- **Tailwind CSS** with custom UC Roofing color scheme
- **Zustand** for client-side state management with persistence
- **jsPDF** for PDF report generation
- **react-dropzone** for photo uploads
- **date-fns** for date utilities

### Application Flow

The app follows a 4-step wizard pattern managed by state in [app/page.tsx](app/page.tsx):

1. **PhotoUploader** ([components/PhotoUploader.tsx](components/PhotoUploader.tsx))
   - Collects customer information and inspection photos
   - Drag-and-drop photo upload with category assignment
   - Categories: general, shingles, flashing, gutters, vents, chimney, damage
   - Validates customer name and address before proceeding

2. **DamageAnalyzer** ([components/DamageAnalyzer.tsx](components/DamageAnalyzer.tsx))
   - Simulates AI damage detection (2.5 second delay)
   - Uses template-based damage generation from `damageTemplates` object
   - Generates realistic findings based on photo categories
   - Allows manual editing/adding/removing damage items
   - Calculates total cost estimate

3. **ReportGenerator** ([components/ReportGenerator.tsx](components/ReportGenerator.tsx))
   - Previews report data
   - Generates professional PDF using jsPDF
   - Creates downloadable insurance-ready reports
   - Saves inspection to store

4. **ClaimTracker** ([components/ClaimTracker.tsx](components/ClaimTracker.tsx))
   - Tracks claim status (submitted, under review, approved, denied)
   - Manages follow-up tasks with due dates
   - Shows overdue alerts
   - Displays claim history

### State Management

**Global Store** ([lib/store.ts](lib/store.ts)):
- Uses Zustand with persistence middleware
- Stores inspection history in localStorage as `roof-inspection-storage`
- Interface: `Inspection` with customer info, analysis, report metadata, claim status, and follow-ups
- Methods: `addInspection`, `updateInspection`, `deleteInspection`, `getInspection`

**Local State**:
- Main wizard state managed in [app/page.tsx](app/page.tsx) with `inspectionData` object
- Each component manages its own form state

### Styling

Custom color scheme defined in [tailwind.config.ts](tailwind.config.ts):
- `uc-navy`: Primary dark blue (#071830, with light/dark variants)
- `uc-blue`: Primary blue (#2563eb, with light/dark variants)
- `uc-accent`: Accent blue for highlights

All components support dark mode using Tailwind's `dark:` variant.

### Path Aliases

TypeScript is configured with `@/*` alias mapping to root directory. Use `@/components/` or `@/lib/` for imports.

## Key Implementation Details

### Damage Analysis Templates

The AI simulation in [components/DamageAnalyzer.tsx](components/DamageAnalyzer.tsx) uses the `damageTemplates` object (lines 21-126) containing:
- Category-specific damage patterns
- Realistic descriptions with variable substitution (`{location}`, `{age}`, `{life}`)
- Severity levels (minor, moderate, severe)
- Cost ranges
- Common locations

When adding new damage types or modifying analysis logic, update this template object.

### PDF Generation

Reports are generated client-side in [components/ReportGenerator.tsx](components/ReportGenerator.tsx) using jsPDF. The PDF includes:
- Header with company branding
- Customer information section
- Damage findings table
- Total cost estimate
- Professional recommendations
- Formatted for insurance submission

### Photo Handling

Photos are stored as File objects with preview URLs created using `URL.createObjectURL()`. Memory is cleaned up with `URL.revokeObjectURL()` when photos are removed. Photos are NOT persisted to storage - only in-memory during the session.

## TypeScript Configuration

- Strict mode enabled
- Target: ES2017
- Module resolution: bundler
- Path alias: `@/*` maps to `./*`
- JSX: preserve (handled by Next.js)

## Important Constraints

1. **No Backend**: Currently no server-side API, database, or cloud storage. All data is client-side only.
2. **Simulated AI**: Damage analysis uses template-based generation, not actual AI/ML models.
3. **Local Storage Only**: Zustand persistence uses localStorage - data is per-browser.
4. **No Authentication**: No user accounts or multi-tenant support.

## Future Enhancement Areas

When implementing new features, consider these planned enhancements mentioned in README:
- Real AI integration (GPT-4 Vision API)
- Cloud storage (AWS S3/Cloudinary)
- Database (PostgreSQL/MongoDB)
- Email automation
- Multi-user/team collaboration
- Analytics dashboard
