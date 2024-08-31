// Nimbus\frontend\src\App.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

interface Location {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  city: string;
}

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

/*=====================================================================================================================*/
/*=====================================================================================================================*/

const App: React.FC = () => {
  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5000';
  

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLUListElement>(null);

  const formatLocationName = (location: Omit<Location, 'city'>): string => {
    const parts = [location.name];
    if (location.state) parts.push(location.state);
    parts.push(location.country);
    return parts.filter(Boolean).join(', ');
  };

  //==================================================================================================================

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get<Omit<Location, 'city'>[]>(`${backendUrl}/api/location-suggestions?query=${query}`);
        const formattedSuggestions: Location[] = response.data.map((suggestion) => ({
          ...suggestion,
          city: suggestion.name.split(',')[0].trim(),
          name: `${suggestion.name}${suggestion.state ? `, ${suggestion.state}` : ''}, ${suggestion.country}`
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, backendUrl]);

  //==================================================================================================================

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get<Omit<Location, 'city'>[]>(`${backendUrl}/api/location-suggestions?query=${query}`);
        const formattedSuggestions: Location[] = response.data.map((suggestion) => ({
          ...suggestion,
          city: suggestion.name.split(',')[0].trim(),
          name: formatLocationName(suggestion)
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, backendUrl]);

  //==================================================================================================================

  const fetchWeather = async () => {
    if (!selectedLocation) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${backendUrl}/api/weather`, {
        params: {
          lat: selectedLocation.lat,
          lon: selectedLocation.lon,
          city: selectedLocation.city,
          country: selectedLocation.country
        }
      });
      setWeatherData(response.data);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    }
    setLoading(false);
  };

  //==================================================================================================================

  const handleSuggestionClick = (location: Location) => {
    setSelectedLocation(location);
    setQuery(location.name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  //==================================================================================================================

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter location"
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-dropdown" ref={suggestionRef}>
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
          <button onClick={fetchWeather} disabled={!selectedLocation}>Get Weather</button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {weatherData && selectedLocation && (
          <div className="weather-info">
            <h2>Current Weather in {selectedLocation.city}, {selectedLocation.country}</h2>
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