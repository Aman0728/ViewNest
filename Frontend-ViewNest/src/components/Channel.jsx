import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { api } from "./Axios/axios";
import { useSelector, useDispatch } from "react-redux"; // Added useDispatch if you need to update auth state
import LogoutBtn from "./Header/LogoutBtn";
import { History } from "./index";
import {
  MoreVertical,
  Trash2,
  Pencil,
  Settings,
  KeyRound,
  Image as ImageIcon,
  MonitorUp,
  X,
  UploadCloud,
  User as UserIcon,
  Plus,
  Video,
  MessageSquare,
  List,
  Globe,
  Lock
} from "lucide-react";

function Channel() {
  const navigate = useNavigate();
  const { username } = useParams();

  const userdata = useSelector((state) => state.auth.userData);

  const [activeTab, setActiveTab] = useState("videos");
  const [videos, setVideos] = useState([]);
  const [channelInfo, setChannelInfo] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playlistImage, setPlaylistImage] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberedChannels, setSubscribedChannels] = useState([]);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // --- MODAL STATES ---
  const [activeModal, setActiveModal] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // File States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [open, setOpen] = useState(false);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const closeModal = () => {
    setActiveModal(null);
    setOldPassword("");
    setNewPassword("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setUpdateError("");
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
    console.log(data.data);
    setPlaylist(data.data.getPlaylist || []);
    setPlaylistImage(data.data.image || null);
  };

  const toggleSubscribeStatus = async () => {
    const { data } = await api.post(`subscriptions/c/${channelInfo?._id}`);
    setChannelInfo((prev) => ({
      ...prev,
      subscribersCount: isSubscribed
        ? prev.subscribersCount - 1
        : prev.subscribersCount + 1,
    }));
    setIsSubscribed(data.data);
  };

  const handleTogglePublish = async (videoId, currentStatus) => {
    try {
      await api.patch(`/videos/toggle/publish/${videoId}`);
      setVideos((prev) =>
        prev.map((video) =>
          video._id === videoId
            ? { ...video, isPublished: !currentStatus }
            : video,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
    }
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
    setVideos((prev) => prev.filter((e) => e._id !== vId));
    try {
      await api.delete(`/videos/${vId}`);
      setOpenMenuId(null);
    } catch (error) {
      alert(error.message);
      setVideos(temp);
    }
  };

  const handleDeletePlaylist = async (pId) => {
    const temp = playlist;
    setPlaylist((prev) => prev.filter((e) => e._id !== pId));
    try {
      await api.delete(`/playlists/${pId}`);
    } catch (error) {
      alert(error.message);
      setPlaylist(temp);
    }
  };

  // --- UPDATE HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setUpdateError("");
    if (!oldPassword || !newPassword)
      return setUpdateError("Please fill all fields");

    try {
      setUpdateLoading(true);
      await api.post("/users/update-password", { oldPassword, newPassword });
      alert("Password updated successfully!");
      closeModal();
    } catch (err) {
      setUpdateError(
        err?.response?.data?.message || "Failed to update password",
      );
    } finally {
      setUpdateLoading(false);
    }
  };
  const updateFullName = async (e) => {
    e.preventDefault();
    setUpdateError("");
    if (!fullName.trim()) return setUpdateError("Please fill all fields");

    try {
      setUpdateLoading(true);
      const { data } = await api.patch("/users/full-Name", { fullName });
      alert("Full Name updated successfully!");
      setChannelInfo((prev) => ({ ...prev, fullName: data.data.fullName }));
      closeModal();
    } catch (err) {
      setUpdateError(
        err?.response?.data?.message || "Failed to update full name",
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const updateAvatar = async (e) => {
    e.preventDefault();
    setUpdateError("");
    if (!selectedFile) return setUpdateError("Please select an image first");

    try {
      setUpdateLoading(true);
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const { data } = await api.patch("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update UI immediately
      setChannelInfo((prev) => ({ ...prev, avatar: data.data.avatar }));
      closeModal();
    } catch (err) {
      setUpdateError(err?.response?.data?.message || "Failed to update avatar");
    } finally {
      setUpdateLoading(false);
    }
  };

  const updateCover = async (e) => {
    e.preventDefault();
    setUpdateError("");
    if (!selectedFile) return setUpdateError("Please select an image first");

    try {
      setUpdateLoading(true);
      const formData = new FormData();
      formData.append("coverImage", selectedFile);

      const { data } = await api.patch("/users/coverImage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update UI immediately
      setChannelInfo((prev) => ({ ...prev, coverImage: data.data.coverImage }));
      closeModal();
    } catch (err) {
      setUpdateError(
        err?.response?.data?.message || "Failed to update cover image",
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 relative">
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
          {userdata?._id?.toString() !== channelInfo?._id?.toString() ? (
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

              <div className="relative sm:hidden block">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  <Plus size={18} />
                  <span>Create</span>
                </button>

                {/* DROPDOWN */}
                {open && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpen(false)}
                    ></div>
                    <div className="absolute sm:right-0 left-10 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <NavLink
                        to="/video/v/publish"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Video size={16} className="text-indigo-500" /> Video
                      </NavLink>
                      <NavLink
                        to="/tweet/t/publish"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MessageSquare size={16} className="text-indigo-500" />{" "}
                        Tweet
                      </NavLink>
                      <NavLink
                        to="/playlist/p/publish"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <List size={16} className="text-indigo-500" /> Playlist
                      </NavLink>
                    </div>
                  </>
                )}
              </div>

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
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setSettingsOpen(false)}
                    ></div>

                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          setActiveModal("fullName");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <UserIcon size={16} className="text-gray-400" />
                        Update Full Name
                      </button>
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          setActiveModal("password");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <KeyRound size={16} className="text-gray-400" />
                        Update Password
                      </button>
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          setActiveModal("avatar");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <ImageIcon size={16} className="text-gray-400" />
                        Update Avatar
                      </button>
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          setActiveModal("cover");
                        }}
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
            {
              id: "videos",
              label: "Videos",
              action: () => setActiveTab("videos"),
            },
            { id: "tweets", label: "Tweets", action: getTweets },
            {
              id: "playlists",
              label: "Playlists",
              action: () => {
                setActiveTab("playlists");
                getChannelPlaylist();
              },
            },
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
          {userdata?._id?.toString() === channelInfo?._id?.toString() &&
            [
              {
                id: "subscribers",
                label: "Subscribers",
                action: () => {
                  setActiveTab("subscribers");
                  getSubscribers();
                },
              },
              {
                id: "subscribedTo",
                label: "Subscribed To",
                action: () => {
                  setActiveTab("subscribedTo");
                  getSubscribedChannels();
                },
              },
              {
                id: "watchHistory",
                label: "History",
                action: () => setActiveTab("watchHistory"),
              },
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

      <div className="px-4 sm:px-6 py-6 md:py-8 bg-gray-50 dark:bg-gray-950 min-h-[40vh] transition-colors">
        {activeTab === "videos" && (
          <div className="flex flex-col gap-4 sm:gap-6 ">
            {videos.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No videos yet.</p>
            ) : (
              videos?.map((v) => (
                <div
                  key={v._id}
                  className="relative group flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 sm:p-4 hover:shadow-md dark:hover:border-gray-700 transition md:max-h-44"
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
                        {/* <span>•</span> */}
                        <span>
                          {new Date(v?.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Description Snippet (Hidden on very small screens, visible on md+) */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 hidden md:block ">
                        {v.description.slice(0, 250) || "No description available."}
                      </p>
                    </button>

                    {/* TOGGLE PUBLISH BUTTON (Only visible to channel owner) */}
                    {userdata?._id === channelInfo?._id && (
                      <div className="mt-3 sm:mt-auto pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Call your toggle function here
                            handleTogglePublish(v._id, v.isPublished);
                          }}
                          className={`flex items-center w-max gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 ${
                            v.isPublished
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 focus:ring-green-500"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 focus:ring-amber-500"
                          }`}
                        >
                          {v.isPublished ? (
                            <>
                              <Globe size={14} /> Published
                            </>
                          ) : (
                            <>
                              <Lock size={14} /> Private
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* THREE DOT BUTTON  */}
                  {userdata?._id === channelInfo?._id && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(v._id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition focus:outline-none"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {openMenuId === v._id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setOpenMenuId(null)}
                          ></div>

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
                <div
                  key={t._id}
                  onClick={() => navigate(`/tweet/${t._id}`)}
                  className="relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md dark:hover:border-gray-700 transition group cursor-pointer h-full"
                >
                  {/* TWEET CONTENT */}

                  <div className="flex flex-col flex-grow min-w-0 pr-8">
                    <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 line-clamp-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-relaxed whitespace-pre-wrap">
                      {t.content}
                    </p>
                  </div>

                  {/* TWEET META (Date & Images Count) */}

                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/60">
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>

                    {/* Only show image count if there are images */}

                    {t.imageCount > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>

                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-medium">
                          <ImageIcon size={14} />

                          <span>
                            {t.imageCount}{" "}
                            {t.imageCount === 1 ? "image" : "images"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* THREE DOT BUTTON (Matching Video style) */}

                  {userdata?._id === channelInfo?._id && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents navigating to tweet

                          toggleMenu(t._id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition focus:outline-none"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {openMenuId === t._id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                          ></div>

                          <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-lg text-sm z-40 overflow-hidden w-36">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tweet/update/${t._id}`);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left text-gray-700 dark:text-gray-200"
                            >
                              <Pencil size={14} /> Update
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(t._id);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left text-red-600 dark:text-red-400 border-t border-gray-100 dark:border-gray-700"
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

        {/* PLAYLISTS */}

        {activeTab === "playlists" && (
          <div className="flex flex-col gap-4 sm:gap-6">
            {playlist.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No playlists yet.
              </p>
            ) : (
              playlist?.map((p) => (
                <div
                  key={p._id}
                  className="relative group flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 sm:p-4 hover:shadow-md dark:hover:border-gray-700 transition"
                >
                  {/* THUMBNAIL WITH PLAYLIST OVERLAY */}
                  <button
                    onClick={() =>
                      navigate(`/video/${p.videos[0]}?playlist=${p._id}&v=0`)
                    }
                    className="w-full sm:w-56 md:w-72 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 relative focus:outline-none"
                  >
                    <img
                      src={p.thumbnail || playlistImage}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Playlist Video Count Overlay */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1 transition-colors">
                      <span className="text-white text-sm font-semibold">
                        {p.videos?.length || 0}
                      </span>
                      <span className="text-gray-300 text-[10px] uppercase tracking-wider font-medium">
                        Videos
                      </span>
                    </div>
                  </button>

                  {/* PLAYLIST DETAILS */}
                  <div className="flex flex-col flex-grow min-w-0 pr-10">
                    <button
                      onClick={() =>
                        navigate(`/video/${p.videos[0]}?playlist=${p._id}&v=0`)
                      }
                      className="text-left focus:outline-none"
                    >
                      <h3 className="text-lg font-semibold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {p.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          View full playlist
                        </span>

                        {p.createdAt && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(p.createdAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Description Snippet (Hidden on very small screens, visible on md+) */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 hidden md:block">
                        {p.description ||
                          "No description available for this playlist."}
                      </p>
                    </button>
                  </div>

                  {/* THREE DOT BUTTON (For Channel Owner) */}
                  {userdata?._id === channelInfo?._id && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(p._id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition focus:outline-none"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {openMenuId === p._id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setOpenMenuId(null)}
                          ></div>

                          <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-lg text-sm z-40 overflow-hidden w-36">
                            <button
                              onClick={() =>
                                navigate(`/playlist/update/${p._id}`)
                              } // Adjust your update route
                              className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-gray-700 dark:text-gray-200"
                            >
                              <Pencil size={14} /> Update
                            </button>

                            <button
                              onClick={() => handleDeletePlaylist(p._id)} // Create a specific delete handler for playlists
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

        {/* SUBSCRIBERS */}

        {activeTab === "subscribers" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subscribers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 col-span-full">
                No subscribers yet.
              </p>
            ) : (
              subscribers?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => navigate(`/c/${t?.username}`)}
                  className="flex flex-col items-center text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md dark:hover:border-gray-700 transition"
                >
                  <img
                    src={t.avatar}
                    alt={t.username}
                    className="w-16 h-16 rounded-full object-cover mb-3 bg-gray-100 dark:bg-gray-800"
                  />

                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 w-full">
                    {t.fullName}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 w-full">
                    @{t.username}
                  </p>
                </button>
              ))
            )}
          </div>
        )}

        {/* SUBSCRIBED TO */}

        {activeTab === "subscribedTo" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subscriberedChannels.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 col-span-full">
                Not subscribed to any channels.
              </p>
            ) : (
              subscriberedChannels?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => navigate(`/c/${t?.username}`)}
                  className="flex flex-col items-center text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md dark:hover:border-gray-700 transition"
                >
                  <img
                    src={t.avatar}
                    alt={t.username}
                    className="w-16 h-16 rounded-full object-cover mb-3 bg-gray-100 dark:bg-gray-800"
                  />

                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 w-full">
                    {t.fullName}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 w-full">
                    @{t.username}
                  </p>
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

      {/* ================= MODALS ================= */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {activeModal === "password" && "Update Password"}
                {activeModal === "avatar" && "Update Avatar"}
                {activeModal === "cover" && "Update Cover Image"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {updateError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-500/20">
                {updateError}
              </div>
            )}

            {activeModal === "fullName" && (
              <form onSubmit={updateFullName} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-gray-900 dark:text-white"
                    placeholder="Enter your new full name"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateLoading || !fullName.trim()}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70 flex justify-center items-center"
                >
                  {updateLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Save Changes"
                  )}
                          // Assuming you use the same state for menu tracking.
                          // If IDs clash, you might want to use `setOpenMenuId('playlist-' + p._id)`
                </button>
              </form>
            )}

            {/* Modal Body: Password */}
            {activeModal === "password" && (
              <form onSubmit={updatePassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Old Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-gray-900 dark:text-white"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-gray-900 dark:text-white"
                    placeholder="Enter new password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70 flex justify-center items-center"
                >
                  {updateLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </form>
            )}

            {/* Modal Body: Avatar */}
            {activeModal === "avatar" && (
              <form onSubmit={updateAvatar} className="p-6 space-y-6">
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-gray-50 dark:border-gray-700 flex items-center justify-center shadow-inner">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={40} className="text-gray-400" />
                    )}
                  </div>
                </div>

                <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <UploadCloud
                    size={28}
                    className="text-gray-400 group-hover:text-indigo-500 transition-colors mb-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to select new avatar
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </label>

                <button
                  type="submit"
                  disabled={updateLoading || !selectedFile}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70 flex justify-center items-center"
                >
                  {updateLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Upload Avatar"
                  )}
                </button>
              </form>
            )}

            {/* Modal Body: Cover Image */}
            {activeModal === "cover" && (
              <form onSubmit={updateCover} className="p-6 space-y-6">
                <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={40} className="text-gray-400" />
                  )}
                </div>

                <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <UploadCloud
                    size={28}
                    className="text-gray-400 group-hover:text-indigo-500 transition-colors mb-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to select new cover
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </label>

                <button
                  type="submit"
                  disabled={updateLoading || !selectedFile}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70 flex justify-center items-center"
                >
                  {updateLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Upload Cover Image"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Channel;
