import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from './Axios/axios';
import { Search as SearchIcon, Play } from 'lucide-react';

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); 
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Adjust this endpoint if your API expects something else, like `/videos?query=${query}`
        const { data } = await api.get(`/videos/search/${query}`);
        setResults(data.data || []);
      } catch (error) {
        console.error("Failed to fetch search results", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <SearchIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Search Results
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing results for "<span className="font-semibold text-gray-700 dark:text-gray-300">{query}</span>"
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
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
                <SearchIcon size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  We couldn't find any videos matching "{query}". Try searching with different keywords!
                </p>
              </div>
            ) : (
              /* SEARCH RESULTS LIST */
              <div className="space-y-4">
                {results.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all group relative pr-4"
                  >
                    {/* THUMBNAIL */}
                    <div 
                      onClick={() => navigate(`/video/${item._id}`)}
                      className="w-full sm:w-64 aspect-video bg-black rounded-xl overflow-hidden shrink-0 cursor-pointer relative"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
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
                        onClick={() => navigate(`/video/${item._id}`)}
                        className="text-left focus:outline-none"
                      >
                        <h2 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h2>
                      </button>

                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 flex items-center gap-2">
                        {item.owner?.avatar && (
                          <img 
                            src={item.owner.avatar} 
                            alt={item.owner.fullName} 
                            className="w-6 h-6 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                          />
                        )}
                        {item.owner?.fullName || "Unknown Creator"}
                      </p>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                        <span>{item.views} views</span>
                        
                        {item.createdAt && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>

                      {item.description && (
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 hidden md:block">
                           {item.description}
                         </p>
                      )}
                    </div>
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

export default Search;