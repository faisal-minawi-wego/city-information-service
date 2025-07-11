import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const wikipediaTool = createTool({
  id: 'wikipedia_city_info',
  description: 'Fetch comprehensive city information from Wikipedia including summary, activities, cuisine, attractions, and safety information',
  inputSchema: z.object({
    city_name: z.string().describe('Name of the city to search for'),
    country: z.string().optional().describe('Country name for disambiguation')
  }),
  outputSchema: z.object({
    source: z.literal('Wikipedia'),
    page_title: z.string().optional(),
    summary: z.string(),
    activities: z.array(z.string()),
    cuisine: z.array(z.string()),
    attractions: z.array(z.string()),
    safety: z.array(z.string()),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const { city_name, country } = context;
    try {
      // Search for the city page
      const pageTitle = await searchCityPage(city_name, country);
      if (!pageTitle) {
        return {
          source: 'Wikipedia' as const,
          summary: '',
          activities: [],
          cuisine: [],
          attractions: [],
          safety: [],
          error: `No Wikipedia page found for ${city_name}`
        };
      }

      // Get page content
      const pageData = await getPageContent(pageTitle);
      if (!pageData) {
        return {
          source: 'Wikipedia' as const,
          summary: '',
          activities: [],
          cuisine: [],
          attractions: [],
          safety: [],
          error: `Failed to fetch Wikipedia page content for ${pageTitle}`
        };
      }

      // Extract structured information
      const cityInfo = extractCityInfo(pageData, pageTitle);
      return cityInfo;

    } catch (error) {
      return {
        source: 'Wikipedia' as const,
        summary: '',
        activities: [],
        cuisine: [],
        attractions: [],
        safety: [],
        error: `Error fetching Wikipedia data: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
});

// Helper functions
async function searchCityPage(cityName: string, country?: string): Promise<string | null> {
  try {
    const searchTerm = country ? `${cityName}, ${country}` : cityName;
    
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'search',
      srsearch: searchTerm,
      srlimit: '5'
    });

    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?${params}`,
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
    const searchResults = data.query?.search || [];

    if (searchResults.length === 0) {
      return null;
    }

    // Return the first result's title
    return searchResults[0].title;

  } catch (error) {
    console.error(`Error searching Wikipedia for ${cityName}:`, error);
    return null;
  }
}

async function getPageContent(pageTitle: string): Promise<any> {
  try {
    // Get page summary
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const summaryResponse = await fetch(summaryUrl, {
      headers: {
        'User-Agent': 'CityInfoService/1.0'
      }
    });

    if (!summaryResponse.ok) {
      throw new Error(`HTTP error! status: ${summaryResponse.status}`);
    }

    const summaryData = await summaryResponse.json();

    // Get page sections for more detailed info
    const sectionsParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'extracts',
      exintro: 'true',
      explaintext: 'true',
      titles: pageTitle
    });

    const sectionsResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?${sectionsParams}`,
      {
        headers: {
          'User-Agent': 'CityInfoService/1.0'
        }
      }
    );

    if (!sectionsResponse.ok) {
      throw new Error(`HTTP error! status: ${sectionsResponse.status}`);
    }

    const sectionsData = await sectionsResponse.json();

    return {
      summary: summaryData,
      sections: sectionsData
    };

  } catch (error) {
    console.error(`Error fetching Wikipedia page content for ${pageTitle}:`, error);
    return null;
  }
}

function extractCityInfo(pageData: any, pageTitle: string): any {
  const info = {
    source: 'Wikipedia' as const,
    page_title: pageTitle,
    summary: '',
    activities: [] as string[],
    cuisine: [] as string[],
    attractions: [] as string[],
    safety: [] as string[]
  };

  try {
    // Extract summary
    const summaryData = pageData.summary || {};
    if (summaryData.extract) {
      info.summary = summaryData.extract;
    }

    // Extract additional content from sections
    const sectionsData = pageData.sections || {};
    const pages = sectionsData.query?.pages || {};

    for (const [pageId, pageInfo] of Object.entries(pages)) {
      const extract = (pageInfo as any).extract || '';
      if (extract) {
        // Parse content for different categories
        info.activities.push(...extractActivities(extract));
        info.cuisine.push(...extractCuisine(extract));
        info.attractions.push(...extractAttractions(extract));
        info.safety.push(...extractSafetyInfo(extract));
      }
    }

    // Remove duplicates
    info.activities = [...new Set(info.activities)];
    info.cuisine = [...new Set(info.cuisine)];
    info.attractions = [...new Set(info.attractions)];
    info.safety = [...new Set(info.safety)];

  } catch (error) {
    console.error('Error extracting city info from Wikipedia data:', error);
  }

  return info;
}

function extractActivities(text: string): string[] {
  const activities: string[] = [];
  const textLower = text.toLowerCase();
  
  // Look for activity-related keywords
  const activityKeywords = [
    'museum', 'park', 'theater', 'concert', 'festival', 'market',
    'shopping', 'nightlife', 'entertainment', 'sports', 'recreation',
    'gallery', 'exhibition', 'tour', 'walking', 'cycling'
  ];
  
  for (const keyword of activityKeywords) {
    if (textLower.includes(keyword)) {
      // Extract sentences containing the keyword
      const sentences = text.split('.');
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword) && sentence.trim().length > 20) {
          activities.push(sentence.trim());
          break;
        }
      }
    }
  }
  
  return activities.slice(0, 5); // Limit to 5 activities
}

function extractCuisine(text: string): string[] {
  const cuisine: string[] = [];
  const textLower = text.toLowerCase();
  
  // Look for food-related keywords
  const foodKeywords = [
    'cuisine', 'food', 'restaurant', 'dish', 'traditional', 'local',
    'specialty', 'famous', 'popular', 'dining', 'culinary'
  ];
  
  for (const keyword of foodKeywords) {
    if (textLower.includes(keyword)) {
      const sentences = text.split('.');
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword) && sentence.trim().length > 20) {
          cuisine.push(sentence.trim());
          break;
        }
      }
    }
  }
  
  return cuisine.slice(0, 3); // Limit to 3 cuisine items
}

function extractAttractions(text: string): string[] {
  const attractions: string[] = [];
  const textLower = text.toLowerCase();
  
  // Look for attraction-related keywords
  const attractionKeywords = [
    'landmark', 'monument', 'building', 'church', 'cathedral',
    'palace', 'castle', 'bridge', 'tower', 'square', 'attraction',
    'historic', 'famous', 'notable', 'important'
  ];
  
  for (const keyword of attractionKeywords) {
    if (textLower.includes(keyword)) {
      const sentences = text.split('.');
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword) && sentence.trim().length > 20) {
          attractions.push(sentence.trim());
          break;
        }
      }
    }
  }
  
  return attractions.slice(0, 5); // Limit to 5 attractions
}

function extractSafetyInfo(text: string): string[] {
  const safety: string[] = [];
  const textLower = text.toLowerCase();
  
  // Look for safety-related keywords
  const safetyKeywords = [
    'crime', 'safety', 'security', 'caution', 'warning', 'danger',
    'risk', 'precaution', 'emergency', 'police', 'health', 'medical'
  ];
  
  for (const keyword of safetyKeywords) {
    if (textLower.includes(keyword)) {
      const sentences = text.split('.');
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword) && sentence.trim().length > 20) {
          safety.push(sentence.trim());
          break;
        }
      }
    }
  }
  
  return safety.slice(0, 3); // Limit to 3 safety items
} 