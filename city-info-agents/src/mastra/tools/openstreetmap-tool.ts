import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const POISchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  opening_hours: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lon: z.number()
  }).optional()
});

export const osmTool = createTool({
  id: 'openstreetmap_city_info',
  description: 'Fetch points of interest and city features from OpenStreetMap including restaurants, museums, parks, and cultural sites',
  inputSchema: z.object({
    city_name: z.string().describe('Name of the city to search for'),
    country: z.string().optional().describe('Country name for disambiguation')
  }),
  outputSchema: z.object({
    source: z.literal('OpenStreetMap'),
    city_area: z.object({
      area_id: z.number().optional(),
      name: z.string().optional(),
      place_type: z.string().optional(),
      population: z.string().optional()
    }).optional(),
    restaurants: z.array(POISchema),
    museums: z.array(POISchema),
    parks: z.array(POISchema),
    leisure: z.array(POISchema),
    cultural: z.array(POISchema),
    historical: z.array(POISchema),
    markets: z.array(POISchema),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const { city_name, country } = context;
    
    try {
      // First, find the city boundary/area
      const cityArea = await findCityArea(city_name, country);
      if (!cityArea) {
        return {
          source: 'OpenStreetMap' as const,
          restaurants: [],
          museums: [],
          parks: [],
          leisure: [],
          cultural: [],
          historical: [],
          markets: [],
          error: `No OpenStreetMap area found for ${city_name}`
        };
      }

      // Get different types of POIs
      const info = {
        source: 'OpenStreetMap' as const,
        city_area: cityArea,
        restaurants: [] as any[],
        museums: [] as any[],
        parks: [] as any[],
        leisure: [] as any[],
        cultural: [] as any[],
        historical: [] as any[],
        markets: [] as any[]
      };

      // Query different categories of POIs
      const areaId = cityArea.area_id;
      if (areaId) {
        // Get restaurants
        info.restaurants = await getRestaurants(areaId);
        await sleep(1000); // Rate limiting
        
        // Get museums
        info.museums = await getMuseums(areaId);
        await sleep(1000);
        
        // Get parks
        info.parks = await getParks(areaId);
        await sleep(1000);
        
        // Get leisure facilities
        info.leisure = await getLeisureFacilities(areaId);
      }

      return info;

    } catch (error) {
      return {
        source: 'OpenStreetMap' as const,
        restaurants: [],
        museums: [],
        parks: [],
        leisure: [],
        cultural: [],
        historical: [],
        markets: [],
        error: `Error fetching OpenStreetMap data: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
});

// Helper functions
async function findCityArea(cityName: string, country?: string): Promise<any> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        relation["name"~"${cityName}",i]["place"~"city|town|village"]["admin_level"~"[4-8]"];
        way["name"~"${cityName}",i]["place"~"city|town|village"];
        node["name"~"${cityName}",i]["place"~"city|town|village"];
        relation["name"~"${cityName}",i]["boundary"="administrative"]["admin_level"~"[4-8]"];
      );
      out center;
    `;

    const response = await fetch(process.env.OSM_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'CityInfoService/1.0'
      },
      body: query
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    if (elements.length === 0) {
      return null;
    }

    // Find the best match (prefer relations, then ways, then nodes)
    let bestMatch = null;
    for (const element of elements) {
      if (element.type === 'relation') {
        bestMatch = element;
        break;
      } else if (element.type === 'way' && !bestMatch) {
        bestMatch = element;
      } else if (element.type === 'node' && !bestMatch) {
        bestMatch = element;
      }
    }

    if (!bestMatch) {
      return null;
    }

    // Extract area information
    const areaInfo = {
      area_id: bestMatch.id,
      type: bestMatch.type,
      name: bestMatch.tags?.name || cityName,
      place_type: bestMatch.tags?.place,
      admin_level: bestMatch.tags?.admin_level,
      population: bestMatch.tags?.population,
      center: bestMatch.center
    };

    return areaInfo;

  } catch (error) {
    console.error(`Error finding city area for ${cityName}:`, error);
    return null;
  }
}

async function getRestaurants(areaId: number): Promise<any[]> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](area:${areaId});
        way["amenity"="restaurant"](area:${areaId});
      );
      out center;
    `;

    const response = await fetch(process.env.OSM_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'CityInfoService/1.0'
      },
      body: query
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    const restaurants: any[] = [];
    for (const element of elements.slice(0, 20)) { // Limit to top 20
      const tags = element.tags || {};
      const restaurant = {
        name: tags.name || 'Unknown',
        type: tags.cuisine || 'restaurant',
        address: tags['addr:street'],
        phone: tags.phone,
        website: tags.website,
        opening_hours: tags.opening_hours,
        coordinates: extractCoordinates(element)
      };
      restaurants.push(restaurant);
    }

    return restaurants;

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
}

async function getMuseums(areaId: number): Promise<any[]> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"="museum"](area:${areaId});
        way["tourism"="museum"](area:${areaId});
      );
      out center;
    `;

    const response = await fetch(process.env.OSM_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'CityInfoService/1.0'
      },
      body: query
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    const museums: any[] = [];
    for (const element of elements.slice(0, 15)) { // Limit to top 15
      const tags = element.tags || {};
      const museum = {
        name: tags.name || 'Unknown Museum',
        type: 'museum',
        address: tags['addr:street'],
        phone: tags.phone,
        website: tags.website,
        opening_hours: tags.opening_hours,
        coordinates: extractCoordinates(element)
      };
      museums.push(museum);
    }

    return museums;

  } catch (error) {
    console.error('Error fetching museums:', error);
    return [];
  }
}

async function getParks(areaId: number): Promise<any[]> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["leisure"="park"](area:${areaId});
        way["leisure"="park"](area:${areaId});
        relation["leisure"="park"](area:${areaId});
      );
      out center;
    `;

    const response = await fetch(process.env.OSM_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'CityInfoService/1.0'
      },
      body: query
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    const parks: any[] = [];
    for (const element of elements.slice(0, 15)) { // Limit to top 15
      const tags = element.tags || {};
      const park = {
        name: tags.name || 'Unknown Park',
        type: 'park',
        address: tags['addr:street'],
        coordinates: extractCoordinates(element)
      };
      parks.push(park);
    }

    return parks;

  } catch (error) {
    console.error('Error fetching parks:', error);
    return [];
  }
}

async function getLeisureFacilities(areaId: number): Promise<any[]> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["leisure"~"sports_centre|swimming_pool|fitness_centre|golf_course|stadium"](area:${areaId});
        way["leisure"~"sports_centre|swimming_pool|fitness_centre|golf_course|stadium"](area:${areaId});
      );
      out center;
    `;

    const response = await fetch(process.env.OSM_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'CityInfoService/1.0'
      },
      body: query
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    const leisure: any[] = [];
    for (const element of elements.slice(0, 10)) { // Limit to top 10
      const tags = element.tags || {};
      const facility = {
        name: tags.name || 'Unknown Facility',
        type: tags.leisure || 'leisure',
        address: tags['addr:street'],
        phone: tags.phone,
        website: tags.website,
        opening_hours: tags.opening_hours,
        coordinates: extractCoordinates(element)
      };
      leisure.push(facility);
    }

    return leisure;

  } catch (error) {
    console.error('Error fetching leisure facilities:', error);
    return [];
  }
}

function extractCoordinates(element: any): { lat: number; lon: number } | undefined {
  if (element.lat && element.lon) {
    return { lat: element.lat, lon: element.lon };
  }
  if (element.center) {
    return { lat: element.center.lat, lon: element.center.lon };
  }
  return undefined;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 