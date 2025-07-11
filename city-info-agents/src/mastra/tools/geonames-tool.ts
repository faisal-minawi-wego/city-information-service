import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const geonamesTool = createTool({
  id: 'geonames_city_info',
  description: 'Fetch geographic and demographic city information from GeoNames API including location, population, timezone, and administrative details',
  inputSchema: z.object({
    city_name: z.string().describe('Name of the city to search for'),
    country: z.string().optional().describe('Country name or code for disambiguation')
  }),
  outputSchema: z.object({
    source: z.literal('GeoNames'),
    geoname_id: z.number().optional(),
    name: z.string().optional(),
    ascii_name: z.string().optional(),
    location: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }),
    country: z.string().optional(),
    country_code: z.string().optional(),
    admin_division: z.string().optional(),
    population: z.number().optional(),
    elevation: z.number().optional(),
    timezone: z.string().optional(),
    feature_class: z.string().optional(),
    feature_code: z.string().optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const { city_name, country } = context;
    
    try {
      // Search for the city
      const cityData = await searchCity(city_name, country);
      if (!cityData) {
        // Return basic info with fallback data for common cities
        return getFallbackCityData(city_name, country);
      }

      // Get additional details
      const geonameId = cityData.geonameId;
      let detailedInfo = {};
      if (geonameId) {
        detailedInfo = await getDetailedInfo(geonameId);
      }

      return formatCityData({ ...cityData, ...detailedInfo });

    } catch (error) {
      return {
        source: 'GeoNames' as const,
        location: {},
        error: `Error fetching GeoNames data: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
});

// Helper functions
async function searchCity(cityName: string, country?: string): Promise<any> {
  try {
    const params = new URLSearchParams({
      q: cityName,
      maxRows: '10',
      username: process.env.GEONAMES_USERNAME || 'demo',
      type: 'json',
      featureClass: 'P', // Populated places
      orderby: 'population'
    });

    // Add country filter if provided
    if (country) {
      const countryCode = getCountryCode(country);
      if (countryCode) {
        params.append('country', countryCode);
      }
    }

    const response = await fetch(
      `https://secure.geonames.org/searchJSON?${params}`,
      {
        headers: {
          'User-Agent': 'CityInfoService/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const geonames = data.geonames || [];

    if (geonames.length === 0) {
      return null;
    }

    // Find the best match (largest population in the right country)
    let bestMatch = null;
    for (const city of geonames) {
      // Prefer cities over other place types
      if (city.fcl === 'P' && ['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC'].includes(city.fcode)) {
        if (!bestMatch || (city.population || 0) > (bestMatch.population || 0)) {
          bestMatch = city;
        }
      }
    }

    return bestMatch || geonames[0];

  } catch (error) {
    console.error(`Error searching GeoNames for ${cityName}:`, error);
    return null;
  }
}

async function getDetailedInfo(geonameId: number): Promise<any> {
  try {
    const params = new URLSearchParams({
      geonameId: String(geonameId),
      username: process.env.GEONAMES_USERNAME || 'demo',
      type: 'json'
    });

    const response = await fetch(
      `https://secure.geonames.org/getJSON?${params}`,
      {
        headers: {
          'User-Agent': 'CityInfoService/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error(`Error fetching detailed GeoNames info for ID ${geonameId}:`, error);
    return {};
  }
}

function getCountryCode(country: string): string | null {
  // Common country name to code mappings
  const countryCodes: Record<string, string> = {
    'united states': 'US',
    'usa': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'england': 'GB',
    'france': 'FR',
    'germany': 'DE',
    'italy': 'IT',
    'spain': 'ES',
    'japan': 'JP',
    'china': 'CN',
    'india': 'IN',
    'canada': 'CA',
    'australia': 'AU',
    'brazil': 'BR',
    'russia': 'RU',
    'netherlands': 'NL',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'switzerland': 'CH',
    'austria': 'AT',
    'belgium': 'BE',
    'poland': 'PL',
    'turkey': 'TR',
    'egypt': 'EG',
    'south africa': 'ZA',
    'mexico': 'MX',
    'argentina': 'AR',
    'thailand': 'TH',
    'south korea': 'KR',
    'israel': 'IL',
    'greece': 'GR',
    'portugal': 'PT',
    'czech republic': 'CZ',
    'hungary': 'HU',
    'finland': 'FI',
    'ireland': 'IE',
    'new zealand': 'NZ'
  };

  const countryLower = country.toLowerCase();
  if (countryLower in countryCodes) {
    return countryCodes[countryLower];
  }

  // If it's already a 2-letter code, return it
  if (country.length === 2 && /^[A-Za-z]{2}$/.test(country)) {
    return country.toUpperCase();
  }

  return null;
}

function formatCityData(cityData: any): any {
  return {
    source: 'GeoNames' as const,
    geoname_id: cityData.geonameId,
    name: cityData.name,
    ascii_name: cityData.asciiName,
    location: {
      latitude: cityData.lat ? parseFloat(cityData.lat) : undefined,
      longitude: cityData.lng ? parseFloat(cityData.lng) : undefined
    },
    country: cityData.countryName,
    country_code: cityData.countryCode,
    admin_division: cityData.adminName1,
    population: cityData.population,
    elevation: cityData.elevation,
    timezone: cityData.timezone?.timeZoneId,
    feature_class: cityData.fcl,
    feature_code: cityData.fcode
  };
}

function getFallbackCityData(city_name: string, country?: string): any {
  // Fallback data for common cities when API fails
  const fallbackData: Record<string, any> = {
    'tokyo': {
      name: 'Tokyo',
      location: { latitude: 35.6762, longitude: 139.6503 },
      country: 'Japan',
      country_code: 'JP',
      population: 14000000,
      timezone: 'Asia/Tokyo',
      admin_division: 'Tokyo Metropolis'
    },
    'london': {
      name: 'London',
      location: { latitude: 51.5074, longitude: -0.1278 },
      country: 'United Kingdom',
      country_code: 'GB',
      population: 9000000,
      timezone: 'Europe/London',
      admin_division: 'Greater London'
    },
    'paris': {
      name: 'Paris',
      location: { latitude: 48.8566, longitude: 2.3522 },
      country: 'France',
      country_code: 'FR',
      population: 2200000,
      timezone: 'Europe/Paris',
      admin_division: 'Île-de-France'
    },
    'new york': {
      name: 'New York',
      location: { latitude: 40.7128, longitude: -74.0060 },
      country: 'United States',
      country_code: 'US',
      population: 8400000,
      timezone: 'America/New_York',
      admin_division: 'New York'
    },
    'beirut': {
      name: 'Beirut',
      location: { latitude: 33.8938, longitude: 35.5018 },
      country: 'Lebanon',
      country_code: 'LB',
      population: 2200000,
      timezone: 'Asia/Beirut',
      admin_division: 'Beirut Governorate'
    }
  };

  const cityKey = city_name.toLowerCase();
  const fallback = fallbackData[cityKey];

  if (fallback) {
    return {
      source: 'GeoNames' as const,
      ...fallback,
      error: `Using fallback data - GeoNames API unavailable for ${city_name}`
    };
  }

  return {
    source: 'GeoNames' as const,
    name: city_name,
    country: country,
    location: {},
    error: `No GeoNames data found for ${city_name} and no fallback available`
  };
} 