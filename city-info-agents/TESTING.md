# Testing Guide for City Information Multi-Agent System

This guide explains how to test the multi-agent city information system built with Mastra.

## Test Types

### 1. Unit Tests (Smoke Tests)
Tests basic system setup and component availability without making external API calls.

**Location**: `tests/smoke.test.ts`

**Run with**:
```bash
npm test
# or
npm run test:run
```

**What it tests**:
- Mastra instance configuration
- Agent registration and availability
- Workflow registration
- Basic system health checks

### 2. Functional Tests
Tests agent and workflow readiness with API key validation.

**Location**: `tests/functional.test.ts`

**Run with**:
```bash
npm test
# or
npm run test:run
```

**What it tests**:
- Agent configuration and readiness
- Workflow availability
- System readiness for API calls
- Environment variable validation

### 3. Integration Tests
Tests the complete system functionality with real API calls.

**Location**: `test-runner.js`

**Run with**:
```bash
npm run test:integration
# or
node test-runner.js
```

**Prerequisites**:
- Development server must be running (`npm run dev`)
- API keys must be configured (see Environment Variables section)

**What it tests**:
- Weather workflow execution
- City information workflow execution
- Multi-agent coordination
- Output format validation
- Error handling

## Environment Variables

For full testing, you need these environment variables:

```bash
# Required for Google Gemini API calls (FREE!)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here

# Optional: GeoNames username for geographic data
GEONAMES_USERNAME=your_geonames_username

# Optional: Custom API endpoints (defaults are provided)
WIKIPEDIA_API_URL=https://en.wikipedia.org/api/rest_v1
WIKIDATA_API_URL=https://www.wikidata.org/w/api.php
OSM_OVERPASS_API_URL=https://overpass-api.de/api/interpreter
GEONAMES_API_URL=http://api.geonames.org
```

## Running Tests

### Quick Test (No API Keys Required)
```bash
npm run test:run
```
This runs the smoke tests and functional tests without making external API calls.

### Full Integration Test (API Keys Required)
```bash
# Terminal 1: Start the development server
npm run dev

# Terminal 2: Run integration tests
npm run test:integration
```

### Watch Mode for Development
```bash
npm run test:watch
```

## Test Configuration

### Vitest Configuration
The test setup uses Vitest with the following configuration (`vitest.config.ts`):

- **Environment**: Node.js
- **Timeout**: 30 seconds for API calls
- **Globals**: Enabled for easier test writing
- **Excludes**: node_modules, dist, .mastra

### Test Structure
```
tests/
├── smoke.test.ts       # Basic system checks
├── functional.test.ts  # Agent/workflow readiness
test-runner.js          # Integration tests
```

## Test Cities

The integration tests use these test cities:

1. **Tokyo, Japan** - Complete city/country pair
2. **London, UK** - Popular international city
3. **Paris** - City without country (tests auto-detection)
4. **New York, USA** - Major US city

## Expected Test Results

### Smoke Tests

- ✅ 11 tests should pass
- Tests complete in < 1 second
- No external API calls made

### Functional Tests

- ✅ 5 tests should pass (3 may be skipped without API keys)
- Tests complete in < 2 seconds
- Validates system readiness

### Integration Tests

- ✅ 5 tests should pass with API keys
- Tests take 2-10 minutes depending on API response times
- Tests real multi-agent coordination

## Test Output Examples

### Successful Integration Test

```markdown
🚀 Starting Multi-Agent System Tests
==================================================

🔍 Checking server availability...
✅ Server is available

🌤️  WEATHER WORKFLOW TESTS
==============================

🌤️  Testing Weather Workflow for London...
✅ Weather workflow successful for London
📊 Response length: 1523 characters
📝 First 200 chars: 📅 Monday, January 8, 2024
═══════════════════════════
🌡️ WEATHER SUMMARY
• Conditions: Partly cloudy
• Temperature: 8°C/46°F to 12°C/54°F
• Precipitation: 20% chance...

🏙️  CITY INFORMATION WORKFLOW TESTS
========================================

🏙️  Testing City Info Workflow for Tokyo, Japan...
✅ City info workflow successful for Tokyo, Japan
📊 Response length: 2847 characters
📋 Sections found: 6/6
📝 First 300 chars: 🏙️ **CITY OVERVIEW**
Tokyo, the bustling capital of Japan, is a vibrant metropolis that seamlessly blends ultra-modern technology with traditional culture. As the world's most populous urban area, Tokyo offers an incredible array of experiences...

📊 TEST SUMMARY
====================
✅ Passed: 5/5 tests
❌ Failed: 0/5 tests

🎉 All tests passed! Multi-agent system is working correctly.
```

## Troubleshooting

### Common Issues

1. **Server Not Available**
   - Make sure `npm run dev` is running
   - Check that port 4112 is not blocked
   - Verify no other services are using the port

2. **API Key Issues**
   - Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set correctly
   - Check that the API key has sufficient credits (Google Gemini is free!)
   - Verify the key has the correct permissions

3. **Timeout Errors**
   - Increase timeout in vitest.config.ts
   - Check internet connection
   - Verify API endpoints are accessible

4. **Test Failures**
   - Check console output for specific error messages
   - Verify all environment variables are set
   - Ensure all agents and workflows are properly registered

### Debug Mode

For more detailed output during testing:

```bash
# Add debug logs
DEBUG=mastra* npm run test:integration

# Or check the Mastra dev server logs
npm run dev
```

## Adding New Tests

### Adding Unit Tests

1. Create test file in `tests/` directory
2. Import components from `../src/mastra`
3. Use Vitest's `describe`, `it`, `expect` functions
4. Focus on testing configuration and setup

### Adding Integration Tests

1. Add test functions to `test-runner.js`
2. Use the `makeRequest` helper function
3. Test real API endpoints and responses
4. Validate output format and content

### Test Best Practices

- Use descriptive test names
- Test both success and failure scenarios
- Mock external dependencies when possible
- Keep tests independent and isolated
- Use appropriate timeouts for API calls
- Validate both structure and content of responses

## Performance Considerations

- Integration tests make real API calls and can be slow
- Use appropriate timeouts (30s for simple calls, 180s for complex workflows)
- Add delays between tests to avoid rate limiting
- Consider using test data that's likely to be cached by external APIs

## Monitoring Test Results

The test suite provides comprehensive output including:

- Test execution time
- Response lengths
- Content validation
- Section presence checks
- Error details and troubleshooting tips

This helps identify performance issues and content quality problems quickly.
