import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const SongCard = ({ song }) => (
  <div className=" rounded-lg p-4 border border-violet-800/50">
    <h3 className="text-lg font-body text-violet-300 mb-2">{song.track_name}</h3>
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div className="text-center">
        <p className="text-emerald-400 font-medium">{song.num_one_count}</p>
        <p className="text-gray-400">Weeks at #1</p>
      </div>
      <div className="text-center">
        <p className="text-emerald-400 font-medium">{song.num_weeks_charted}</p>
        <p className="text-gray-400">Weeks Charted</p>
      </div>
      <div className="text-center">
        <p className="text-emerald-400 font-medium">#{song.peak_position}</p>
        <p className="text-gray-400">Peak Position</p>
      </div>
    </div>
  </div>
);

const ArtistStats = ({ artist }) => (
    <div className="grid grid-cols-3 gap-8 mt-6 max-w-2xl mx-auto mb-12">
      <div className="text-center">
        <p className="text-rose-400 text-3xl font-semibold">{artist.artist_num_one_count}</p>
        <p className="text-gray-400 text-sm">Cumulative Weeks at #1 (Artist&apos;s tracks)</p>
      </div>
      <div className="text-center">
        <p className="text-rose-400 text-3xl font-semibold">{artist.num_weeks_artist_charted}</p>
        <p className="text-gray-400 text-sm">Cumulative Weeks Charted (Artist&apos;s tracks)</p>
      </div>
      <div className="text-center">
        <p className="text-rose-400 text-3xl font-semibold">#{artist.artist_peak_position}</p>
        <p className="text-gray-400 text-sm">Peak Position (Artist&apos;s tracks)</p>
      </div>
    </div>
  );

const ExploreArtists = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [artistData, setArtistData] = useState(null);
  const [artistName, setArtistName] = useState(null);
  // Rest of your existing handlers
  const handleInput = async (event) => {
    const value = event.target.value;
    setQuery(value);

    if (value) {
      try {
        const response = await axios.get(`http://localhost:8080/artist/search?query=${value}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Fetch Artist data when a Artist is selected
  const handleArtistSelect = async (selectedArtist) => {
    setQuery(`${selectedArtist.artist_name}`);
    setArtistName(selectedArtist.artist_name);
    setSuggestions([]);
    try {
      const response = await axios.get(`http://localhost:8080/Artist/explore?artist_id=${selectedArtist.artist_id}`);
      setArtistData(response.data);
    } catch (error) {
      console.error('Error fetching Artist data:', error);
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
            placeholder="Search for an artist..."
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
                onClick={() => handleArtistSelect(suggestion)}
              >
                {suggestion.artist_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Artist Data Display */}
      {artistData && artistData.length > 0 && (
        <div className="mt-8 max-w-6xl mx-auto">
          {/* Artist Name */}
          <h2 className="text-5xl font-title text-white text-center mt-14 mb-4">
            {artistName}
          </h2>
          {/* Artist Stats */}
          <ArtistStats artist={artistData[0]} />

          {/* Divider */}
          <div className="w-3/4 h-px bg-violet-800/50 mx-auto mb-12" />


          {/* Common Phrases */}
          <div className="mb-8">
            <h3 className="text-2xl font-title text-violet-400 mb-4 text-center">Most Used Phrases</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {artistData[0].all_ngrams.map((ngram, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-800 rounded-full text-rose-400"
                >
                  {ngram}
                </span>
              ))}
            </div>
          </div>

          {/* Songs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artistData.map((song, index) => (
              <SongCard key={index} song={song} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

SongCard.propTypes = {
  song: PropTypes.shape({
    artist_name: PropTypes.string.isRequired,
    track_name: PropTypes.string.isRequired,
    num_one_count: PropTypes.number.isRequired,
    num_weeks_charted: PropTypes.number.isRequired,
    peak_position: PropTypes.number.isRequired    
  }).isRequired
};

ArtistStats.propTypes = {
  artist: PropTypes.shape({
    artist_num_one_count: PropTypes.number.isRequired,
    num_weeks_artist_charted: PropTypes.number.isRequired,
    artist_peak_position: PropTypes.number.isRequired,
  }).isRequired
};

export default ExploreArtists; 