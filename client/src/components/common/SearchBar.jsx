import React, { useState } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';

const SearchBar = ({ onSearch, initialQuery = '', initialCity = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query, city });
    }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        const { latitude, longitude } = position.coords;
        if (onSearch) {
          onSearch({ query, latitude, longitude, radius: 10 });
        }
      },
      (error) => {
        setIsDetecting(false);
        console.error('Error detecting location:', error);
        alert('Could not detect location. Please enter a city manually.');
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-700 p-2 flex flex-col md:flex-row items-center gap-2"
    >
      {/* Search Query */}
      <div className="flex-1 w-full flex items-center gap-2 px-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-dark-700 pb-2 md:pb-0">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Service, professional, or business name..."
          className="w-full bg-transparent border-0 outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 py-2 focus:ring-0 text-sm"
        />
      </div>

      {/* City Location */}
      <div className="flex-1 w-full flex items-center gap-2 px-3 pb-2 md:pb-0">
        <MapPin className="text-gray-400" size={20} />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city (e.g. Lahore, Karachi)..."
          className="w-full bg-transparent border-0 outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 py-2 focus:ring-0 text-sm"
        />
        
        {/* Near Me Button */}
        <button
          type="button"
          onClick={handleNearMe}
          disabled={isDetecting}
          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-full transition-colors"
          title="Detect near me"
        >
          <Navigation size={18} className={isDetecting ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full md:w-auto px-8 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
