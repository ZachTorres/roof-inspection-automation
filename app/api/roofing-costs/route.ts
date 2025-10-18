import { NextResponse } from 'next/server';

// Cache duration: 24 hours (costs don't change daily)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface RoofingCosts {
  perSqFt: {
    min: number;
    max: number;
    average: number;
  };
  typicalRoofSize: {
    small: number;
    medium: number;
    large: number;
  };
  fullReplacement: {
    small: { min: number; max: number };
    medium: { min: number; max: number };
    large: { min: number; max: number };
  };
  lastUpdated: string;
  source: string;
}

let cachedCosts: RoofingCosts | null = null;
let lastFetchTime = 0;

// Fallback to our researched data if fetch fails
const FALLBACK_COSTS: RoofingCosts = {
  perSqFt: {
    min: 5.0,
    max: 8.5,
    average: 6.5,
  },
  typicalRoofSize: {
    small: 1500,
    medium: 2000,
    large: 2500,
  },
  fullReplacement: {
    small: { min: 7500, max: 12750 },
    medium: { min: 10000, max: 17000 },
    large: { min: 12500, max: 21250 },
  },
  lastUpdated: new Date().toISOString(),
  source: 'Industry average (2025)',
};

async function fetchLiveRoofingCosts(): Promise<RoofingCosts> {
  // Check cache first
  const now = Date.now();
  if (cachedCosts && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedCosts;
  }

  try {
    // Option 1: Use web scraping (example - you'd need cheerio or similar)
    // For now, we'll simulate fetching and use our researched data
    // In production, you could:
    // - Scrape HomeGuide, Angi, HomeAdvisor
    // - Use BLS API for construction cost indices
    // - Subscribe to roofing industry data feeds

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // For now, return our researched data with dynamic updates
    // You can replace this with actual API calls or web scraping
    const currentYear = new Date().getFullYear();
    const costs: RoofingCosts = {
      ...FALLBACK_COSTS,
      lastUpdated: new Date().toISOString(),
      source: `Industry data (${currentYear})`,
    };

    // Cache the results
    cachedCosts = costs;
    lastFetchTime = now;

    return costs;
  } catch (error) {
    console.error('Error fetching roofing costs:', error);
    return FALLBACK_COSTS;
  }
}

export async function GET() {
  try {
    const costs = await fetchLiveRoofingCosts();

    return NextResponse.json({
      success: true,
      data: costs,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch roofing costs',
        data: FALLBACK_COSTS,
      },
      { status: 500 }
    );
  }
}
