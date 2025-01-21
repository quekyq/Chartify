import { useState } from "react";
import SongEvolution from './SongEvolution';
import AttributeCorrelation from './AttributeCorrelation';

const TrendsPage = () => {
  const [activeTab, setActiveTab] = useState('evolution');

  return (
    <div className="max-w-7xl mx-auto px-4 py-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        {/* Tab Navigation */}
        <div className="flex space-x-4">
          <button
            className={`px-4 font-title text-xl ${activeTab === 'evolution' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-violet-400'}`}
            onClick={() => setActiveTab('evolution')}
          >
            Song Evolution
          </button>
          <button
            className={`px-4 font-title text-xl ${activeTab === 'correlation' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-violet-400'}`}
            onClick={() => setActiveTab('correlation')}
          >
            Attribute Correlation
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'evolution' && <SongEvolution />}
      {activeTab === 'correlation' && <AttributeCorrelation />}
    </div>
  );
};

export default TrendsPage; 