import { useState } from "react";
import TopSongs from './TopSongs';
import TopGenres from './TopGenres';
import ExploreSongs from './ExploreSongs';

const SongPage = () => {
  const [activeTab, setActiveTab] = useState('top');

  return (
    <div className="max-w-7xl mx-auto px-4 py-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        {/* Tab Navigation */}
        <div className="flex space-x-4">
          <button
            className={`px-4 font-title text-xl ${activeTab === 'top' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-violet-400'}`}
            onClick={() => setActiveTab('top')}
          >
            Top Songs
          </button>
          <button
            className={`px-4 font-title text-xl ${activeTab === 'genres' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-violet-400'}`}
            onClick={() => setActiveTab('genres')}
          >
            Top Genres
          </button>
          <button
            className={`px-4 font-title text-xl ${activeTab === 'explore' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-violet-400'}`}
            onClick={() => setActiveTab('explore')}
          >
            Explore Songs
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'top' && <TopSongs />}
      {activeTab === 'genres' && <TopGenres />}
      {activeTab === 'explore' && <ExploreSongs />}
    </div>
  );
};

export default SongPage; 