import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import logo from './assets/logo2.svg';

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


const App: React.FC = () => {
  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://www.nimbusweatherapp.com';

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

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const [weekday, ...rest] = formattedDate.split(', ');
    return `${weekday}\n${rest.join(', ')}`;
  };
  
  const generateForecastDates = (startDate: Date, days: number) => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return formatDate(date);
    });
  };
  

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


  const fetchWeather = async (location: Location) => {
    setShowSuggestions(false);
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${backendUrl}/api/weather`, {
        params: {
          lat: location.lat,
          lon: location.lon,
          city: location.city,
          country: location.country
        }
      });
      setWeatherData(response.data);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    }
    setLoading(false);
  };


  const handleSuggestionClick = (location: Location) => {
    setSelectedLocation(location);
    setQuery(location.name);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeather(location);
  };


    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);


  return (
    <div className="App">
      <header>
        <div className="logo-container">
    <img src={logo} className="logo" alt="Nimbus" />
        </div>
      </header>
      
      <main>
        <div className="search-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a city"
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
        </div>
  
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
  
        {weatherData && selectedLocation && (
          <div className="weather-info">
            <h2>Weather in {selectedLocation.city}</h2>
            <div className="current-weather">
              <img
                src={`http://openweathermap.org/img/w/${weatherData.current.weather[0].icon}.png`}
                alt="Weather icon"
                className="weather-icon"
              />
              <div className="weather-details">
                <p className="temperature">{weatherData.current.main.temp.toFixed(1)}°F</p>
                <p className="description">{weatherData.current.weather[0].description}</p>
                <p className="humidity">Humidity: {weatherData.current.main.humidity}%</p>
              </div>
            </div>
  
            <h3>5 Day Forecast</h3>
          <div className="forecast">
            {generateForecastDates(new Date(), 5).map((formattedDate, index) => {
              const day = weatherData.forecast.list[index];
              return (
                <div key={index} className="forecast-day">
                  <p>{formattedDate}</p>
                  <img
                    src={`http://openweathermap.org/img/w/${day.weather[0].icon}.png`}
                    alt="Weather icon"
                  />
                  <p>{day.main.temp.toFixed(1)}°F</p>
                  <p>{day.weather[0].description}</p>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </main>
    </div>
  );
  
};

export default App;
