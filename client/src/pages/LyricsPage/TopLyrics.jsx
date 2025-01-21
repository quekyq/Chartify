import { useState, useEffect, useCallback } from "react";
import LyricsFilterButtons from '../../components/LyricsFilterButtons';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

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
          <p className="text-base text-center text-emerald-400">{artist}</p>
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

const SongCard = ({ song, artist, lyrics, ngram }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-900/50 rounded-3xl border border-violet-800/30 hover:border-emerald-400/60 transition-colors text-center"
      >
        <p className="text-violet-400 font-body text-sm truncate">{song}</p>
        <p className="text-xs text-rose-400 truncate">{artist}</p>
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

const NgramCard = ({ ngram, rank }) => (
  <div className="bg-gray-900/30 rounded-2xl p-8 border border-violet-700/40 relative">
    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gray-900 border-2 border-violet-700/40 flex items-center justify-center">
      <span className="text-xl font-title text-rose-400">#{rank}</span>
    </div>

    <h2 className="text-4xl font-title uppercase text-white text-center mb-6">
      "{ngram.ngram}"
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      {ngram.track_name.map((song, index) => (
        <SongCard
          key={index}
          song={song}
          artist={ngram.artists[index]}
          lyrics={ngram.lyrics[index]}
          ngram={ngram.ngram}
        />
      ))}
    </div>
  </div>
);

SongCard.propTypes = {
  song: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  lyrics: PropTypes.string.isRequired,
  ngram: PropTypes.string.isRequired
};

NgramCard.propTypes = {
  ngram: PropTypes.shape({
    ngram: PropTypes.string.isRequired,
    lyrics: PropTypes.arrayOf(PropTypes.string).isRequired,
    track_name: PropTypes.arrayOf(PropTypes.string).isRequired,
    artists: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  rank: PropTypes.number.isRequired
};

const TopLyrics = () => {
  const [filters, setFilters] = useState({
    region: 'global',
    startYear: '',
    endYear: '',
    ngram_type: '1-gram',
    explicit: true
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (page) => {
    setIsLoading(true);
    try {
      const queryParams = {
        page: page.toString(),
        region: filters.region || 'global',
        ...(filters.startYear && { start_year: filters.startYear.toString() }),
        ...(filters.endYear && { end_year: filters.endYear.toString() }),
        ngram_type: filters.ngram_type || '1-gram',
        explicit: (filters.explicit ?? true).toString()
      };

      const params = new URLSearchParams(queryParams);
      const response = await axios.get(`http://localhost:8080/lyrics/top?${params}`);
      setData(response.data.data || []);
      setTotalPages(Math.ceil((response.data.totalCount || 0) / 12));
    } catch (error) {
      console.error('Error fetching top lyrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, filters, fetchData]);

  useEffect(() => {
    // Clear filters when component unmounts
    return () => {
      localStorage.removeItem('lyricsFilters');
    };
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6">
      {!isLoading && (
        <div className="flex justify-end mb-2 mr-10">
          <LyricsFilterButtons onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1);
          }} />
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-white font-body text-base mt-20">
          Loading...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
            {data.map((ngram, index) => (
              <NgramCard 
                key={index} 
                ngram={ngram} 
                rank={(currentPage - 1) * 12 + index + 1}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-4 mt-8 pb-10">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-violet-400 hover:text-rose-400"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <span className="text-violet-400">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-violet-400 hover:text-rose-400"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </>
      )}
    </div>
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

export default TopLyrics; 