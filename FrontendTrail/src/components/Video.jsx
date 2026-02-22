import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "./Axios/axios";
import { useSelector } from "react-redux";
import { useCallback } from "react";

function Video() {
  const [video, setVideo] = useState(null);
  const [videos, setVideos] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const { videoId } = useParams();
  const navigate = useNavigate();
  const commentRef = useRef(null);
  const [isComment, setIsComment] = useState(false);
  const user = useSelector((state) => state.auth.userData);
  const [liked, setLiked] = useState(false);
  const [videoLikes, setVideoLikes] = useState(video?.likes || 0);
  const [commentLikes, setCommentLikes] = useState({});

  const [searchParams] = useSearchParams();
  const playlistId = searchParams?.get("playlist");
  const videoNumber = searchParams?.get("v")
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
    console.log(channelInfo);
  };

  const loadComments = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await api.get(
        `/comments/${videoId}${cursor ? `?lastCreatedAt=${cursor}` : ""}`,
      );
      const newComments = res.data.data.comments;
      console.log(newComments);
      setComments((prev) => {
        const existingIds = new Set(prev.map((c) => c._id));

        const filtered = newComments.filter((c) => !existingIds.has(c._id));

        return [...prev, ...filtered];
      });
      setCursor(res.data.data.nextCursor);

      // stop when no more comments
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

  useEffect(() => {
    let isActive = true;

    const initLoad = async () => {
      setComments([]);
      setCursor(null);
      setHasMore(true);

      const res = await api.get(`/comments/${videoId}`);
      console.log(res.data.data);
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
  useEffect(() => {
    const fetchVideoAndChannel = async () => {
      const { data } = await api.get(`/videos/${videoId}`);
      const videoData = data.data;
      videoData.views++;
      await api.post(`videos/views/${videoId}`);
      setVideo(videoData);
      console.log(videoData);
      setLiked(videoData.isLiked);
      const owner = videoData.owner;
      const channelRes = await api.get(`/users/${owner}`);
      const channelData = channelRes.data.data;
      setChannelInfo(channelData);
      setIsSubscribed(channelData.isSubscribed);
      const randomVideos = await api.get("/videos/random/r");
      const newVideos = randomVideos.data.data;
      setVideos(newVideos);
      if (playlistId) {
        const { data } = await api.get(`/playlists/${playlistId}`);
        setPlaylist(data.data);
        setCurrentVideo(data.data[videoNumber]);
        console.log(data)
      }
    };

    if (videoId) {
      fetchVideoAndChannel();
    }
  }, [videoId,playlistId,videoNumber]);

  const addComment = async () => {
    const commentText = commentRef.current.value;
    if (commentText.trim() === "") setIsComment(false);
    else setIsComment(true);
    if (isComment) {
      const commentadded = await api.post(`/comments/${videoId}`, {
        content: commentText,
      });
      commentRef.current.value = "";
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

    // clear previous timer for this comment
    if (likeTimeoutRef.current[commentId]) {
      clearTimeout(likeTimeoutRef.current[commentId]);
    }

    // debounce API call
    likeTimeoutRef.current[commentId] = setTimeout(async () => {
      try {
        await api.post(`/likes/toggle/c/${commentId}`);
      } catch (err) {
        console.error(err);

        // rollback if failed
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
    }, 400); // 400ms debounce
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

  return user ? (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDE */}
        <div className="flex-1">
          {/* VIDEO PLAYER */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
            <video
              src={video?.videoFile}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          {/* TITLE */}
          <h1 className="text-xl font-semibold mt-4">{video?.title}</h1>

          {/* VIEWS + DATE */}
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <span>{video?.views} views</span>
            <span>{new Date(video?.createdAt).toLocaleDateString()}</span>
          </div>

          {/* VIDEO LIKE BUTTON */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={toggleVideoLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                liked
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              👍 {video?.totalLikeCount}
            </button>
          </div>

          {/* CHANNEL INFO */}
          <div className="flex items-center justify-between mt-6 p-4 border rounded-xl">
            <button
              className=" hover:cursor-pointer"
              onClick={() => navigate(`/c/${channelInfo?.username}`)}
            >
              <div className="flex items-center gap-4">
                <img
                  src={channelInfo?.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold">{channelInfo?.fullName}</h2>
                  <p className="text-sm text-gray-500">
                    {channelInfo?.subscribersCount} subscribers
                  </p>
                </div>
              </div>
            </button>
            {user?._id !== channelInfo?._id ?
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
          : ""}
          </div>

          {/* COMMENTS */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Comments</h3>

            {/* COMMENT INPUT */}
            <div className="flex gap-3 mb-6">
              <img
                src={user?.avatar}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />

              <div className="flex-1">
                <textarea
                  ref={commentRef}
                  placeholder="Add a comment..."
                  className="w-full border-b outline-none resize-none text-sm pb-2"
                  rows={2}
                />

                <div className="flex justify-end gap-2 mt-2">
                  <button className="px-4 py-1 text-sm text-gray-600 hover:text-black">
                    Cancel
                  </button>

                  <button
                    onClick={addComment}
                    className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700 transition"
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
                  <div
                    key={c._id}
                    ref={isLast ? lastCommentRef : null}
                    className="flex gap-3"
                  >
                    {/* AVATAR */}
                    <button
                      onClick={() => navigate(`/c/${c.owner.username}`)}
                      className="hover:cursor-pointer"
                    >
                      <img
                        src={c.owner.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    </button>

                    <div className="flex-1">
                      {/* HEADER */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">
                            {c.owner.fullName}
                          </span>

                          <span className="text-gray-500 text-xs">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* DELETE BUTTON (ONLY OWNER) */}
                        {String(c.owner._id) === String(user?._id) && (
                          <button
                            // onClick={() => deleteComment(c._id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      {/* COMMENT TEXT */}
                      <p className="text-sm mt-1">{c.content}</p>

                      {/* LIKE BUTTON */}
                      <button
                        onClick={() => toggleCommentLike(c._id)}
                        className={`text-xs mt-2 flex items-center gap-1 transition ${
                          c.isLiked
                            ? "text-blue-600"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        👍 {c.totalLike || 0}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LOADING INDICATOR */}
            {loading && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Loading more comments...
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
        {playlistId && (
          <div className="w-full lg:w-96 flex flex-col gap-4">
            <div className="max-w-6xl mx-auto p-4">
              <h1 className="text-2xl font-bold">{playlist.title}</h1>
              <p className="text-gray-600 mb-4">{playlist.description}</p>

              {/* Main Video */}
              {/* {currentVideo && (
                <video
                  src={currentVideo.videoFile}
                  controls
                  className="w-full rounded-lg mb-6"
                />
              )} */}

              {/* Video List */}
              <div className="space-y-3">
                {playlist?.videos?.map((video, i) => (
                  <div
                    key={video._id}
                    onClick={() => navigate(`/video/${video._id}?playlist=${playlistId}&v=${i}`)}
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
          </div>
        )}

        <div className="w-full lg:w-96 flex flex-col gap-4">
          {videos?.map((v) => (
            <button
              key={v._id}
              onClick={() => navigate(`/video/${v._id}`)}
              className="w-full text-left"
            >
              <div className="flex gap-3 hover:bg-gray-100 p-2 rounded-lg transition">
                <div className="w-40 aspect-video bg-black rounded-lg overflow-hidden shrink-0">
                  <img
                    src={v.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <h3 className="text-sm font-semibold line-clamp-2">
                    {v.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{v.views} views</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        </div>
      </div>
    </div>
  ) : (
    <div className=" flex w-full justify-center mt-20">
      <h1 className=" text-red-600 text-6xl">Login to access the content</h1>
    </div>
  );
}

export default Video;
