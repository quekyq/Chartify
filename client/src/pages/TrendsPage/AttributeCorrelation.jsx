import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import PropTypes from 'prop-types';


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
  duration: 'Duration (seconds)'
};

const axisLabels = {
  duration: 'Duration (seconds)',
  loudness: 'Loudness (dB)',
  tempo: 'Tempo (BPM)',
  danceability: 'Danceability (%)',
  energy: 'Energy (%)',
  speechiness: 'Speechiness (%)',
  acousticness: 'Acousticness (%)',
  instrumentalness: 'Instrumentalness (%)',
  liveness: 'Liveness (%)',
  valence: 'Valence (%)',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl shadow-lg">
        <p className="text-gray-400 text-sm">{`${axisLabels[data.xKey] || attributes[data.xKey]}: ${data.x.toFixed(2)}`}</p>
        <p className="text-gray-400 text-sm">{`${axisLabels[data.yKey] || attributes[data.yKey]}: ${data.y.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array
};

const AttributeCorrelation = () => {
  const [rawData, setRawData] = useState([]);
  const [attribute1, setAttribute1] = useState('danceability');
  const [attribute2, setAttribute2] = useState('energy');

  // Memoize the transformation function
  const transformData = useCallback((data, attr1, attr2) => {
    return data.map(item => ({
      x: item[attr1],
      y: item[attr2],
      xKey: attr1,
      yKey: attr2
    }));
  }, []);

  // Memoize the display data
  const displayData = useMemo(() => {
    if (!rawData.length) return [];
    return transformData(rawData, attribute1, attribute2);
  }, [rawData, attribute1, attribute2, transformData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/trends/attribute-correlation');
        const processedData = response.data.map(item => ({
          ...item,
          duration: item.duration_ms / 1000,
          danceability: item.danceability * 100,
          energy: item.energy * 100,
          speechiness: item.speechiness * 100,
          acousticness: item.acousticness * 100,
          instrumentalness: item.instrumentalness * 100,
          liveness: item.liveness * 100,
          valence: item.valence * 100,
        }));
        setRawData(processedData);
      } catch (error) {
        console.error('Error fetching correlation data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-4xl font-title text-violet-400 text-center mb-8">
        Attribute Correlation Analysis
      </h2>

      <div className="flex flex-col items-center">
        {/* Main Container */}
        <div className="relative w-full max-w-[1200px]">
          {/* Graph Section - Centered */}
          <div className="flex justify-center">
            <div className="h-[600px] w-[600px]">
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 15, right: 15, left: 15, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    type="number"
                    dataKey="x"
                    name={attribute1}
                    stroke="#cbd5e1"
                    label={{ 
                      value: axisLabels[attribute1] || attributes[attribute1],
                      position: 'bottom',
                      offset: 0,
                      style: { fill: '#cbd5e1' }
                    }}
                  />
                  <YAxis 
                    type="number"
                    dataKey="y"
                    name={attribute2}
                    stroke="#cbd5e1"
                    label={{ 
                      value: axisLabels[attribute2] || attributes[attribute2],
                      angle: -90,
                      position: 'insideLeft',
                      offset: -2,
                      style: { fill: '#cbd5e1' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter 
                    data={displayData} 
                    fill="#10b981"
                    fillOpacity={0.8}
                    shape="circle"
                    r={1}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Controls Section - Absolute positioned to the right */}
          <div className="absolute top-0 right-14 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">X-Axis</label>
              <Select onValueChange={setAttribute1} value={attribute1}>
                <SelectTrigger className="w-[200px] cursor-pointer">
                  <SelectValue placeholder="Select first attribute" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95">
                  {Object.entries(attributes).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="cursor-pointer hover:bg-gray-800">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Y-Axis</label>
              <Select onValueChange={setAttribute2} value={attribute2}>
                <SelectTrigger className="w-[200px] cursor-pointer">
                  <SelectValue placeholder="Select second attribute" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95">
                  {Object.entries(attributes).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="cursor-pointer hover:bg-gray-800">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributeCorrelation;