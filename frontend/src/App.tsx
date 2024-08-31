import React, { useState } from 'react';
import axios from 'axios';
import viteLogo from '/vite.svg';
import reactLogo from './assets/react.svg';
import './App.css';

interface WeatherData {
  current: {
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
  };
  forecast: {
    list: Array<{
      dt_txt: string;
      main: {
        temp: number;
      };
      weather: Array<{
        description: string;
        icon: string;
      }>;
    }>;
  };
}

const App: React.FC = () => {
  const [count, setCount] = useState(0);
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError('');

    const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5000';

    try {
      const response = await axios.get(`${backendUrl}/api/weather?city=${city}`);
      console.log(response.data);
      setWeatherData(response.data);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React Weather App</h1>
      <div className="card">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button onClick={fetchWeather}>Get Weather</button>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {weatherData && (
          <div className="weather-info">
            <h2>Current Weather in {city}</h2>
            <p>Temperature: {weatherData.current.main.temp}°C</p>
            <p>Humidity: {weatherData.current.main.humidity}%</p>
            <p>Description: {weatherData.current.weather[0].description}</p>
            <img
              src={`http://openweathermap.org/img/w/${weatherData.current.weather[0].icon}.png`}
              alt="Weather icon"
            />

            <h2>5-Day Forecast</h2>
            <div className="forecast">
              {weatherData.forecast.list.map((day, index) => (
                <div key={index} className="forecast-day">
                  <p>Date: {day.dt_txt}</p>
                  <p>Temperature: {day.main.temp}°C</p>
                  <p>Description: {day.weather[0].description}</p>
                  <img
                    src={`http://openweathermap.org/img/w/${day.weather[0].icon}.png`}
                    alt="Weather icon"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

export default App;