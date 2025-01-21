import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { X } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-lg">
        <p className="text-white font-title text-lg">{label}</p>
        <p className="text-emerald-200">Position: #{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const ExploreSongs = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [songData, setSongData] = useState(null);
  // Rest of your existing handlers
  const handleInput = async (event) => {
    const value = event.target.value;
    setQuery(value);

    if (value) {
      try {
        const response = await axios.get(`http://localhost:8080/song/search?query=${value}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Fetch song data when a song is selected
  const handleSongSelect = async (selectedSong) => {
    setQuery(`${selectedSong.track_name} by ${selectedSong.artists}`);
    setSuggestions([]);
    
    try {
      const response = await axios.get(`http://localhost:8080/song/explore?track_id=${selectedSong.track_id}`);
      setSongData(response.data[0]);
    } catch (error) {
      console.error('Error fetching song data:', error);
    }
  };

  const keyMap = {
    0: 'C',
    1: 'C#',
    2: 'D',
    3: 'D#',
    4: 'E',
    5: 'F',
    6: 'F#',
    7: 'G',
    8: 'G#',
    9: 'A',
    10: 'A#',
    11: 'B'
  }

  // Format chart data
  const chartData = songData && songData.date ? 
    songData.date.map((date, index) => ({
      date: new Date(date).toLocaleDateString(),
      position: songData.position[index]
    })) : [];

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
            placeholder="Search for a song..."
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
                onClick={() => handleSongSelect(suggestion)}
              >
                {suggestion.track_name}
                <span className="text-gray-400 text-sm ml-2">
                  by {suggestion.artists}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Song Data Display */}
      {songData && (
        <div className="mt-0">
          <div className="relative">
            <div className="h-[400px] mt-2">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    stroke="#ffffff"
                    textAnchor="end"
                    height={60}
                    interval={Math.floor(chartData.length / 10)}
                  />
                  <YAxis 
                    reversed={true}
                    domain={[1, 'auto']}
                    stroke="#ffffff"
                    label={{ value: 'Global Chart Position', angle: -90, fill: '#ffffff', position: 'center', dx: -30}}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="position" 
                    stroke="#82ca9d" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Song Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-8 mx-16">
            <div className="space-y-2">
              <h2 className="text-4xl font-title text-violet-400">{songData.track_name}</h2>
              <p className="text-lg text-rose-300">by {songData.artists}</p>
              <div className="space-y-2">
                <p className="text-violet-100">Peak Position: {songData.peak_position}</p>
                <p className="text-violet-100">Weeks at #1: {songData.num_one_count}</p>
                <p className="text-violet-100">Total Weeks Charted: {songData.num_weeks_charted}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-title mt-4 text-violet-400">Audio Features</h3>
              <div className="grid grid-cols-3 gap-2">
                <p className="text-violet-100">Danceability: {(songData.danceability * 100).toFixed(1)}%</p>
                <p className="text-violet-100">Energy: {(songData.energy * 100).toFixed(1)}%</p>
                <p className="text-violet-100">Valence: {(songData.valence * 100).toFixed(1)}%</p>
                <p className="text-violet-100">Acousticness: {(songData.acousticness * 100).toFixed(1)}%</p>
                <p className="text-violet-100">Instrumentalness: {(songData.instrumentalness * 100).toFixed(1)}%</p>
                <p className="text-violet-100">Speechiness: {(songData.speechiness * 100).toFixed(1)}%</p>
                <p className="text-violet-100">Liveness: {(songData.liveness * 100).toFixed(1)}%</p>
                <p className="text-violet-100">Loudness: {(songData.loudness)} dB</p>
                <p className="text-violet-100">Tempo: {Math.round(songData.tempo)} BPM</p>
                <p className="text-violet-100">Key: {keyMap[songData.key]}</p>
                <p className="text-violet-100">Mode: {songData.mode ? 'Major' : 'Minor'}</p>
                <p className="text-violet-100">Time Signature: {songData.time_signature}/4</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreSongs; 