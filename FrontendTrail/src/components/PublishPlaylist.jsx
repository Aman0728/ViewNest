import { useEffect, useState } from "react";
import { api } from "./Axios/axios";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useSelector } from "react-redux";

function PublishPlaylist() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const userdata = useSelector(state => state.auth.userData)

  // 🔹 Fetch user's videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await api.get(`/videos/c/${userdata?._id}`);
        console.log(data)
        setVideos(data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchVideos();
  }, []);

  // 🔹 Toggle video selection
  const toggleVideo = (id) => {
    const selected = selectedVideos.some(item => item._id === id._id);
    setSelectedVideos((prev) =>
      selected
        ? prev.filter((v) => (v._id !== id._id))
        : [...prev, id]
    );
  };

  // 🔹 Create playlist
  const createPlaylist = async (e) => {
    e.preventDefault();
    console.log(selectedVideos)
    if (!name.trim()) {
      alert("Playlist name required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/playlists", {
        name,
        description,
        videos: selectedVideos,
      });

      navigate("/"); // or playlists page
    } catch (err) {
      console.log(err);
      alert("Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Create Playlist</h1>

      <form onSubmit={createPlaylist} className="space-y-6">

        {/* PLAYLIST NAME */}
        <div>
          <label className="text-sm font-medium">Playlist Name</label>
          <input
            type="text"
            placeholder="Enter playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={3}
            placeholder="Describe your playlist"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* SELECT VIDEOS */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select Videos
          </label>

          {videos?.length === 0 ? (
            <p className="text-sm text-gray-500">
              No videos available.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {videos.map((v) => {
                const video = {
                    _id: v._id,
                    videoFile: v.videoFile,
                    thumbnail: v.thumbnail,
                    duration: v.duration,
                    title: v.title,
                }
                const selected = selectedVideos.some(item => item._id === v._id);

                return (
                  <div
                    key={v._id}
                    onClick={() => toggleVideo(video)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border transition ${
                      selected
                        ? "border-indigo-500 ring-2 ring-indigo-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="aspect-video bg-black">
                      <img
                        src={v.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* SELECTED ICON */}
                    {selected && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                        <Check size={16} />
                      </div>
                    )}

                    <p className="text-xs p-2 line-clamp-2">
                      {v.title}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium transition"
        >
          {loading ? "Creating..." : "Create Playlist"}
        </button>
      </form>
    </div>
  );
}

export default PublishPlaylist;