import { useEffect, useState } from "react";
import { api } from "./Axios/axios";
import { useParams, useSearchParams } from "react-router-dom";

function Playlist() {
  const {playlistId} = useParams()
  const [playlist, setPlaylist] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async() => {
        const {data} = await api.get(`/playlists/${playlistId}`)
        console.log(data?.data)
        setPlaylist(data?.data)
        setCurrentVideo(data?.data[0])
    }
    fetchPlaylist()
  }, [playlistId]);

  if (!playlist) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold">{playlist.title}</h1>
      <p className="text-gray-600 mb-4">{playlist.description}</p>

      {/* Main Video */}
      {currentVideo && (
        <video
          src={currentVideo.videoFile}
          controls
          className="w-full rounded-lg mb-6"
        />
      )}

      {/* Video List */}
      <div className="space-y-3">
        {playlist.videos.map((video) => (
          <div
            key={video._id}
            onClick={() => setCurrentVideo(video)}
            className="flex gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-32 rounded"
            />
            <div>
              <h3 className="font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-500">{video.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Playlist;
