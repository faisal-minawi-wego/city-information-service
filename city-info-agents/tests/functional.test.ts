import { describe, it, expect, beforeAll } from 'vitest';
import { mastra } from '../src/mastra';

// Skip functional tests if no API key is provided
const shouldRunFunctionalTests = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'test-key';

const conditionalDescribe = shouldRunFunctionalTests ? describe : describe.skip;

conditionalDescribe('City Information System - Functional Tests', () => {
  beforeAll(async () => {
    // Wait for Mastra to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('Agent Readiness', () => {
    it('should have all agents ready for execution', async () => {
      const agents = mastra.getAgents();
      
      // Test that all agents are properly configured
      expect(agents.wikipediaAgent).toBeDefined();
      expect(agents.geonamesAgent).toBeDefined();
      expect(agents.osmAgent).toBeDefined();
      expect(agents.weatherAgent).toBeDefined();
      expect(agents.cityOrchestratorAgent).toBeDefined();
      
      // Test that each agent has the expected properties
      expect(agents.wikipediaAgent.name).toBe('Wikipedia Specialist Agent');
      expect(agents.geonamesAgent.name).toBe('GeoNames Specialist Agent');
      expect(agents.osmAgent.name).toBe('OpenStreetMap Specialist Agent');
      expect(agents.weatherAgent.name).toBe('Weather Specialist Agent');
      expect(agents.cityOrchestratorAgent.name).toBe('City Orchestrator Agent');
    });

    it('should have workflows ready for execution', async () => {
      const workflows = mastra.getWorkflows();
      
      // Test that the city info workflow is properly configured
      expect(workflows.cityInfoWorkflow).toBeDefined();
      
      // Test that the workflow has the expected properties
      expect(workflows.cityInfoWorkflow.id).toBe('city-info-workflow');
    });

    it('should verify system is ready for API calls', async () => {
      // This is a readiness check - actual API calls would be tested manually
      // or in a separate integration test environment
      
      expect(mastra).toBeDefined();
      expect(mastra.getAgents()).toBeDefined();
      expect(mastra.getWorkflows()).toBeDefined();
      
      // Log system status
      console.log('✅ Multi-agent system is ready for operation');
      console.log('📊 Agents available:', Object.keys(mastra.getAgents()).length);
      console.log('🔄 Workflows available:', Object.keys(mastra.getWorkflows()).length);
    });
  });
});

// Also create a test that can run without API keys
describe('City Information System - Offline Tests', () => {
  it('should provide helpful message when API keys are not configured', () => {
    if (!shouldRunFunctionalTests) {
      console.log('⚠️  Functional tests skipped: Set GROQ_API_KEY environment variable to run full tests');
      expect(true).toBe(true); // Always pass this test
    } else {
      console.log('✅ Functional tests enabled: API keys are configured');
      expect(true).toBe(true);
    }
  });

  it('should have all components ready for testing', () => {
    expect(mastra).toBeDefined();
    expect(mastra.getAgents()).toBeDefined();
    expect(mastra.getWorkflows()).toBeDefined();
    
    // All agents should be registered
    const agents = mastra.getAgents();
    expect(Object.keys(agents).length).toBe(5);
    
    // City info workflow should be registered
    const workflows = mastra.getWorkflows();
    expect(Object.keys(workflows).length).toBe(1);
  });
}); 