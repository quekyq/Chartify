import { useState } from "react";
import LazyTable from '../../components/LazyTable';
import FilterButtons from '../../components/FilterButtons';
import axios from 'axios';

const TopSongs = () => {
  const [filters, setFilters] = useState({
    region: 'global',
    startYear: '',
    endYear: ''
  });

  const columns = [
    { key: 'track_name', header: 'Song', width: '23%' },
    { key: 'artists', header: 'Artists', width: '23%' },
    { key: 'album_title', header: 'Album', width: '23%' },
    { key: 'num_one_count', header: 'Weeks at #1', width: '7%' },
    { key: 'num_weeks_charted', header: 'Weeks Charted', width: '7%' },
    { key: 'peak_position', header: 'Peak Position', width: '7%' }
  ];

  const fetchTableData = async (page) => {
    try {
      const queryParams = {
        page: page.toString(),
        region: filters.region,
        ...(filters.startYear && { start_year: filters.startYear.toString() }),
        ...(filters.endYear && { end_year: filters.endYear.toString() })
      };

      const params = new URLSearchParams(queryParams);
      const response = await axios.get(`http://localhost:8080/song/top?${params}`);
      return {
        data: response.data.data || [],
        totalCount: response.data.totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching top songs:', error);
      return { data: [], totalCount: 0 };
    }
  };

  return (
    <>
     <div className="flex justify-end mb-2 mr-8">
        <FilterButtons onFilterChange={setFilters} />
      </div>
      <div className="overflow-hidden">
        <LazyTable
          key={JSON.stringify(filters)}
          columns={columns}
          fetchData={fetchTableData}
          rowsPerPage={10}
          className="w-full text-left"
          headerClassName="py-3 px-6 font-title text-violet-400"
          rowClassName="border-b border-gray-800 hover:bg-gray-900"
          cellClassName="py-4 px-6 font-body"
        />
      </div>
    </>
  );
};

export default TopSongs; 