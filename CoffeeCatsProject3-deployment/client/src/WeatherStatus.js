import React, { useState, useEffect } from 'react'; import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Loader } from 'lucide-react'; const WeatherStatus = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // First get user's location
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        
        // Replace 'YOUR_API_KEY' with actual OpenWeatherMap API key
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=82640062e4e6085a35558432c0ee2af2`
        );
        
        if (!response.ok) throw new Error('Weather data fetch failed');
        
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError('Unable to fetch weather');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (weatherCode) => {
    // Weather condition codes: https://openweathermap.org/weather-conditions
    if (loading) return <Loader className="animate-spin" />;
    
    switch (true) {
      case weatherCode >= 200 && weatherCode < 300:
        return <CloudLightning className="text-yellow-400" />;
      case weatherCode >= 300 && weatherCode < 600:
        return <CloudRain className="text-blue-400" />;
      case weatherCode >= 600 && weatherCode < 700:
        return <CloudSnow className="text-gray-100" />;
      case weatherCode === 800:
        return <Sun className="text-yellow-400" />;
      case weatherCode > 800:
        return <Cloud className="text-gray-400" />;
      default:
        return <Cloud className="text-gray-400" />;
    }
  };

  if (error) return null; // Silently fail if there's an error
  if (loading) return <div className="flex items-center gap-2"><Loader className="animate-spin" /></div>;

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
      {getWeatherIcon(weather?.weather[0]?.id)}
      <span className="text-sm">
        {Math.round(weather?.main?.temp)}°C
      </span>
    </div>
  );
};

export default WeatherStatus;
