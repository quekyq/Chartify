import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import PropTypes from 'prop-types';


const percentageAttributes = [
  'danceability',
  'energy',
  'speechiness',
  'acousticness',
  'instrumentalness',
  'liveness',
  'valence'
];

// Define attributes and their display names
const attributes = {
  danceability: 'Danceability',
  energy: 'Energy',
  loudness: 'Loudness',
  speechiness: 'Speechiness',
  acousticness: 'Acousticness',
  instrumentalness: 'Instrumentalness',
  liveness: 'Liveness',
  valence: 'Valence',
  tempo: 'Tempo',
  duration: 'Duration (seconds)',
  explicit: 'Explicit Content (%)'
};

// Color palette for different genres
const colorPalette = {
  'overall': '#82ca9d',
  'pop': '#a3e635',
  'rap': '#ffc658',
  'rock': '#ff8042',
  'r&b': '#ea7ccc',
  'latin': '#db2777',
  'alt z': '#2563eb',
  'country': '#a855f7',
  'hip hop': '#38bdf8',
  'indie': '#059669',
  // 'musica mexicana': '#fcd34d',
  // 'neo mellow': '#f87171',
};


const axisLabels = {
  duration: 'Duration (seconds)',
  loudness: 'Loudness (dB)',
  tempo: 'Tempo (BPM)',
  explicit: 'Explicit Content (%)',
  danceability: 'Danceability (%)',
  energy: 'Energy (%)',
  speechiness: 'Speechiness (%)',
  acousticness: 'Acousticness (%)',
  instrumentalness: 'Instrumentalness (%)',
  liveness: 'Liveness (%)',
  valence: 'Valence (%)',
};


const SongEvolution = () => {
  const [data, setData] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState('danceability');
  const [showGenres, setShowGenres] = useState(false);
  const [yDomain, setYDomain] = useState(['auto', 'auto']);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/trends/song-evolution');
        const transformedData = response.data[0].array_agg.map((year, index) => {
          const dataPoint = { year };
          response.data.forEach(genre => {
            const value = percentageAttributes.includes(selectedAttribute) 
              ? genre[selectedAttribute][index] * 100 
              : genre[selectedAttribute][index];
            dataPoint[genre.grouped_genre] = value;
          });
          return dataPoint;
        });

        // Calculate min and max across all values
        const allValues = transformedData.flatMap(point => 
          Object.entries(point)
            .filter(([key]) => key !== 'year')
            .map(([, value]) => value)
        );
        const min = Math.floor(Math.min(...allValues));
        const max = Math.ceil(Math.max(...allValues));
        setYDomain([min, max]);

        setData(transformedData);
      } catch (error) {
        console.error('Error fetching song evolution data:', error);
      }
    };

    fetchData();
  }, [selectedAttribute]);

  const handleAttributeChange = (value) => {
    setSelectedAttribute(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-lg">
          <p className="text-violet-400 font-title text-lg mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(3)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-title capitalize text-violet-400">{selectedAttribute} Evolution</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-gray-400">
            <input
              type="checkbox"
              checked={showGenres}
              onChange={(e) => setShowGenres(e.target.checked)}
              className="rounded accent-violet-500 bg-gray-800 border-gray-600"
            />
            <span>Show Genre Breakdown</span>
          </label>
          <Select onValueChange={handleAttributeChange} value={selectedAttribute}>
            <SelectTrigger className="w-[200px] cursor-pointer">
              <SelectValue placeholder="Select attribute" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95">
              {Object.entries(attributes).map(([key, value]) => (
                <SelectItem 
                  key={key} 
                  value={key}
                  className="cursor-pointer hover:bg-gray-800"
                >
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[600px] w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="year" 
              stroke="#cbd5e1"
              domain={[2014, 2023]}
              ticks={[2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]}
            />
            <YAxis 
              stroke="#cbd5e1"
              domain={yDomain}
              label={{ 
                value: axisLabels[selectedAttribute] || attributes[selectedAttribute], 
                angle: -90, 
                position: 'insideLeft',
                offset: -10,
                style: { fill: '#cbd5e1' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.entries(colorPalette).map(([genre, color]) => (
              (genre === 'overall' ? !showGenres : showGenres) && (
                <Line
                  key={genre}
                  type="monotone"
                  dataKey={genre}
                  stroke={color}
                  strokeWidth={genre === 'overall' ? 3 : 2}
                  dot={false}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SongEvolution;