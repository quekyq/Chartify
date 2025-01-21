import { useState } from 'react';
import PropTypes from 'prop-types';
import { Filter, X } from 'lucide-react';
import { Button } from "./ui/button";
import { getCodeFromCountry } from '../utils';

const LyricsFilterButtons = ({ onFilterChange }) => {
    // Load saved filters from localStorage or use defaults
  const savedFilters = JSON.parse(localStorage.getItem('lyricsFilters')) || {
    region: 'global',    // Default region code
    regionName: 'Global', // Default region display name
    startYear: '',
    endYear: '',
    ngram_type: '1-gram',
    explicit: true
  };
 

  const [showFilters, setShowFilters] = useState(false);
  const [region, setRegion] = useState(savedFilters.regionName);
  const [startYear, setStartYear] = useState(savedFilters.startYear);
  const [endYear, setEndYear] = useState(savedFilters.endYear);
  const [ngram_type, setNgramType] = useState(savedFilters.ngram_type);
  const [explicit, setExplicit] = useState(savedFilters.explicit);
  const [tempFilters, setTempFilters] = useState(savedFilters);


  const regions = ['Global', 'United States', 'Canada', 'Mexico'];
  const years = Array.from({length: 11}, (_, i) => 2023 - i);

  

  const handleRegionChange = (newRegion) => {
    const regionCode = getCodeFromCountry(newRegion);
    setRegion(newRegion);
    setTempFilters(prev => ({
      ...prev,
      region: regionCode,
      regionName: newRegion
    }));
  };


  const handleYearChange = (start, end) => {
    // Convert empty string to null when "All" is selected
    const startYear = start === '' ? null : start;
    const endYear = end === '' ? null : end;

    if (startYear !== undefined) setStartYear(startYear || '');
    if (endYear !== undefined) setEndYear(endYear || '');
    
    setTempFilters(prev => ({
      ...prev,
      startYear: startYear,
      endYear: endYear
    }));
  };

  const handleExplicitChange = (explicit) => {
    setExplicit(explicit);  
    setTempFilters(prev => ({
      ...prev,
      explicit: explicit
    }));
  };

  const handleNgramTypeChange = (ngram_type) => {
    setNgramType(ngram_type);
    setTempFilters(prev => ({
      ...prev,
      ngram_type: ngram_type
    }));
  };

  const handleApplyFilters = () => {
    // Save to localStorage when applying filters
    localStorage.setItem('lyricsFilters', JSON.stringify(tempFilters));
    onFilterChange(tempFilters);
    setShowFilters(false);
  };
  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex items-center gap-2 text-violet-400 hover:text-rose-400"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="h-4 w-4" />
        Filters
      </Button>

      {showFilters && (
        <div className="absolute right-0 mt-2 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[300px]">
          <div className="flex justify-between items-center">
            <h3 className="text-violet-400 font-semibold">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-rose-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Region */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Region</label>
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <Button
                    key={r}
                    variant="outline"
                    className={`text-sm hover:text-rose-400 focus:text-white ${
                      region === r ? 'text-white' : 'text-violet-400'
                    }`}
                    onClick={() => handleRegionChange(r)}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>
            

            {/* N-gram Type */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">N-gram Type</label>
              <div className="flex flex-wrap gap-2">
                {['1-gram', '2-gram', '3-gram'].map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    className={`text-sm hover:text-rose-400 focus:text-white ${
                      tempFilters.ngram_type === type ? 'text-white' : 'text-violet-400'
                    }`}
                    onClick={() => handleNgramTypeChange(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            

            {/* Explicit Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tempFilters.explicit}
                  onChange={(e) => handleExplicitChange(e.target.checked)}
                  className="rounded accent-violet-500 bg-gray-800 border-gray-600"
                />
                <span className="text-sm text-gray-400">
                  Include Explicit Content
                </span>
              </div>
            </div>

            

             {/* Year Range */}
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Start Year</label>
                <select
                  value={startYear ?? ''}
                  onChange={(e) => handleYearChange(e.target.value, endYear)}
                  className="w-full bg-gray-800 text-violet-400 rounded-md p-2 border border-gray-700"
                >
                  <option value="">All</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">End Year</label>
                <select
                  value={endYear ?? ''}
                  onChange={(e) => handleYearChange(startYear, e.target.value)}
                  className="w-full bg-gray-800 text-violet-400 rounded-md p-2 border border-gray-700"
                >
                  <option value="">All</option>
                  {years
                    .filter((year) => !startYear || year >= startYear)
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <Button
                className=" bg-violet-600 text-violet-200 hover:text-violet-400"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

LyricsFilterButtons.propTypes = {
  onFilterChange: PropTypes.func.isRequired
};

export default LyricsFilterButtons; 