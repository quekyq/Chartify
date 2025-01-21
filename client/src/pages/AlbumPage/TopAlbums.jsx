import axios from 'axios';
import FilterButtons from '../../components/FilterButtons';
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';


const AlbumCard = ({ album, rank }) => (
  <div className="max-w-6xl mx-auto rounded-2xl p-4 border border-violet-800/50 relative">
    {/* Rank Badge */}
    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gray-900 border-2 border-violet-700/40 flex items-center justify-center">
      <span className="text-xl font-title text-rose-400">#{rank}</span>
    </div>

    <div className="flex flex-col md:flex-row justify-between items-center gap-1">
      {/* album Stats Section */}
      <div className="flex-1">
        <div className="grid grid-cols-7 gap-4 items-center">
          <div className="col-span-4 text-center">
            <p className="text-4xl font-title text-white">{album.album_title}</p>
            <p className="text-violet-400 text-sm mt-2">{album.artists}</p>
          </div>
          <div className="text-center">
            <p className="text-emerald-400 text-lg font-semibold">{album.num_weeks_charted}</p>
            <p className="text-gray-400 text-xs">Cumulative Weeks Charted (Album&apos;s Tracks)</p>
          </div>
          <div className="text-center">
            <p className="text-emerald-400 text-lg font-semibold">{album.num_one_count}</p>
            <p className="text-gray-400 text-xs">Cumulative Weeks at #1 (Album&apos;s Tracks)</p>
          </div>
          <div className="text-center">
            <p className="text-emerald-400 text-lg font-semibold">#{album.peak_position}</p>
            <p className="text-gray-400 text-xs">Peak Position (Album&apos;s Tracks)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

AlbumCard.propTypes = {
  album: PropTypes.shape({
    album_title: PropTypes.string.isRequired,
    artists: PropTypes.string.isRequired,
    num_one_count: PropTypes.number.isRequired,
    num_weeks_charted: PropTypes.number.isRequired,
    peak_position: PropTypes.number.isRequired
  }).isRequired,
  rank: PropTypes.number.isRequired
};

const TopAlbums = () => {

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
          const response = await axios.get(`http://localhost:8080/album/top?${params}`);
          setData(response.data.data || []);
          setTotalPages(Math.ceil((response.data.totalCount || 0) / 10));
        } catch (error) {
          console.error('Error fetching top albums:', error);
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
                {data.map((album, index) => (
                  <AlbumCard 
                    key={index} 
                    album={album} 
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

export default TopAlbums; 