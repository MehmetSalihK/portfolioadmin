import { useState, useEffect } from 'react';
import { FiMapPin } from 'react-icons/fi';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LocationAutocomplete({ value, onChange, placeholder }: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 2) {
      // Ici vous pouvez intégrer une API comme OpenStreetMap Nominatim
      // Pour l'instant, on utilise des suggestions statiques
      const staticSuggestions = [
        'Paris, 75001, France',
        'Lyon, 69000, France',
        'Marseille, 13000, France',
        'Toulouse, 31000, France',
        'Nice, 06000, France'
      ].filter(city => 
        city.toLowerCase().includes(inputValue.toLowerCase())
      );
      
      setSuggestions(staticSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-[#252525] border border-[#2A2A2A] rounded shadow-lg">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-[#2A2A2A] cursor-pointer text-white"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <FiMapPin className="inline mr-2" />
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}