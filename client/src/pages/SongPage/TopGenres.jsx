import { useState, useEffect } from "react";
import FilterButtons from '../../components/FilterButtons';
import axios from 'axios';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-lg">
        <p className="text-violet-400 font-title text-lg mb-2">{label}</p>
        <p className="text-rose-400">Weeks Charted: {payload[0].value}</p>
        <p className="text-blue-400">#1 Weeks: {payload[1].value}</p>
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-gray-300">Top Track: {payload[0].payload.top_track_name}</p>
          <p className="text-gray-400 text-sm">
            Peak Position: {payload[0].payload.top_track_peak_position}
          </p>
          <p className="text-gray-400 text-sm">
            Weeks Charted: {payload[0].payload.top_track_weeks_charted}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string
};

const TopGenres = () => {
  const [filters, setFilters] = useState({
    region: 'global',
    startYear: '',
    endYear: ''
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = {
            region: filters.region,
            ...(filters.startYear && { start_year: filters.startYear.toString() }),
            ...(filters.endYear && { end_year: filters.endYear.toString() })
          };
        const params = new URLSearchParams(queryParams);
        const response = await axios.get(`http://localhost:8080/song/genres?${params}`);

        
        const formattedData = response.data.map(item => ({
          ...item,
          genre_weeks_charted: parseInt(item.genre_weeks_charted),
          genre_num_one_count: parseInt(item.genre_num_one_count)
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching genre data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  useEffect(() => {
    // Clear filters when component unmounts
    return () => {
      localStorage.removeItem('generalFilters');
    };
  }, []);

  if (loading) {
    return <div className="text-center relative top-20 font-body text-base text-white">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center text-violet-300">No genre data available</div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4 mr-10">
        <FilterButtons onFilterChange={setFilters} />
      </div>
      <div className=" h-[650px] w-full">
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 10 }}
          >
            <XAxis 
              dataKey="grouped_genre" 
              angle={-35}
              textAnchor="end"
              height={140}
              interval={0}
              stroke="#cbd5e1"
              tick={{ fill: '#cbd5e1' }}
            />
            <YAxis 
              yAxisId="left" 
              stroke="#8884d8"
              scale="log"
              domain={[1, 'auto']}
              tickFormatter={(value) => value.toLocaleString()}
              label={{ 
                value: 'Cumulative Weeks Charted (log)', 
                angle: -90, 
                position: 'center',
                dx: -40,
                fill: '#8884d8'
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#82ca9d"
              domain={[1, 'auto']}
              tickFormatter={(value) => value.toLocaleString()}
              label={{ 
                value: 'Cumulative Weeks at #1', 
                angle: 90, 
                position: 'center',
                fill: '#82ca9d',
                dx: 40
              }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }}
            />
            <Legend 
              verticalAlign="top"
              height={10}
            />
            <Bar 
              yAxisId="left"
              dataKey="genre_weeks_charted" 
              name="Cumulative Weeks Charted (log)" 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]}
              maxBarSize={80}
            />
            <Bar 
              yAxisId="right"
              dataKey="genre_num_one_count" 
              name="Cumulative Weeks at #1"
              fill="#82ca9d" 
              radius={[4, 4, 0, 0]}
              maxBarSize={80}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default TopGenres; 