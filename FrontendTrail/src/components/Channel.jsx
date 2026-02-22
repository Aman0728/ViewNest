import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "./Axios/axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutBtn from "./Header/LogoutBtn";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import {History} from "./index";

function Channel() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [videos, setVideos] = useState([]);
  const [channelInfo, setChannelInfo] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const userdata = useSelector((state) => state.auth.userData);

  const [subscribers, setSubscribers] = useState([]);
  const [subscriberedChannels, setSubscribedChannels] = useState([]);

  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getSubscribers = async () => {
    const { data } = await api.get(`subscriptions/u/${channelInfo?._id}`);
    const subs = data.data;
    setSubscribers(subs);
  };
  const getSubscribedChannels = async () => {
    const { data } = await api.get(`subscriptions/c/${channelInfo?._id}`);
    console.log(channelInfo?._id);
    const subs = data.data;
    setSubscribedChannels(subs);
  };

  const getChannelPlaylist = async () => {
    const { data } = await api.get(`/playlists/user/${channelInfo._id}`);
    console.log(data.data);
    setPlaylist(data.data);
  };

  const toggleSubscribeStatus = async () => {
    const { data } = await api.post(`subscriptions/c/${channelInfo?._id}`);
    if (isSubscribed) channelInfo.subscribersCount--;
    else channelInfo.subscribersCount++;
    setIsSubscribed(data.data);
    console.log(channelInfo);
  };

  useEffect(() => {
    const getChannelInfo = async () => {
      const { data } = await api.get(`/users/c/${username}`);
      const channelRes = data.data;
      console.log(channelRes);
      setChannelInfo(channelRes);
      setIsSubscribed(channelRes.isSubscribed);
      const channelVideos = await api.get(`videos/c/${data.data._id}`);
      console.log(channelVideos.data);
      setVideos(channelVideos.data.data);
    };
    getChannelInfo();
    setActiveTab("videos");
  }, [username]);
  const [activeTab, setActiveTab] = useState("videos");
  const getTweets = async () => {
    const { data } = await api.get(`/tweets/user/${channelInfo._id}`);
    setTweets(data.data);
    // console.log(data.data)
    setActiveTab("tweets");
  };

  const handleDelete = async(vId) => {
    const temp = videos
    setVideos(prev => (prev.filter(e => e._id !== vId)))
    try {
      const deleted = await api.delete(`/videos/${vId}`)
      console.log(deleted)
    } catch (error) {
      alert(error.message)
      setVideos(temp)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* COVER IMAGE */}
      <div className="w-full h-48 md:h-64 lg:h-72 relative">
        <img
          src={channelInfo?.coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* CHANNEL HEADER */}
      <div className="px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-10">
        <div className="flex items-center gap-6">
          <img
            src={channelInfo?.avatar}
            alt=""
            className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-md -mt-10 md:-mt-14"
          />

          <div>
            <h1 className="text-2xl font-bold">{channelInfo?.fullName}</h1>
            <p className="text-gray-500">@{channelInfo?.username}</p>
            <p className="text-sm text-gray-500 mt-1">
              {channelInfo?.subscribersCount} subscribers
            </p>
          </div>
        </div>
        {userdata?._id.toString() !== channelInfo?._id.toString() ? (
          isSubscribed ? (
            <button
              onClick={toggleSubscribeStatus}
              className=" bg-gray-950 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
            >
              Subscribed
            </button>
          ) : (
            <button
              onClick={toggleSubscribeStatus}
              className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
            >
              Subscribe
            </button>
          )
        ) : (
          <LogoutBtn />
        )}
      </div>

      {/* TABS */}
      <div className="border-b px-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("videos")}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "videos"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Videos
          </button>

          <button
            onClick={getTweets}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "tweets"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Tweets
          </button>

          <button
            onClick={() => {
              setActiveTab("playlists");
              getChannelPlaylist();
            }}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "playlists"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Playlists
          </button>
          {userdata?._id.toString() === channelInfo?._id.toString() ? (
            <>
              <button
                onClick={() => {
                  setActiveTab("subscribers");
                  getSubscribers();
                }}
                className={`py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "subscribers"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                Subscribers
              </button>
              <button
                onClick={() => {
                  setActiveTab("subscribedTo");
                  getSubscribedChannels();
                }}
                className={`py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "subscribedTo"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                Subscribed To
              </button>
              <button
                onClick={() => {
                  setActiveTab("watchHistory");
                }}
                className={`py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "watchHistory"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                History
              </button>
            </>
          ) : (
            ""
          )}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="px-6 py-6">
        {/* VIDEOS */}
        {activeTab === "videos" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {videos.length === 0 ? (
              <div>
                <p className="">No videos yet</p>
              </div>
            ) : (
              videos?.map((v) => (
                <div key={v._id} className="relative group">
                  {/* THREE DOT BUTTON */}
                  {userdata?._id === channelInfo?._id &&
                  <button
                    onClick={() => toggleMenu(v._id)}
                    className="absolute top-2 right-2 z-20 bg-black/70 text-white p-1 rounded-full"
                  >
                    <MoreVertical size={18} />
                  </button>
                  }
                  {openMenuId === v._id && (
                    <div className="absolute right-2 top-10 bg-white shadow-lg rounded-md text-sm z-30 overflow-hidden">
                      <button
                        onClick={() => navigate(`/video/update/${v._id}`)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                      >
                        <Pencil size={14} /> Update
                      </button>
                      <button
                        onClick={() => handleDelete(v._id)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-red-600"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}

                  {/* VIDEO CARD */}
                  <button
                    onClick={() => navigate(`/video/${v._id}`)}
                    className="text-left"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <img
                        src={v.thumbnail}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    <h3 className="text-sm font-semibold mt-2 line-clamp-2 group-hover:text-black">
                      {v.title}
                    </h3>

                    <p className="text-xs text-gray-500">{v.views} views</p>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TWEETS */}
        {activeTab === "tweets" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tweets.length > 0 ? (
              tweets?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => navigate(`/tweet/${t._id}`)}
                  className="text-left border rounded-lg p-4 hover:shadow-md transition bg-white"
                >
                  <p className="text-sm line-clamp-4">{t.content}</p>
                </button>
              ))
            ) : (
              <div>
                <p>No tweets yet</p>
              </div>
            )}
          </div>
        )}

        {/* PLAYLISTS */}
        {activeTab === "playlists" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {playlist.length > 0 ? (
              playlist?.map((p) => (
                <button
                  key={p._id}
                  onClick={() =>
                    navigate(`/video/${p.videos[0]._id}?playlist=${p._id}&v=0`)
                  }
                  className="text-left border rounded-lg p-4 hover:shadow-md transition bg-white"
                >
                  <h3 className="font-semibold text-sm">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {p.videoCount} videos
                  </p>
                </button>
              ))
            ) : (
              <div>
                <p>No playlist yet</p>
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIBERS */}
        {activeTab === "subscribers" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subscribers.length > 0 ? (
              subscribers?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => navigate(`/c/${t?.username}`)}
                  className="text-left border rounded-lg p-4 hover:shadow-md transition bg-white"
                >
                  <img src={t.avatar} alt="" />
                </button>
              ))
            ) : (
              <div>
                <p>No subscribers yet</p>
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIBERED TO */}
        {activeTab === "subscribedTo" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subscriberedChannels.length > 0 ? (
              subscriberedChannels?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => navigate(`/c/${t?.username}`)}
                  className="text-left border rounded-lg p-4 hover:shadow-md transition bg-white"
                >
                  <img src={t.avatar} alt="" />
                </button>
              ))
            ) : (
              <div>
                <p>No channels subscribed yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "watchHistory" && <History />}
      </div>
    </div>
  );
}

export default Channel;
