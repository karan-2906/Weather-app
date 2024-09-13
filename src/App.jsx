import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, Droplets, Search, MapPin } from 'lucide-react';

const WeatherIcon = ({ condition, className }) => {
  const iconClass = `w-12 h-12 ${className}`;
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <Sun className={`${iconClass} text-yellow-400`} />;
    case 'partly cloudy':
    case 'cloudy':
      return <Cloud className={`${iconClass} text-gray-400`} />;
    case 'rain':
    case 'light rain':
    case 'moderate rain':
      return <CloudRain className={`${iconClass} text-blue-400`} />;
    case 'heavy rain':
      return <Droplets className={`${iconClass} text-blue-600`} />;
    default:
      return <Sun className={`${iconClass} text-yellow-400`} />;
  }
};

const App = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchWeather(`${latitude},${longitude}`);
        },
        err => {
          setError("Unable to retrieve your location. Please enter a city name.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser. Please enter a city name.");
      setLoading(false);
    }
  }, []);

  const fetchWeather = async (query) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=3&aqi=no&alerts=no`
      );
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      const data = await response.json();
      setWeather(data);
      setLocation(data.location.name);
      setLoading(false);
    } catch (err) {
      setError('Error fetching weather data. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location) {
      setLoading(true);
      fetchWeather(location);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-blue-600">
      <div className="text-white text-2xl font-semibold animate-pulse">Loading weather data...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-red-400 to-red-600">
      <div className="text-white text-2xl font-semibold">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">Weather Forecast</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city name"
                className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-blue-300 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-blue-400" />
            </div>
            <button type="submit" className="ml-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
          </div>
        </form>

        {weather && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-semibold text-blue-800">{weather.location.name}</h2>
                <p className="text-lg text-gray-600">{new Date(weather.location.localtime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <WeatherIcon condition={weather.current.condition.text} className="mr-4" />
                  <div>
                    <p className="text-5xl font-bold text-blue-600">{weather.current.temp_c}°C</p>
                    <p className="text-xl text-gray-600">{weather.current.condition.text}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end text-gray-600">
                    <Droplets className="h-5 w-5 mr-2 text-blue-400" />
                    Feels like {weather.current.feelslike_c}°C
                  </p>
                  <p className="flex items-center justify-end mt-2 text-gray-600">
                    <Wind className="h-5 w-5 mr-2 text-blue-400" />
                    Wind {weather.current.wind_kph} km/h
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">3-Day Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weather.forecast.forecastday.map((day) => (
                  <div key={day.date} className="bg-white rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl">
                    <h4 className="text-xl font-semibold mb-2 text-blue-700">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </h4>
                    <div className="flex items-center justify-between">
                      <WeatherIcon condition={day.day.condition.text} className="mr-4" />
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">{day.day.avgtemp_c}°C</p>
                        <p className="text-gray-600">{day.day.condition.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;