import { useState, useEffect, useCallback } from "react";
import FilterButtons from '../../components/FilterButtons';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

const ArtistCard = ({ artist, rank }) => (
  <div className="max-w-6xl mx-auto rounded-2xl p-4 border border-violet-800/50 relative">
    {/* Rank Badge */}
    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gray-900 border-2 border-violet-700/40 flex items-center justify-center">
      <span className="text-xl font-title text-rose-400">#{rank}</span>
    </div>
    <div className="flex flex-col md:flex-row justify-between items-center gap-1">
      {/* Artist Stats Section */}
      <div className="flex-1">
        <div className="grid grid-cols-5 gap-1 items-center">
          <div className="col-span-2 text-center">
            <p className="text-4xl font-title text-white">{artist.artist_name}</p>
          </div>
          <div className="text-center">
            <p className="text-violet-400 text-lg font-semibold">{artist.artist_num_one_count}</p>
            <p className="text-gray-400 text-xs">Cumulative Weeks at #1 (Artist&apos;s Tracks)</p>
          </div>
          <div className="text-center">
            <p className="text-violet-400 text-lg font-semibold">{artist.num_weeks_artist_charted}</p>
            <p className="text-gray-400 text-xs">Cumulative Weeks Charted (Artist&apos;s Tracks)</p>
          </div>
          <div className="text-center">
            <p className="text-violet-400 text-lg font-semibold">#{artist.artist_peak_position}</p>
            <p className="text-gray-400 text-xs">Peak Position (Artist&apos;s Tracks)</p>
          </div>
        </div>
      </div>

      {/* Vertical Divider */}
      <div className="hidden md:block w-px bg-gray-800 mx-2"></div>

      {/* Top Song Section */}
      <div className="md:w-1/3">
        <h4 className="text-base font-body text-rose-400">Top Song: {artist.top_song}</h4>
        <div className="rounded py-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="text-emerald-400 font-medium">{artist.song_num_one_count}</p>
              <p className="text-gray-400">Weeks at #1</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-400 font-medium">{artist.song_weeks_charted}</p>
              <p className="text-gray-400">Weeks Charted</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-400 font-medium">#{artist.song_peak_position}</p>
              <p className="text-gray-400">Peak Position</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

ArtistCard.propTypes = {
  artist: PropTypes.shape({
    artist_name: PropTypes.string.isRequired,
    artist_num_one_count: PropTypes.string.isRequired,
    num_weeks_artist_charted: PropTypes.string.isRequired,
    artist_peak_position: PropTypes.number.isRequired,
    top_song: PropTypes.string.isRequired,
    song_num_one_count: PropTypes.number.isRequired,
    song_weeks_charted: PropTypes.number.isRequired,
    song_peak_position: PropTypes.number.isRequired,
  }).isRequired,
  rank: PropTypes.number.isRequired
};

const TopArtists = () => {
  const [filters, setFilters] = useState({
    region: 'global',
    startYear: '',
    endYear: ''
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
        region: filters.region,
        ...(filters.startYear && { start_year: filters.startYear.toString() }),
        ...(filters.endYear && { end_year: filters.endYear.toString() })
      };

      const params = new URLSearchParams(queryParams);
      const response = await axios.get(`http://localhost:8080/artist/top?${params}`);
      setData(response.data.data || []);
      setTotalPages(Math.ceil((response.data.totalCount || 0) / 10));
    } catch (error) {
      console.error('Error fetching top artists:', error);
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
      localStorage.removeItem('generalFilters');
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
          <FilterButtons onFilterChange={(newFilters) => {
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
          <div className="space-y-6">
            {data.map((artist, index) => (
              <ArtistCard 
                key={index} 
                artist={artist} 
                rank={(currentPage - 1) * 10 + index + 1}
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

export default TopArtists; 