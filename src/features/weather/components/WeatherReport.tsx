import { useState } from 'react';
import { useWeather } from '@/features/weather/hooks/useWeather';

export const WeatherReport = () => {
  const [city, setCity] = useState('Bangkok');
  const [inputValue, setInputValue] = useState('Bangkok');
  const { data, loading, error } = useWeather(city);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setCity(inputValue);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter city name"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && (
        <div>
          <h2>{city}</h2>
          <p>Temperature: {data.temperature}°C</p>
          <p>Condition: {data.condition}</p>
          <p>Humidity: {data.humidity}%</p>
          <p>Wind Speed: {data.windSpeed} km/h</p>
        </div>
      )}
    </div>
  );
};
