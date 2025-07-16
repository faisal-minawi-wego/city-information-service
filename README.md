# City Information Service

A multi-agent system built with [Mastra](https://mastra.ai) that provides comprehensive city information by coordinating specialized AI agents.

## 🎯 Overview

This system uses **5 specialized AI agents** powered by **Groq's free LLM API** to gather comprehensive city information from multiple sources:

- 🔍 **Wikipedia Agent** - Cultural and historical information
- 🌍 **GeoNames Agent** - Geographic and demographic data  
- 🗺️ **OpenStreetMap Agent** - Points of interest and local facilities
- ☀️ **Weather Agent** - Current weather conditions
- 🎛️ **City Orchestrator** - Synthesizes all information into structured output

## 🏗️ Architecture

```
📦 city-information-service/
├── 🤖 city-info-agents/          # Multi-agent system (Node.js/TypeScript)
│   ├── src/mastra/
│   │   ├── agents/               # 5 specialized AI agents
│   │   ├── tools/                # API integration tools
│   │   └── workflows/            # Coordinated multi-agent workflows
│   ├── tests/                    # Comprehensive test suite
│   └── api/                      # REST API endpoints
└── 📋 README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+**
- **Free Groq API key** (no credit card required)

### Setup

1. **Navigate to the agents directory:**
   ```bash
   cd city-info-agents
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Get your FREE API keys:**
   - **Groq API**: [console.groq.com/keys](https://console.groq.com/keys) (required)
   - **GeoNames**: [geonames.org/login](https://www.geonames.org/login) (optional)

4. **Configure environment:**
   ```bash
   cp .env.sample .env
   # Edit .env with your API keys
   ```

5. **Start the system:**
   ```bash
   npm run dev
   ```

6. **Test with a city:**
   ```bash
   npm run test:integration
   ```

## 🎮 Usage

### Via API
```bash
# Execute city information workflow
curl -X POST http://localhost:4111/api/workflows/cityInfoWorkflow/start-async \
  -H "Content-Type: application/json" \
  -d '{"inputData": {"city": "Tokyo", "country": "Japan"}}'

# List available workflows
curl http://localhost:4111/api/workflows | jq

# List available agents
curl http://localhost:4111/api/agents | jq
```

### Via Playground
Open http://localhost:4111 in your browser for the interactive interface.

## 📊 Sample Output

The system provides structured city information in 6 sections:

```
🏙️ **City Overview**
- Location, population, and significance
- Key characteristics and importance

☀️ **Weather** 
- Current conditions and climate info
- Visitor considerations

🎯 **Activities**
- Popular local experiences
- Cultural and recreational activities

🍽️ **Good Food**
- Local cuisine and famous dishes
- Restaurant recommendations

📸 **Attractions**
- Tourist attractions and landmarks
- Museums and historical sites

⚠️ **Things to Worry About**
- Safety considerations and travel tips
- Practical concerns for visitors
```

## 🛠️ Development

### Run Tests
```bash
cd city-info-agents
npm test                    # Unit tests
npm run test:integration    # Full system tests
```

### Project Structure
- **Agents**: Specialized AI components for different data sources
- **Tools**: API integrations (Wikipedia, GeoNames, OpenStreetMap, Weather)
- **Workflows**: Multi-agent coordination and data synthesis
- **Tests**: Comprehensive testing from unit to integration level

## 🆓 Free Tier Usage

This system is designed to work completely **FREE**:

- ✅ **Groq API**: 30 req/min, 6K tokens/min (generous free tier)
- ✅ **GeoNames**: Free with registration + fallback data
- ✅ **OpenStreetMap**: Free public API + graceful fallbacks
- ✅ **Wikipedia**: Free public API
- ✅ **Weather**: Uses free weather service

## 🧪 Testing

The system includes comprehensive testing:

- **Unit Tests**: Component functionality
- **Functional Tests**: Agent coordination  
- **Integration Tests**: End-to-end workflows
- **Smoke Tests**: System health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mastra](https://mastra.ai) - Multi-agent framework
- [Groq](https://groq.com) - Free LLM inference
- [OpenStreetMap](https://openstreetmap.org) - Geographic data
- [GeoNames](https://geonames.org) - Geographic database
- [Wikipedia](https://wikipedia.org) - Encyclopedia data 
