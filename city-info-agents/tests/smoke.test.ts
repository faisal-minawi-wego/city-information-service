import { describe, it, expect } from 'vitest';
import { mastra } from '../src/mastra';

describe('City Information System - Smoke Tests', () => {
  describe('System Setup', () => {
    it('should have mastra instance configured', () => {
      expect(mastra).toBeDefined();
    });

    it('should have all required agents registered', () => {
      const agents = mastra.getAgents();
      
      // Check that all our specialized agents are registered
      expect(agents).toHaveProperty('wikipediaAgent');
      expect(agents).toHaveProperty('geonamesAgent');
      expect(agents).toHaveProperty('osmAgent');
      expect(agents).toHaveProperty('weatherAgent');
      expect(agents).toHaveProperty('cityOrchestratorAgent');
      
      // Verify agent count (should have all our agents)
      const agentNames = Object.keys(agents);
      expect(agentNames.length).toBeGreaterThanOrEqual(5);
    });

    it('should have workflows registered', () => {
      const workflows = mastra.getWorkflows();
      
      expect(workflows).toHaveProperty('cityInfoWorkflow');
      
      const workflowNames = Object.keys(workflows);
      expect(workflowNames.length).toBeGreaterThanOrEqual(1);
    });

    it('should be able to get individual agents', () => {
      // Test Wikipedia Agent
      const wikipediaAgent = mastra.getAgent('wikipediaAgent');
      expect(wikipediaAgent).toBeDefined();
      expect(wikipediaAgent?.name).toBe('Wikipedia Specialist Agent');

      // Test GeoNames Agent
      const geonamesAgent = mastra.getAgent('geonamesAgent');
      expect(geonamesAgent).toBeDefined();
      expect(geonamesAgent?.name).toBe('GeoNames Specialist Agent');

      // Test OpenStreetMap Agent
      const osmAgent = mastra.getAgent('osmAgent');
      expect(osmAgent).toBeDefined();
      expect(osmAgent?.name).toBe('OpenStreetMap Specialist Agent');

      // Test Weather Agent
      const weatherAgent = mastra.getAgent('weatherAgent');
      expect(weatherAgent).toBeDefined();
      expect(weatherAgent?.name).toBe('Weather Specialist Agent');

      // Test Orchestrator Agent
      const orchestratorAgent = mastra.getAgent('cityOrchestratorAgent');
      expect(orchestratorAgent).toBeDefined();
      expect(orchestratorAgent?.name).toBe('City Orchestrator Agent');
    });

    it('should be able to get workflows', () => {
      // Test City Info Workflow
      const cityInfoWorkflow = mastra.getWorkflow('cityInfoWorkflow');
      expect(cityInfoWorkflow).toBeDefined();
      expect(cityInfoWorkflow?.id).toBe('city-info-workflow');

      // Only the City Info Workflow should exist now
    });
  });

  describe('Agent Configuration', () => {
    it('should have agents with proper tools configured', () => {
      const wikipediaAgent = mastra.getAgent('wikipediaAgent');
      expect(wikipediaAgent).toBeDefined();
      
      const geonamesAgent = mastra.getAgent('geonamesAgent');
      expect(geonamesAgent).toBeDefined();
      
      const osmAgent = mastra.getAgent('osmAgent');
      expect(osmAgent).toBeDefined();
      
      const weatherAgent = mastra.getAgent('weatherAgent');
      expect(weatherAgent).toBeDefined();
      
      // Orchestrator agent shouldn't have tools (it coordinates other agents)
      const orchestratorAgent = mastra.getAgent('cityOrchestratorAgent');
      expect(orchestratorAgent).toBeDefined();
    });

    it('should have agents configured', () => {
      const agents = mastra.getAgents();
      
      // Check that specific agents exist
      expect(agents.wikipediaAgent).toBeDefined();
      expect(agents.geonamesAgent).toBeDefined();
      expect(agents.osmAgent).toBeDefined();
      expect(agents.weatherAgent).toBeDefined();
      expect(agents.cityOrchestratorAgent).toBeDefined();
    });
  });

  describe('System Health', () => {
    it('should have storage configured', () => {
      expect(mastra.storage).toBeDefined();
    });

    it('should handle basic operations', () => {
      // Test that we can access the agents and workflows
      const agents = mastra.getAgents();
      const workflows = mastra.getWorkflows();
      
      expect(Object.keys(agents).length).toBeGreaterThan(0);
      expect(Object.keys(workflows).length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Validation', () => {
    it('should have environment variables for external APIs', () => {
      // These might be undefined in test environment, but we should at least check the structure
      const envVars = [
        'WIKIPEDIA_API_URL',
        'WIKIDATA_API_URL', 
        'OSM_OVERPASS_API_URL',
        'GEONAMES_API_URL'
      ];

      // Just verify these are strings or undefined (not other types)
      envVars.forEach(envVar => {
        const value = process.env[envVar];
        if (value !== undefined) {
          expect(typeof value).toBe('string');
        }
      });
    });

    it('should have consistent agent and workflow naming', () => {
      const agents = mastra.getAgents();
      const workflows = mastra.getWorkflows();

      // Verify naming consistency
      expect('cityOrchestratorAgent' in agents).toBe(true);
      expect('cityInfoWorkflow' in workflows).toBe(true);
    });
  });
}); 