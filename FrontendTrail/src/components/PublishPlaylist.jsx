import { useEffect, useState } from "react";
import { api } from "./Axios/axios";
import { useNavigate, Link } from "react-router-dom";
import { Check, Loader2, ListPlus, Film } from "lucide-react";
import { useSelector } from "react-redux";

function PublishPlaylist() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingVideos, setFetchingVideos] = useState(true);
  
  const userdata = useSelector(state => state.auth.userData);

  // 🔹 Fetch user's videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!userdata?._id) return; // Wait until userdata is available
      
      try {
        setFetchingVideos(true);
        const { data } = await api.get(`/videos/c/${userdata._id}`);
        setVideos(data.data || []);
      } catch (err) {
        console.error("Failed to fetch videos:", err);
      } finally {
        setFetchingVideos(false);
      }
    };
    fetchVideos();
  }, [userdata?._id]); // Added dependency to ensure it fires when user loads

  // 🔹 Toggle video selection
  const toggleVideo = (id) => {
    setSelectedVideos((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [...prev, id]
    );
  };

  // 🔹 Create playlist
  const createPlaylist = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Playlist name is required");
      return;
    }
    if (selectedVideos.length === 0) {
      alert("Please select at least one video to create a playlist");
      return;
    }

    try {
      setLoading(true);

      await api.post("/playlists", {
        title,
        description,
        videos: selectedVideos,
      });

      navigate("/"); // Navigate to user's channel or playlists page
    } catch (err) {
      console.error(err);
      alert("Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-3">
            <ListPlus className="text-indigo-500" size={32} />
            Create Playlist
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Group your related videos together for viewers to binge-watch.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 transition-colors duration-300">
          <form onSubmit={createPlaylist} className="space-y-8">

            {/* PLAYLIST INFO (Grid on md+ screens) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PLAYLIST NAME */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Playlist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., React Tutorials 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What is this playlist about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
                />
              </div>
            </div>

            {/* SELECT VIDEOS SECTION */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                  Add Videos to Playlist <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full">
                  {selectedVideos.length} Selected
                </span>
              </div>

              {fetchingVideos ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Loader2 className="animate-spin mb-3" size={32} />
                  <p>Loading your videos...</p>
                </div>
              ) : videos?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <Film size={48} className="text-gray-400 dark:text-gray-600 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No videos found.</p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">You need to upload videos before creating a playlist.</p>
                  <Link to="/video/v/publish" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Upload a Video
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-2 -mx-2 pr-4 custom-scrollbar">
                  {videos.map((v) => {
                    const isSelected = selectedVideos.includes(v._id);

                    return (
                      <div
                        key={v._id}
                        onClick={() => toggleVideo(v._id)}
                        className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md transform scale-[0.98]"
                            : "border-transparent bg-gray-100 dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm"
                        }`}
                      >
                        {/* THUMBNAIL */}
                        <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                          <img
                            src={v.thumbnail}
                            alt={v.title}
                            className={`w-full h-full object-cover transition-opacity duration-200 ${
                              isSelected ? "opacity-80 mix-blend-multiply dark:mix-blend-screen" : "opacity-100"
                            }`}
                          />
                          
                          {/* SELECTION OVERLAY */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                              <div className="bg-indigo-600 text-white rounded-full p-1.5 shadow-lg scale-in">
                                <Check size={20} strokeWidth={3} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* VIDEO TITLE */}
                        <div className="p-3">
                          <p className={`text-sm font-medium line-clamp-2 ${
                            isSelected ? "text-indigo-900 dark:text-indigo-300" : "text-gray-800 dark:text-gray-200"
                          }`}>
                            {v.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || selectedVideos.length === 0 || !title.trim()}
                className="w-full sm:w-auto sm:min-w-[200px] float-right flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ListPlus size={20} />
                    Create Playlist
                  </>
                )}
              </button>
              <div className="clear-both"></div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default PublishPlaylist;