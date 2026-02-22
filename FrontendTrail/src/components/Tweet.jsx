import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "./Axios/axios";
import { useSelector } from "react-redux";

function Tweet() {
  const { tweetId } = useParams();
  const navigate = useNavigate();
  const commentRef = useRef(null);
  const user = useSelector((state) => state.auth.userData);
  const [tweet, setTweet] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  const images = tweet?.images || [];

  const [comments, setComments] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const likeTimeoutRef = useRef({});

  useEffect(() => {
    const fetchTweetAndChannel = async () => {
      try {
        const { data } = await api.get(`/tweets/${tweetId}`);
        setTweet(data.data);
        const owner = data.data.owner;
        const channelRes = await api.get(`/users/${owner}`);
        setChannelInfo(channelRes.data.data);
      } catch (error) {
        console.error("Error fetching tweet:", error);
      }
    };

    if (tweetId) {
      fetchTweetAndChannel();
    }
  }, [tweetId]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const loadComments = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await api.get(
        `/comments/t/${tweetId}${cursor ? `?lastCreatedAt=${cursor}` : ""}`
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
  }, [tweetId, cursor, loading, hasMore]);

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
    [loading, hasMore, loadComments]
  );

  // Observer cleanup
  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

  // Initial comments load
  useEffect(() => {
    let isActive = true;

    const initLoad = async () => {
      setComments([]);
      setCursor(null);
      setHasMore(true);

      try {
        const res = await api.get(`/comments/t/${tweetId}`);
        if (!isActive) return;

        setComments(res.data.data.comments);
        setCursor(res.data.data.nextCursor);
      } catch (error) {
        console.error("Failed to load initial comments", error);
      }
    };
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    initLoad();

    return () => {
      isActive = false;
      observer.current?.disconnect();
    };
  }, [tweetId]);

  const addComment = async () => {
    const commentText = commentRef.current.value;
    commentRef.current.value = "";
    if (commentText.trim() !== "") {
      try {
        const commentadded = await api.post(`/comments/t/${tweetId}`, {
          content: commentText,
        });
        setComments((prev) => [commentadded.data.data, ...prev]);
      } catch (error) {
        alert("Unable to post comment");
      }
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
          : c
      )
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
              : c
          )
        );
      }
    }, 400);
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`comments/c/${commentId}`);
      setComments((prev) => prev.filter((e) => e._id !== commentId));
    } catch (error) {
      alert("Unable to delete comment");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 min-h-screen transition-colors duration-300 bg-gray-200 dark:bg-gray-950">
      
      {/* === TWEET CARD === */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300">
        
        {/* AUTHOR HEADER */}
        <button 
          onClick={() => navigate(`/c/${channelInfo?.username}`)}
          className="flex items-center gap-3 mb-4 group text-left"
        >
          <img
            src={channelInfo?.avatar || "https://via.placeholder.com/150"}
            alt={channelInfo?.username}
            className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-800"
          />
          <div>
            <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {channelInfo?.fullName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{channelInfo?.username}
            </p>
          </div>
        </button>

        {/* TWEET CONTENT */}
        <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">
          {tweet?.content}
        </p>

        {/* IMAGE SLIDER */}
        {images.length > 0 && (
          <div className="relative mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black">
            <div className="w-full h-[300px] sm:h-[400px] flex items-center justify-center relative">
              <img
                src={images[currentImage]}
                alt="Tweet attachment"
                className="max-h-full max-w-full object-contain transition-all duration-300 ease-in-out"
              />
            </div>

            {/* PREV BUTTON */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all"
              >
                ‹
              </button>
            )}

            {/* NEXT BUTTON */}
            {images.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all"
              >
                ›
              </button>
            )}

            {/* IMAGE COUNTER */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                {currentImage + 1} / {images.length}
              </div>
            )}
          </div>
        )}

        {/* TIMESTAMP */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {new Date(tweet?.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      {/* === COMMENTS SECTION === */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">
          {comments.length} Comments
        </h3>

        {/* COMMENT INPUT */}
        <div className="flex gap-4 mb-8">
          <img
            src={user?.avatar || "https://via.placeholder.com/150"}
            alt="Your avatar"
            className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-200 dark:bg-gray-800"
          />
          <div className="flex-1">
            <textarea
              ref={commentRef}
              placeholder="Post your reply..."
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none resize-none text-sm pb-2 text-gray-900 dark:text-gray-100 focus:border-black dark:focus:border-white transition-colors"
              rows={2}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button 
                onClick={() => { commentRef.current.value = ""; }}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={addComment}
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
              >
                Reply
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
                className="flex gap-4 group"
              >
                <button
                  onClick={() => navigate(`/c/${c.owner.username}`)}
                  className="shrink-0"
                >
                  <img
                    src={c?.owner?.avatar || "https://via.placeholder.com/150"}
                    alt={c.owner.fullName}
                    className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-800"
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                      {c.owner.fullName}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      @{c.owner.username}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 mx-1">·</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {c.content}
                  </p>

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

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="flex justify-center mt-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tweet;