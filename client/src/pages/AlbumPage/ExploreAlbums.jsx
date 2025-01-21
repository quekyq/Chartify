import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const AlbumStats = ({ album }) => (
  <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
    <div className="text-center">
      <p className="text-rose-400 text-3xl font-semibold">{album.total_one_count}</p>
      <p className="text-gray-400 text-sm">Cumulative Weeks at #1 (Album&apos;s tracks)</p>
    </div>
    <div className="text-center">
      <p className="text-rose-400 text-3xl font-semibold">{album.total_weeks_charted}</p>
      <p className="text-gray-400 text-sm">Cumulative Weeks Charted (Album&apos; tracks)</p>
    </div>
    <div className="text-center">
      <p className="text-rose-400 text-3xl font-semibold">#{album.min_peak_position}</p>
      <p className="text-gray-400 text-sm">Peak Position (Album&apos; tracks)</p>
    </div>
  </div>
);

AlbumStats.propTypes = {
  album: PropTypes.shape({
    total_one_count: PropTypes.string.isRequired,
    total_weeks_charted: PropTypes.string.isRequired,
    min_peak_position: PropTypes.number.isRequired
  }).isRequired
};

const ChartingSongs = ({ songs }) => (
  <div className="max-w-3xl mx-auto">
    <h3 className="text-2xl font-title text-violet-300 mb-6 text-center">Charting Songs</h3>
    <div className={`grid ${songs.length < 4 ? 'grid-cols-1 md:grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
      {songs.map((song, index) => (
        <div 
          key={index}
          className="px-4 py-3 bg-gray-900/50 rounded-lg border border-violet-800/30"
        >
          <p className="text-gray-300 text-center font-body">{song}</p>
        </div>
      ))}
    </div>
  </div>
);

ChartingSongs.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.string).isRequired
};

const ExploreAlbums = () => {
    const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [albumData, setAlbumData] = useState(null);
  
  const handleInput = async (event) => {
    const value = event.target.value;
    setQuery(value);

    if (value) {
      try {
        const response = await axios.get(`http://localhost:8080/album/search?query=${value}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Fetch Album data when a Album is selected
  const handleAlbumSelect = async (selectedAlbum) => {
    setQuery(`${selectedAlbum.album_title}`);
    setSuggestions([]);
    try {
      const response = await axios.get(`http://localhost:8080/album/explore?album_id=${selectedAlbum.album_id}`);
      setAlbumData(response.data);
    } catch (error) {
      console.error('Error fetching Album data:', error);
    }
  };


  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="space-y-6 mb-10">
      {/* Search Section */}
      <div className="relative max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search for an album..."
            className="w-full mt-6 px-4 py-2 bg-gray-900 border border-gray-700 rounded-3xl text-white focus:outline-none focus:border-violet-400 pr-10"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-9 text-gray-400 hover:text-rose-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-4 py-2 text-left hover:bg-gray-800 text-white"
                onClick={() => handleAlbumSelect(suggestion)}
              >
                {suggestion.album_title}
                <span className="text-gray-400 text-sm ml-2">
                  by {suggestion.artists}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Album Data Display */}
      {albumData && albumData.length > 0 && (
        <div className="mt-12 max-w-6xl mx-auto px-4">
          {/* Album Title & Artist */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-title text-white mt-14 mb-4">
              {albumData[0].album_title}
            </h2>
            <p className="text-xl text-violet-400 font-body">
              {albumData[0].artists}
            </p>
          </div>

          {/* Album Stats */}
          <AlbumStats album={albumData[0]} />
          
        {/* Divider */}
        <div className="w-3/4 h-px bg-violet-800/50 mx-auto mb-12" />

          {/* Charting Songs */}
          <ChartingSongs songs={albumData[0].charting_songs} />
        </div>
      )}
    </div>
  );
};

export default ExploreAlbums; 