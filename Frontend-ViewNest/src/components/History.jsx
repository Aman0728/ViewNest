import React, { useEffect, useState } from 'react';
import { api } from './Axios/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Clock, X, Play } from 'lucide-react';

function History() {
  const userdata = useSelector((state) => state.auth.userData);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await api.get("/users/watch/history");
        setHistory(data.data || []);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const removeFromHistory = async (videoId) => {
    // Optimistic UI update: Remove immediately from screen for better UX
    setHistory((prev) => prev.filter((e) => e.video._id.toString() !== videoId));
    
    try {
      await api.delete(`/users/watch/history/${videoId}`);
    } catch (error) {
      console.error("Failed to remove from history", error);
      // Optional: If the API fails, you could refetch the history here to revert the UI
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Watch History
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Videos you've watched in the past
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : (
          <>
            {/* EMPTY STATE */}
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
                <Clock size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No watch history yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Videos you watch will show up here. Start exploring to build your history!
                </p>
              </div>
            ) : (
              /* HISTORY LIST */
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.video._id}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all group relative pr-12 sm:pr-4"
                  >
                    {/* THUMBNAIL */}
                    <div 
                      onClick={() => navigate(`/video/${item.video._id}`)}
                      className="w-full sm:w-64 aspect-video bg-black rounded-xl overflow-hidden shrink-0 cursor-pointer relative"
                    >
                      <img
                        src={item.video.thumbnail}
                        alt={item.video.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity"
                      />
                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/60 p-3 rounded-full backdrop-blur-sm">
                          <Play fill="white" className="text-white ml-1" size={24} />
                        </div>
                      </div>
                    </div>

                    {/* VIDEO INFO */}
                    <div className="flex-1 flex flex-col justify-start py-1 min-w-0">
                      <button
                        onClick={() => navigate(`/video/${item.video._id}`)}
                        className="text-left focus:outline-none"
                      >
                        <h2 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.video.title}
                        </h2>
                      </button>

                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                        {item.video.owner?.fullName || "Unknown Creator"}
                      </p>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                        <span>{item.video.views} views</span>
                        
                        {/* WATCHED TIME */}
                        {item.watchedAt && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                            <span>Watched on {new Date(item.watchedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>

                      {/* Optional: Add a small description snippet if your API returns it */}
                      {item.video.description && (
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 hidden md:block">
                           {item.video.description}
                         </p>
                      )}
                    </div>

                    {/* REMOVE BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.video._id);
                      }}
                      title="Remove from history"
                      className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all self-start focus:outline-none shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default History;