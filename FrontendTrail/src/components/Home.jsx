import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { api } from "./Axios/axios";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";

function VideoCard({ video }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const playTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    playTimeoutRef.current = setTimeout(() => {
      if (videoRef.current) {
        setIsPlaying(true);
        videoRef.current.play().catch((err) => {
          console.log("Autoplay prevented:", err);
          setIsPlaying(false);
        });
      }
    }, 300);
  };

  const handleMouseLeave = () => {
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    
    if (videoRef.current) {
      setIsPlaying(false);
      videoRef.current.pause();
      videoRef.current.currentTime = 0; 
    }
  };

  return (
    <div className="flex flex-col gap-3 group cursor-pointer" onClick={() => navigate(`/video/${video._id}`)}>
      
      {/* THUMBNAIL / VIDEO PLAYER CONTAINER */}
      <div 
  className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800"
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>

  {/* Thumbnail */}
  <img
    src={video.thumbnail}
    alt={video.title}
    onError={(e) => {
      e.target.src =
        "https://placehold.co/600x400/1f2937/ffffff?text=No+Thumbnail";
    }}
    className="absolute inset-0 w-full h-full object-cover z-20"
  />

  {/* Video */}
  <video
    ref={videoRef}
    src={video.videoFile}
    muted
    loop
    playsInline
    preload="metadata"
    className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
      isPlaying ? "opacity-100 z-20" : "opacity-0 z-0"
    }`}
  />
        
        {/* Subtle dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-20 pointer-events-none" />
      </div>

      {/* VIDEO DETAILS */}
      <div className="flex items-start gap-3 pr-4">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 mt-0.5">
          <img
            src={video.owner?.avatar || "https://ui-avatars.com/api/?name=User&background=random"}
            alt={video.owner?.username}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {video.title}
          </h3>
          
          <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors truncate">
              @{video.owner?.username || "Unknown Channel"}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span>{video.views || 0} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const userdata = useSelector((state) => state.auth.userData);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/videos/random/r");
        setVideos(data.data);
        console.log(data.data);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userdata) {
      fetchVideos();
    } else {
      setLoading(false);
    }
  }, [userdata]);

  // LOGGED OUT STATE
  if (!userdata) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You need to be logged in to browse the feed, interact with creators,
            and watch videos.
          </p>
          <Link
            to="/login" // Adjust to your actual login route
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
        <p className="font-medium">Loading your feed...</p>
      </div>
    );
  }

  // LOGGED IN & LOADED STATE
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 px-4 sm:px-6 py-8">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Recommended for you
        </h1>

        {videos.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No videos found right now. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
