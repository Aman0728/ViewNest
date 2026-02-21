import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "./Axios/axios";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

function VideoCard({ video }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load(); 
    }
  };

  return (
    <button
      onClick={() => navigate(`/video/${video._id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="text-left rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
    >
      <video
        ref={videoRef}
        src={video.videoFile}
        poster={video.thumbnail}
        muted
        loop
        preload="metadata"
        className="w-full h-40 object-cover"
      />

      <div className="p-2">
        <h3 className="text-sm font-semibold truncate">
          {video.title}
        </h3>
      </div>
    </button>
  );
}

function Home() {
  const userdata = useSelector((state) => state.auth.userData);
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await api.get("/videos/random/r");
      const newVideos = data.data;
      setVideos(newVideos);
    };
    fetchVideos();
  }, []);
//   useEffect(() => {
//     console.log("UPDATED VIDEOS:", videos);
//   }, [videos]);

  return (
    userdata ? 
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-10">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
    : <div>
      <p className=" text-6xl text-red-600 mt-10">Login to access the content</p>
    </div>
  );

}

export default Home;
