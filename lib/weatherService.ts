// Weather data service for inspection documentation
// Uses Open-Meteo API (free, no API key required)

export interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  precipitation: number;
  timestamp: string;
}

export async function getWeatherData(address: string): Promise<WeatherData | null> {
  try {
    // First, geocode the address to get coordinates
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      address
    )}&count=1&language=en&format=json`;

    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      console.warn('Could not geocode address');
      return null;
    }

    const { latitude, longitude } = geocodeData.results[0];

    // Get current weather data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherData.current) {
      console.warn('Could not fetch weather data');
      return null;
    }

    const current = weatherData.current;

    // Map weather codes to human-readable conditions
    const weatherCondition = getWeatherCondition(current.weather_code);

    return {
      temperature: Math.round(current.temperature_2m),
      condition: weatherCondition,
      windSpeed: Math.round(current.wind_speed_10m),
      humidity: Math.round(current.relative_humidity_2m),
      precipitation: current.precipitation || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

function getWeatherCondition(code: number): string {
  // WMO Weather interpretation codes
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function getWeatherIcon(condition: string): string {
  const iconMap: { [key: string]: string } = {
    'Clear': '☀️',
    'Mainly Clear': '🌤️',
    'Partly Cloudy': '⛅',
    'Overcast': '☁️',
    'Foggy': '🌫️',
    'Rainy': '🌧️',
    'Snowy': '❄️',
    'Rain Showers': '🌦️',
    'Snow Showers': '🌨️',
    'Thunderstorm': '⛈️',
  };
  return iconMap[condition] || '🌡️';
}
