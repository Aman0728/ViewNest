import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "./Axios/axios";
import { useSelector } from "react-redux";
import { Lock } from "lucide-react";

function Video() {
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const { videoId } = useParams();
  const navigate = useNavigate();
  const commentRef = useRef(null);
  const user = useSelector((state) => state.auth.userData);
  const [liked, setLiked] = useState(false);

  // --- NEW STATE: Controls the description expansion ---
  const [showFullDescription, setShowFullDescription] = useState(false);

  const [searchParams] = useSearchParams();
  const playlistId = searchParams?.get("playlist");
  const videoNumber = searchParams?.get("v");
  const [playlist, setPlaylist] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);

  const [isSubscribed, setIsSubscribed] = useState(null);

  const [comments, setComments] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const likeTimeoutRef = useRef({});
  const videoLikeTimeout = useRef(null);

  const toggleSubscribeStatus = async () => {
    const { data } = await api.post(`subscriptions/c/${channelInfo._id}`);
    if (isSubscribed) channelInfo.subscribersCount--;
    else channelInfo.subscribersCount++;
    setIsSubscribed(data.data);
  };

  const loadComments = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/comments/v/${videoId}${cursor ? `?lastCreatedAt=${cursor}` : ""}`,
      );
      const newComments = res.data.data.comments;
      setComments((prev) => {
        const existingIds = new Set(prev.map((c) => c._id));
        const filtered = newComments.filter((c) => !existingIds.has(c._id));
        return [...prev, ...filtered];
      });
      setCursor(res.data.data.nextCursor);
      if (!res.data.data.nextCursor || newComments.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading comments", err);
    } finally {
      setLoading(false);
    }
  }, [videoId, cursor, loading, hasMore]);

  const observer = useRef(null);

  const lastCommentRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadComments();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadComments],
  );

  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

  // INIT LOAD FOR NEW VIDEO
  useEffect(() => {
    let isActive = true;
    const initLoad = async () => {
      setComments([]);
      setCursor(null);
      setHasMore(true);
      setShowFullDescription(false); // Reset description state when video changes

      const res = await api.get(`/comments/v/${videoId}`);
      if (!isActive) return;
      setComments(res.data.data.comments);
      setCursor(res.data.data.nextCursor);
    };
    window.scrollTo({ top: 0, behavior: "smooth" });
    initLoad();
    return () => {
      isActive = false;
      observer.current?.disconnect();
    };
  }, [videoId]);

  // FETCH VIDEO DATA
  useEffect(() => {
    const fetchVideoAndChannel = async () => {
      const { data } = await api.get(`/videos/${videoId}`);
      const videoData = data.data;
      await api.post(`videos/views/${videoId}`);
      setVideo(videoData);
      setLiked(videoData.isLiked);
      
      const owner = videoData.owner;
      const channelRes = await api.get(`/users/${owner}`);
      const channelData = channelRes.data.data;
      setChannelInfo(channelData);
      setIsSubscribed(channelData.isSubscribed);
      
      const randomVideos = await api.get("/videos/random/r");
      setVideos(randomVideos.data.data);
      
      if (playlistId) {
        const { data } = await api.get(`/playlists/${playlistId}`);
        setPlaylist(data.data);
        setCurrentVideo(data.data[videoNumber]);
      }
    };
    if (videoId) {
      fetchVideoAndChannel();
    }
  }, [videoId, playlistId, videoNumber]);

  const addComment = async () => {
    const commentText = commentRef.current.value;
    commentRef.current.value = "";
    if (commentText.trim() !== "") {
      try {
        const commentadded = await api.post(`/comments/${videoId}`, {
          content: commentText,
        });
        setComments((prev) => [commentadded.data.data, ...prev]);
      } catch (error) {
        alert("Unable to post comment");
      }
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`comments/c/${commentId}`);
      setComments((prev) => prev.filter((e) => e._id !== commentId));
    } catch (error) {
      alert("Unable to delete comment");
    }
  };

  const toggleCommentLike = (commentId) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? {
              ...c,
              totalLike: c.isLiked ? c.totalLike - 1 : c.totalLike + 1,
              isLiked: !c.isLiked,
            }
          : c,
      ),
    );
    if (likeTimeoutRef.current[commentId]) {
      clearTimeout(likeTimeoutRef.current[commentId]);
    }
    likeTimeoutRef.current[commentId] = setTimeout(async () => {
      try {
        await api.post(`/likes/toggle/c/${commentId}`);
      } catch (err) {
        console.error(err);
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  isLiked: !c.isLiked,
                  totalLike: !c.isLiked ? c.totalLike - 1 : c.totalLike + 1,
                }
              : c,
          ),
        );
      }
    }, 400);
  };

  const toggleVideoLike = () => {
    setVideo((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      totalLikeCount: prev.isLiked
        ? prev.totalLikeCount - 1
        : prev.totalLikeCount + 1,
    }));
    setLiked((prev) => !prev);
    clearTimeout(videoLikeTimeout.current);
    videoLikeTimeout.current = setTimeout(async () => {
      try {
        await api.post(`/likes/toggle/v/${videoId}`);
      } catch (err) {
        console.error(err);
      }
    }, 400);
  };

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Login to access this content and interact with the creator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 transition-colors duration-300 dark:bg-gray-950 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* === LEFT SIDE (Player & Details) === */}
        <div className="flex-1 min-w-0">
          
          {/* VIDEO PLAYER */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
            <video
              src={video?.videoFile}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          {/* TITLE */}
          <h1 className="text-xl sm:text-2xl font-bold mt-4 text-gray-900 dark:text-gray-100">
            {video?.title}
          </h1>

          {/* CHANNEL INFO & ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            
            {/* Channel info block */}
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-3 hover:opacity-80 transition"
                onClick={() => navigate(`/c/${channelInfo?.username}`)}
              >
                <img
                  src={channelInfo?.avatar}
                  alt={channelInfo?.fullName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-800"
                />
                <div className="text-left">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    {channelInfo?.fullName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {channelInfo?.subscribersCount} subscribers
                  </p>
                </div>
              </button>

              {/* Subscribe button */}
              {user?._id !== channelInfo?._id && (
                <button
                  onClick={toggleSubscribeStatus}
                  className={`ml-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                    isSubscribed
                      ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700"
                      : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  }`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>

            {/* Like button */}
            <button
              onClick={toggleVideoLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                liked
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
              }`}
            >
              <span className="text-lg">👍</span> {video?.totalLikeCount}
            </button>
          </div>

          {/* === EXPANDABLE DESCRIPTION BOX === */}
          <div className="mt-4 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-4 text-sm transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-800">
            {/* Meta Line (Views & Date) */}
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {video?.views?.toLocaleString()} views  •  {new Date(video?.createdAt).toLocaleDateString()}
            </div>
            
            {/* Description Text */}
            <div className={`whitespace-pre-wrap text-gray-800 dark:text-gray-300 ${!showFullDescription ? "line-clamp-2" : ""}`}>
              {video?.description || "No description provided."}
            </div>

            {/* Toggle Button */}
            {video?.description && (
              <button 
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-gray-600 dark:text-gray-400 font-semibold hover:text-gray-900 dark:hover:text-gray-100 transition"
              >
                {showFullDescription ? "Show less" : "...more"}
              </button>
            )}
          </div>

          {/* === COMMENTS SECTION === */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">
              {comments.length} Comments
            </h3>

            {/* COMMENT INPUT */}
            <div className="flex gap-4 mb-8">
              <img
                src={user?.avatar}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-200 dark:bg-gray-800"
              />
              <div className="flex-1">
                <textarea
                  ref={commentRef}
                  placeholder="Add a comment..."
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none resize-none text-sm pb-2 text-gray-900 dark:text-gray-100 focus:border-black dark:focus:border-white transition-colors"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button 
                    className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => { commentRef.current.value = ""; }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addComment}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>

            {/* COMMENT LIST */}
            <div className="space-y-6">
              {comments?.map((c, i) => {
                const isLast = i === comments.length - 1;
                return (
                  <div key={c._id} ref={isLast ? lastCommentRef : null} className="flex gap-4 group">
                    <button onClick={() => navigate(`/c/${c.owner.username}`)} className="shrink-0">
                      <img
                        src={c?.owner?.avatar || user.avatar}
                        alt={c.owner.fullName}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-800"
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          @{c.owner.username}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{c.content}</p>

                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => toggleCommentLike(c._id)}
                          className={`flex items-center gap-1.5 text-xs font-medium transition ${
                            c.isLiked
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          }`}
                        >
                          <span className="text-base">👍</span> {c.totalLike || 0}
                        </button>
                        
                        {String(c.owner._id) === String(user?._id) && (
                          <button
                            onClick={() => deleteComment(c._id)}
                            className="text-xs font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {loading && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Loading more comments...
              </p>
            )}
          </div>
        </div>

        {/* === RIGHT SIDEBAR === */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6">
          
          {/* PLAYLIST BLOCK */}
          {playlistId && playlist && (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{playlist.title}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{playlist.description}</p>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                {playlist?.videos?.map((pv, i) => (
                  <button
                    key={pv._id}
                    onClick={() => navigate(`/video/${pv._id}?playlist=${playlistId}&v=${i}`)}
                    className={`w-full flex gap-3 p-2 rounded-lg text-left transition ${
                      String(pv._id) === String(videoId)
                        ? "bg-gray-200 dark:bg-gray-800"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-4 text-center self-center">{i + 1}</span>
                    <img src={pv.thumbnail} alt="" className="w-24 aspect-video rounded object-cover bg-gray-300 dark:bg-gray-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{pv.title}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RECOMMENDED VIDEOS */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">Up next</h3>
            {videos?.map((v) => (
              <button
                key={v._id}
                onClick={() => navigate(`/video/${v._id}`)}
                className="w-full text-left flex gap-3 group"
              >
                <div className="w-40 aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 relative">
                  <img
                    src={v.thumbnail}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {v.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{v.views} views</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Video;