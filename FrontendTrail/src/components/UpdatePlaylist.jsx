import { useEffect, useState } from "react";
import { api } from "./Axios/axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Check, Loader2, Pencil, Film } from "lucide-react";
import { useSelector } from "react-redux";

function UpdatePlaylist() {
  const { playlistId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  
  const userdata = useSelector(state => state.auth.userData);

  // 🔹 Fetch existing playlist data AND user's videos
  useEffect(() => {
    const fetchData = async () => {
      if (!userdata?._id || !playlistId) return;
      
      try {
        setFetchingData(true);
        
        // Fetch both the playlist details and the user's videos simultaneously
        const [playlistRes, videosRes] = await Promise.all([
          api.get(`/playlists/${playlistId}`),
          api.get(`/videos/c/${userdata._id}`)
        ]);

        const playlistData = playlistRes.data.data;
        const userVideos = videosRes.data.data || [];

        // Pre-fill the form
        setTitle(playlistData.title || "");
        setDescription(playlistData.description || "");
        
        // Ensure we extract just the IDs if the API returns populated video objects
        const existingVideoIds = playlistData.videos.map(v => 
          typeof v === 'object' ? v._id : v
        );
        setSelectedVideos(existingVideoIds);
        setVideos(userVideos);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        alert("Could not load playlist data.");
        navigate(-1); // Go back if we can't load the playlist
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [userdata?._id, playlistId, navigate]);

  // 🔹 Toggle video selection
  const toggleVideo = (id) => {
    setSelectedVideos((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [...prev, id]
    );
  };

  // 🔹 Update playlist
  const updatePlaylist = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Playlist name is required");
      return;
    }
    if (selectedVideos.length === 0) {
      alert("Please select at least one video to keep in the playlist");
      return;
    }

    try {
      setLoading(true);

      // Sending standard JSON since there's no file upload
      await api.patch(`/playlists/${playlistId}`, {
        title,
        description,
        videos: selectedVideos,
      });

      navigate(-1); // Go back to the previous page
    } catch (err) {
      console.error(err);
      alert("Failed to update playlist");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center transition-colors duration-300">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading playlist details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-3">
            <Pencil className="text-indigo-500" size={32} />
            Update Playlist
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Make changes to your playlist's details or manage its videos.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 transition-colors duration-300">
          <form onSubmit={updatePlaylist} className="space-y-8">

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
                  Manage Videos <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full">
                  {selectedVideos.length} Selected
                </span>
              </div>

              {videos?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <Film size={48} className="text-gray-400 dark:text-gray-600 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No videos found.</p>
                  <p className="text-sm text-gray-500 mt-1 mb-4">You need to upload videos to add them to a playlist.</p>
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
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedVideos.length === 0 || !title.trim()}
                className="sm:min-w-[160px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Pencil size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdatePlaylist;