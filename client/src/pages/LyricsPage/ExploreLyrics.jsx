import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import PropTypes from 'prop-types';

const LyricsModal = ({ isOpen, setIsOpen, song, artist, lyrics, ngram }) => {
  // Function to highlight ngram occurrences
  const highlightNgram = (text, targetPhrase) => {
    if (!text) return '';
    const parts = text.split(new RegExp(`(${targetPhrase})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === targetPhrase.toLowerCase() ? 
        <span key={i} className="font-medium text-rose-400">{part}</span> : 
        part
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-4xl mt-6 font-title text-center text-violet-400">{song}</DialogTitle>
          <p className="text-base text-center text-rose-400">{artist}</p>
        </DialogHeader>
        <div className="mt-4 p-6 border-violet-400/90 rounded-xl">
          <p className="text-white whitespace-pre-line font-body leading-relaxed">
            {highlightNgram(lyrics, ngram)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SongCard = ({ song, artist, lyrics, ngram, count }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-6 bg-gray-900/50 rounded-2xl border border-violet-800/30 hover:border-emerald-400/60 transition-colors"
      >
        <p className="text-violet-400 font-body text-lg truncate">{song}</p>
        <p className="text-rose-400 text-sm truncate mb-2">{artist}</p>
        <p className="text-gray-400 text-sm">
          Appears {count} time{count !== 1 ? 's' : ''}
        </p>
      </button>
      <LyricsModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        song={song}
        artist={artist}
        lyrics={lyrics}
        ngram={ngram}
      />
    </>
  );
};

LyricsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  song: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  lyrics: PropTypes.string.isRequired,
  ngram: PropTypes.string.isRequired
};

SongCard.propTypes = {
  song: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  lyrics: PropTypes.string.isRequired,
  ngram: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired
};

const ExploreLyrics = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [lyricsData, setLyricsData] = useState(null);
  const [selectedNgram, setSelectedNgram] = useState('');

  const handleInput = async (event) => {
    const value = event.target.value;
    setQuery(value);
  
    if (value) {
      try {
        const response = await axios.get(`http://localhost:8080/lyrics/search?query=${value}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleNgramSelect = async (selectedNgram) => {
    setQuery(selectedNgram.ngram);
    setSelectedNgram(selectedNgram.ngram);
    setSuggestions([]);
    try {
      const response = await axios.get(`http://localhost:8080/lyrics/explore?ngram=${selectedNgram.ngram}`);
      setLyricsData(response.data);
    } catch (error) {
      console.error('Error fetching Lyrics data:', error);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="space-y-10 mb-10">
      {/* Search Section */}
      <div className="relative max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search for a word or a phrase..."
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
                onClick={() => handleNgramSelect(suggestion)}
              >
                {suggestion.ngram}
             
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      {lyricsData && (
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-6xl font-title text-white text-center mb-10">
            "{selectedNgram}"
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lyricsData.map((song, index) => (
              <SongCard
                key={index}
                song={song.track_name}
                artist={song.artists}
                lyrics={song.lyrics}
                ngram={selectedNgram}
                count={song.count}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreLyrics;