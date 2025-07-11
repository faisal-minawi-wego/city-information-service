# Setup Instructions

## Required Environment Variables

Create a `.env` file in the `city-info-agents` directory with the following variables:

```env
# Groq API Key (REQUIRED - FREE!)
GROQ_API_KEY=your_groq_api_key_here

# GeoNames API Username (REQUIRED for geographic data)
GEONAMES_USERNAME=your_geonames_username

# OpenStreetMap Overpass API URL (optional, has default)
OSM_OVERPASS_API_URL=https://overpass-api.de/api/interpreter

# OpenWeatherMap API Key (optional, for weather data)
OPENWEATHER_API_KEY=your_openweather_api_key
```

## How to Get API Keys

### 1. Groq API Key (FREE!)

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign in or create a free account
3. Click "Create API Key"
4. Copy the API key and paste it in your `.env` file

### 2. GeoNames Username (FREE)

1. Go to [GeoNames Registration](https://www.geonames.org/login)
2. Create a free account
3. Activate your account via email
4. **IMPORTANT**: Enable web services in your account settings:
   - Go to your account page
   - Click "enable" next to "free web services"
5. Use your username in the `.env` file

### 3. OpenWeatherMap API Key (OPTIONAL, FREE tier available)

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file

## Quick Setup Commands

```bash
# Navigate to the project directory
cd city-info-agents

# Copy the environment template
cp .env.sample .env

# Edit the .env file with your API keys
nano .env  # or use your preferred editor

# Install dependencies
npm install

# Run tests to verify setup
npm test
```

## Troubleshooting

### "GeoNames API Error"

- Make sure you've registered for a free GeoNames account
- Ensure you've enabled web services in your GeoNames account settings
- Verify your username is correct in the `.env` file

### "OpenStreetMap no area found"

- This is expected for some smaller cities
- The system will still work with Wikipedia and weather data
- Try using a larger nearby city name

### "Google API Error"

- Verify your API key is correct
- Make sure you've enabled the Generative AI API in Google Cloud Console
- Check that your API key has no usage restrictions

## Testing Your Setup

Run the test command to verify everything is working:

```bash
npm run test
```

If all tests pass, your setup is complete! 
