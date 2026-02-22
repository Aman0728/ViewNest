import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "./Axios/axios";
import { useSelector } from "react-redux";
import LogoutBtn from "./Header/LogoutBtn";
import { History } from "./index";
import { 
  MoreVertical, Trash2, Pencil, Settings, KeyRound, 
  Image as ImageIcon, MonitorUp 
} from "lucide-react";

function Channel() {
  const navigate = useNavigate();
  const { username } = useParams();
  
  const userdata = useSelector((state) => state.auth.userData);

  // States
  const [activeTab, setActiveTab] = useState("videos"); // Moved to top
  const [videos, setVideos] = useState([]);
  const [channelInfo, setChannelInfo] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberedChannels, setSubscribedChannels] = useState([]);
  
  // Dropdown States
  const [openMenuId, setOpenMenuId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 🔹 Toggles for menus
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getSubscribers = async () => {
    const { data } = await api.get(`subscriptions/u/${channelInfo?._id}`);
    setSubscribers(data.data);
  };

  const getSubscribedChannels = async () => {
    const { data } = await api.get(`subscriptions/c/${channelInfo?._id}`);
    setSubscribedChannels(data.data);
  };

  const getChannelPlaylist = async () => {
    const { data } = await api.get(`/playlists/user/${channelInfo._id}`);
    setPlaylist(data.data);
  };

  const toggleSubscribeStatus = async () => {
    const { data } = await api.post(`subscriptions/c/${channelInfo?._id}`);
    setChannelInfo((prev) => ({
      ...prev,
      subscribersCount: isSubscribed 
        ? prev.subscribersCount - 1 
        : prev.subscribersCount + 1
    }));
    setIsSubscribed(data.data);
  };

  useEffect(() => {
    const getChannelInfo = async () => {
      try {
        const { data } = await api.get(`/users/c/${username}`);
        const channelRes = data.data;
        setChannelInfo(channelRes);
        setIsSubscribed(channelRes.isSubscribed);
        
        const channelVideos = await api.get(`videos/c/${channelRes._id}`);
        setVideos(channelVideos.data.data);
      } catch (error) {
        console.error("Failed to fetch channel info:", error);
      }
    };
    getChannelInfo();
    setActiveTab("videos");
  }, [username]);

  const getTweets = async () => {
    const { data } = await api.get(`/tweets/user/${channelInfo._id}`);
    setTweets(data.data);
    setActiveTab("tweets");
  };

  const handleDelete = async (vId) => {
    const temp = videos;
    setVideos(prev => prev.filter(e => e._id !== vId));
    try {
      await api.delete(`/videos/${vId}`);
      setOpenMenuId(null);
    } catch (error) {
      alert(error.message);
      setVideos(temp); // Revert if failed
    }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      
      {/* COVER IMAGE */}
      <div className="w-full h-48 md:h-64 lg:h-72 relative bg-gray-200 dark:bg-gray-800">
        {channelInfo?.coverImage && (
          <img
            src={channelInfo.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* CHANNEL HEADER */}
      <div className="px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <img
            src={channelInfo?.avatar}
            alt="Avatar"
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-gray-950 shadow-md -mt-16 md:-mt-20 relative z-10 bg-gray-100 dark:bg-gray-800"
          />

          <div className="text-center sm:text-left mt-2 sm:mt-0 pb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {channelInfo?.fullName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              @{channelInfo?.username}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {channelInfo?.subscribersCount} subscribers
            </p>
          </div>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex items-center justify-center sm:justify-start gap-3 w-full md:w-auto">
          {userdata?._id.toString() !== channelInfo?._id.toString() ? (
            /* VIEWING SOMEONE ELSE'S CHANNEL */
            <button
              onClick={toggleSubscribeStatus}
              className={`px-6 py-2.5 rounded-full font-medium transition-all w-full md:w-auto ${
                isSubscribed
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          ) : (
            /* VIEWING OWN CHANNEL */
            <div className="flex items-center gap-3 w-full justify-center md:justify-end">
              
              {/* UPDATE/SETTINGS DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-full font-medium transition-colors"
                >
                  <Settings size={18} />
                  <span>Update</span>
                </button>

                {settingsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <button
                        onClick={() => { setSettingsOpen(false); /* navigate('/settings/password') */ }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <KeyRound size={16} className="text-gray-400" />
                        Update Password
                      </button>
                      <button
                        onClick={() => { setSettingsOpen(false); /* navigate('/settings/avatar') */ }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <ImageIcon size={16} className="text-gray-400" />
                        Update Avatar
                      </button>
                      <button
                        onClick={() => { setSettingsOpen(false); /* navigate('/settings/cover') */ }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <MonitorUp size={16} className="text-gray-400" />
                        Update Cover Image
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* LOGOUT BUTTON */}
              <LogoutBtn />
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 mt-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 sm:gap-8 w-max">
          {[
            { id: "videos", label: "Videos", action: () => setActiveTab("videos") },
            { id: "tweets", label: "Tweets", action: getTweets },
            { id: "playlists", label: "Playlists", action: () => { setActiveTab("playlists"); getChannelPlaylist(); } },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* PRIVATE TABS (Only visible to owner) */}
          {userdata?._id.toString() === channelInfo?._id.toString() && [
            { id: "subscribers", label: "Subscribers", action: () => { setActiveTab("subscribers"); getSubscribers(); } },
            { id: "subscribedTo", label: "Subscribed To", action: () => { setActiveTab("subscribedTo"); getSubscribedChannels(); } },
            { id: "watchHistory", label: "History", action: () => setActiveTab("watchHistory") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="px-4 sm:px-6 py-6 md:py-8 bg-gray-50 dark:bg-gray-950 min-h-[40vh] transition-colors">
        
        {/* VIDEOS */}
        {activeTab === "videos" && (
          <div className="flex flex-col gap-4 sm:gap-6">
            {videos.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No videos yet.</p>
            ) : (
              videos?.map((v) => (
                <div 
                  key={v._id} 
                  className="relative group flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 sm:p-4 hover:shadow-md dark:hover:border-gray-700 transition"
                >
                  
                  {/* THUMBNAIL */}
                  <button
                    onClick={() => navigate(`/video/${v._id}`)}
                    className="w-full sm:w-56 md:w-72 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 relative focus:outline-none"
                  >
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </button>

                  {/* VIDEO DETAILS */}
                  <div className="flex flex-col flex-grow min-w-0 pr-10">
                    <button
                      onClick={() => navigate(`/video/${v._id}`)}
                      className="text-left focus:outline-none"
                    >
                      <h3 className="text-lg font-semibold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {v.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                        <span>{v.views} views</span>
                        {/* If you have a createdAt date, you can add it here: */}
                        {/* <span>•</span> */}
                        {/* <span>{formatTimeAgo(v.createdAt)}</span> */}
                      </div>
                      
                      {/* Description Snippet (Hidden on very small screens, visible on md+) */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 hidden md:block">
                        {v.description || "No description available."}
                      </p>
                    </button>
                  </div>

                  {/* THREE DOT BUTTON (Moved to the far right of the row) */}
                  {userdata?._id === channelInfo?._id && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMenu(v._id); }}
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition focus:outline-none"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {openMenuId === v._id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-lg text-sm z-40 overflow-hidden w-36">
                            <button
                              onClick={() => navigate(`/video/update/${v._id}`)}
                              className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-gray-700 dark:text-gray-200"
                            >
                              <Pencil size={14} /> Update
                            </button>
                            <button
                              onClick={() => handleDelete(v._id)}
                              className="flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-red-600 dark:text-red-400 border-t border-gray-100 dark:border-gray-700"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        )}

        {/* TWEETS */}
        {activeTab === "tweets" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tweets.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No tweets yet.</p>
            ) : (
              tweets?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => navigate(`/tweet/${t._id}`)}
                  className="text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md dark:hover:border-gray-700 transition"
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-4 leading-relaxed">
                    {t.content}
                  </p>
                </button>
              ))
            )}
          </div>
        )}

        {/* PLAYLISTS */}
        {activeTab === "playlists" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlist.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 col-span-full">No playlists yet.</p>
            ) : (
              playlist?.map((p) => (
                <button
                  key={p._id}
                  onClick={() => navigate(`/video/${p.videos[0]}?playlist=${p._id}&v=0`)}
                  className="text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md dark:hover:border-gray-700 transition"
                >
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    {/* Optional: Add a playlist cover image here if you have one, otherwise a placeholder icon */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">{p.videos.length}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    View full playlist
                  </p>
                </button>
              ))
            )}
          </div>
        )}

        {/* SUBSCRIBERS */}
        {activeTab === "subscribers" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subscribers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 col-span-full">No subscribers yet.</p>
            ) : (
              subscribers?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => navigate(`/c/${t?.username}`)}
                  className="flex flex-col items-center text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md dark:hover:border-gray-700 transition"
                >
                  <img src={t.avatar} alt={t.username} className="w-16 h-16 rounded-full object-cover mb-3 bg-gray-100 dark:bg-gray-800" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 w-full">{t.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 w-full">@{t.username}</p>
                </button>
              ))
            )}
          </div>
        )}

        {/* SUBSCRIBED TO */}
        {activeTab === "subscribedTo" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subscriberedChannels.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 col-span-full">Not subscribed to any channels.</p>
            ) : (
              subscriberedChannels?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => navigate(`/c/${t?.username}`)}
                  className="flex flex-col items-center text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md dark:hover:border-gray-700 transition"
                >
                  <img src={t.avatar} alt={t.username} className="w-16 h-16 rounded-full object-cover mb-3 bg-gray-100 dark:bg-gray-800" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 w-full">{t.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 w-full">@{t.username}</p>
                </button>
              ))
            )}
          </div>
        )}

        {/* WATCH HISTORY */}
        {activeTab === "watchHistory" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
             <History />
          </div>
        )}

      </div>
    </div>
  );
}

export default Channel;