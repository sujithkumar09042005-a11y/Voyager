import axios from 'axios';
import type { WeatherCondition, WeatherData } from '../types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// ─── Condition Code Mapping ───────────────────────────────────────────────────
// Maps OpenWeather condition codes to our internal WeatherCondition type.
// Reference: https://openweathermap.org/weather-conditions

function mapConditionCode(code: number): WeatherCondition {
  if (code >= 200 && code < 300) return 'thunderstorm';
  if (code >= 300 && code < 400) return 'drizzle';
  if (code >= 500 && code < 600) return 'rain';
  if (code >= 600 && code < 700) return 'snow';
  if (code >= 700 && code < 800) return 'mist';
  if (code === 800)               return 'clear';
  if (code === 801 || code === 802) return 'partly-cloudy';
  if (code >= 803)                return 'cloudy';
  return 'unknown';
}

function windDegreesToDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// ─── API Response → Our Type ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformWeatherResponse(data: any): WeatherData {
  return {
    temperature:    Math.round(data.main.temp),
    feelsLike:      Math.round(data.main.feels_like),
    condition:      mapConditionCode(data.weather[0].id),
    conditionText:  data.weather[0].description
      .split(' ')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    humidity:       data.main.humidity,
    windSpeed:      Math.round(data.wind.speed * 3.6), // m/s → km/h
    windDirection:  windDegreesToDirection(data.wind.deg ?? 0),
    visibility:     Math.round((data.visibility ?? 10000) / 1000), // m → km
    updatedAt:      new Date(),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchWeatherByCoords(
  lat: number,
  lng: number,
): Promise<WeatherData> {
  if (!API_KEY) {
    throw new Error('OpenWeather API key not configured. Add VITE_OPENWEATHER_API_KEY to your .env file.');
  }

  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon: lng,
      appid: API_KEY,
      units: 'metric',
    },
  });

  return transformWeatherResponse(response.data);
}

export async function fetchWeatherByCity(city: string): Promise<WeatherData> {
  if (!API_KEY) {
    throw new Error('OpenWeather API key not configured.');
  }

  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      q: city,
      appid: API_KEY,
      units: 'metric',
    },
  });

  return transformWeatherResponse(response.data);
}
