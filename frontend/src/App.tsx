// Nimbus\frontend\src\App.tsx
import React, { useState } from 'react';
import axios from 'axios';
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
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError('');

    const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5000';

    try {
      const response = await axios.get(`${backendUrl}/api/weather?city=${city}&country=${country}`);
      setWeatherData(response.data);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header>
        <h1>Nimbus Weather App</h1>
        <div className="logo-container">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
          <img src="/react.svg" className="logo react" alt="React logo" />
        </div>
      </header>

      <main>
        <div className="search-container">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
          />
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Enter country name"
          />
          <button onClick={fetchWeather}>Get Weather</button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {weatherData && (
          <div className="weather-info">
            <h2>Current Weather in {city}, {country}</h2>
            <div className="current-weather">
              <img
                src={`http://openweathermap.org/img/w/${weatherData.current.weather[0].icon}.png`}
                alt="Weather icon"
                className="weather-icon"
              />
              <div className="weather-details">
                <p className="temperature">{weatherData.current.main.temp.toFixed(1)}°C</p>
                <p className="description">{weatherData.current.weather[0].description}</p>
                <p className="humidity">Humidity: {weatherData.current.main.humidity}%</p>
              </div>
            </div>

            <h3>5-Day Forecast</h3>
            <div className="forecast">
              {weatherData.forecast.list.map((day, index) => (
                <div key={index} className="forecast-day">
                  <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
                  <img
                    src={`http://openweathermap.org/img/w/${day.weather[0].icon}.png`}
                    alt="Weather icon"
                  />
                  <p>{day.main.temp.toFixed(1)}°C</p>
                  <p>{day.weather[0].description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;