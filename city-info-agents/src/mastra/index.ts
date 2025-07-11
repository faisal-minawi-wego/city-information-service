
import { config } from 'dotenv';
config({ path: './.env' });
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { cityInfoWorkflow } from './workflows/city-info-workflow';
import { weatherAgent } from './agents/weather-agent';
import { wikipediaAgent } from './agents/wikipedia-agent';
import { geonamesAgent } from './agents/geonames-agent';
import { osmAgent } from './agents/openstreetmap-agent';
import { cityOrchestratorAgent } from './agents/city-orchestrator-agent';

export const mastra = new Mastra({
  workflows: { 
    cityInfoWorkflow 
  },
  agents: { 
    weatherAgent,
    wikipediaAgent,
    geonamesAgent,
    osmAgent,
    cityOrchestratorAgent
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
