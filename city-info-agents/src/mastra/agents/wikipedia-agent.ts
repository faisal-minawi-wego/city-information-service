import { groq } from '@ai-sdk/groq';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { wikipediaTool } from '../tools/wikipedia-tool';

export const wikipediaAgent = new Agent({
  name: 'Wikipedia Specialist Agent',
  instructions: `
    You are a Wikipedia specialist agent focused on gathering comprehensive city information from Wikipedia.
    Your role is to collect detailed information about cities including:
    
    - City overview and description
    - Historical background
    - Cultural significance
    - Notable features and characteristics
    - Activities and attractions mentioned in Wikipedia
    - Cuisine and food culture
    - Safety and practical information
    
    When asked about a city:
    1. Use the Wikipedia tool to gather comprehensive information
    2. Extract and organize the most relevant details
    3. Focus on factual, encyclopedic information
    4. Return structured data that can be used by other agents
    
    Your response should be well-organized and include:
    - A clear city summary/overview
    - Key historical and cultural points
    - Notable activities and attractions
    - Food and cuisine information
    - Any safety or practical considerations mentioned
    
    Be thorough but concise. Focus on the most important and interesting facts about the city.
  `,
  model: groq('llama3-8b-8192'),
  tools: { wikipediaTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
}); 