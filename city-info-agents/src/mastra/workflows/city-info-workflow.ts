import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Gather Wikipedia information
const gatherWikipediaInfo = createStep({
  id: 'gather-wikipedia-info',
  description: 'Gathers comprehensive city information from Wikipedia',
  inputSchema: z.object({
    city: z.string().describe('The city to research'),
    country: z.string().optional().describe('Country for disambiguation'),
  }),
  outputSchema: z.object({
    city: z.string(),
    country: z.string().optional(),
    wikipedia_info: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('wikipediaAgent');
    if (!agent) {
      throw new Error('Wikipedia agent not found');
    }

    const prompt = `Please gather comprehensive information about ${inputData.city}${inputData.country ? `, ${inputData.country}` : ''}. 
    
    Focus on:
    - General city overview and description
    - Historical background and cultural significance
    - Notable activities and attractions
    - Food culture and cuisine
    - Safety information and practical considerations
    
    Use your Wikipedia tool to gather this information and provide a detailed summary.`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let wikipediaInfo = '';
    for await (const chunk of response.textStream) {
      wikipediaInfo += chunk;
    }

    return {
      city: inputData.city,
      country: inputData.country,
      wikipedia_info: wikipediaInfo,
    };
  },
});

// Step 2: Gather GeoNames information
const gatherGeonamesInfo = createStep({
  id: 'gather-geonames-info',
  description: 'Gathers precise geographic and demographic data from GeoNames',
  inputSchema: z.object({
    city: z.string(),
    country: z.string().optional(),
    wikipedia_info: z.string(),
  }),
  outputSchema: z.object({
    city: z.string(),
    country: z.string().optional(),
    wikipedia_info: z.string(),
    geonames_info: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('geonamesAgent');
    if (!agent) {
      throw new Error('GeoNames agent not found');
    }

    const prompt = `Please gather precise geographic and demographic information about ${inputData.city}${inputData.country ? `, ${inputData.country}` : ''}. 
    
    Focus on:
    - Exact location (coordinates, administrative divisions)
    - Population data
    - Timezone and elevation
    - Geographic classification and features
    
    Use your GeoNames tool to gather this information and provide accurate location data.`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let geonamesInfo = '';
    for await (const chunk of response.textStream) {
      geonamesInfo += chunk;
    }

    return {
      city: inputData.city,
      country: inputData.country,
      wikipedia_info: inputData.wikipedia_info,
      geonames_info: geonamesInfo,
    };
  },
});

// Step 3: Gather OpenStreetMap information
const gatherOSMInfo = createStep({
  id: 'gather-osm-info',
  description: 'Gathers points of interest and local facilities from OpenStreetMap',
  inputSchema: z.object({
    city: z.string(),
    country: z.string().optional(),
    wikipedia_info: z.string(),
    geonames_info: z.string(),
  }),
  outputSchema: z.object({
    city: z.string(),
    country: z.string().optional(),
    wikipedia_info: z.string(),
    geonames_info: z.string(),
    osm_info: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('osmAgent');
    if (!agent) {
      throw new Error('OpenStreetMap agent not found');
    }

    const prompt = `Please gather detailed information about points of interest and local facilities in ${inputData.city}${inputData.country ? `, ${inputData.country}` : ''}. 
    
    Focus on:
    - Specific restaurants and dining establishments
    - Museums and cultural institutions
    - Parks and recreational areas
    - Leisure facilities and sports centers
    - Historical sites and landmarks
    - Markets and shopping areas
    
    Use your OpenStreetMap tool to gather this information and provide specific place names and locations.`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let osmInfo = '';
    for await (const chunk of response.textStream) {
      osmInfo += chunk;
    }

    return {
      city: inputData.city,
      country: inputData.country,
      wikipedia_info: inputData.wikipedia_info,
      geonames_info: inputData.geonames_info,
      osm_info: osmInfo,
    };
  },
});

// Step 4: Gather Weather information (using existing weather agent)
const gatherWeatherInfo = createStep({
  id: 'gather-weather-info',
  description: 'Gathers current weather information for the city',
  inputSchema: z.object({
    city: z.string(),
    country: z.string().optional(),
    wikipedia_info: z.string(),
    geonames_info: z.string(),
    osm_info: z.string(),
  }),
  outputSchema: z.object({
    city: z.string(),
    country: z.string().optional(),
    wikipedia_info: z.string(),
    geonames_info: z.string(),
    osm_info: z.string(),
    weather_info: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('weatherAgent');
    if (!agent) {
      throw new Error('Weather agent not found');
    }

    const prompt = `Please get the current weather information for ${inputData.city}${inputData.country ? `, ${inputData.country}` : ''}. 
    
    Provide:
    - Current temperature and conditions
    - Humidity and wind information
    - Weather conditions description
    - Any relevant weather considerations for visitors
    
    Use your weather tool to gather this current weather data.`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let weatherInfo = '';
    for await (const chunk of response.textStream) {
      weatherInfo += chunk;
    }

    return {
      city: inputData.city,
      country: inputData.country,
      wikipedia_info: inputData.wikipedia_info,
      geonames_info: inputData.geonames_info,
      osm_info: inputData.osm_info,
      weather_info: weatherInfo,
    };
  },
});

// Step 5: Orchestrate and synthesize all information
const orchestrateCityInfo = createStep({
  id: 'orchestrate-city-info',
  description: 'Synthesizes all gathered information into a comprehensive city profile',
  inputSchema: z.object({
    city: z.string(),
    country: z.string().optional(),
    wikipedia_info: z.string(),
    geonames_info: z.string(),
    osm_info: z.string(),
    weather_info: z.string(),
  }),
  outputSchema: z.object({
    city_information: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('cityOrchestratorAgent');
    if (!agent) {
      throw new Error('City Orchestrator agent not found');
    }

    const prompt = `Please synthesize the following information about ${inputData.city}${inputData.country ? `, ${inputData.country}` : ''} into a comprehensive, well-structured city profile.

AVAILABLE DATA SOURCES:

WIKIPEDIA INFORMATION:
${inputData.wikipedia_info}

GEONAMES INFORMATION:
${inputData.geonames_info}

OPENSTREETMAP INFORMATION:
${inputData.osm_info}

WEATHER INFORMATION:
${inputData.weather_info}

IMPORTANT INSTRUCTIONS:
- Some data sources may have failed or returned errors - this is NORMAL
- Use the available data and supplement with your extensive knowledge about ${inputData.city}
- If a tool failed, use your general knowledge to provide that section
- You MUST provide a complete response with all 6 sections regardless of tool failures

Please create a comprehensive city information response using the exact format specified in your instructions:

🏙️ **City Overview**
☀️ **Weather**
🎯 **Activities**
🍽️ **Good Food**
📸 **Attractions**
⚠️ **Things to Worry About**

Synthesize available information and fill gaps with your knowledge to create a useful, complete city guide for travelers.`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let cityInformation = '';
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      cityInformation += chunk;
    }

    return {
      city_information: cityInformation,
    };
  },
});

// Create the main workflow
const cityInfoWorkflow = createWorkflow({
  id: 'city-info-workflow',
  inputSchema: z.object({
    city: z.string().describe('The city to research'),
    country: z.string().optional().describe('Country for disambiguation'),
  }),
  outputSchema: z.object({
    city_information: z.string(),
  }),
})
  .then(gatherWikipediaInfo)
  .then(gatherGeonamesInfo)
  .then(gatherOSMInfo)
  .then(gatherWeatherInfo)
  .then(orchestrateCityInfo);

cityInfoWorkflow.commit();

export { cityInfoWorkflow }; 