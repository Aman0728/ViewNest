import React, { useEffect, useState, useRef, useCallback  } from "react";
import { useParams, useNavigate} from "react-router-dom";
import { api } from "./Axios/axios";
import { useSelector } from "react-redux";

function Tweet() {
  const { tweetId } = useParams();
  const navigate = useNavigate()
  const commentRef = useRef(null);
  const user = useSelector(state => state.auth.userData)
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
      const { data } = await api.get(`/tweets/${tweetId}`);
      setTweet(data.data);
      const owner = data.data.owner;
      console.log(owner);
      const channelRes = await api.get(`/users/${owner}`);
      setChannelInfo(channelRes.data.data);
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
          `/comments/t/${tweetId}${cursor ? `?lastCreatedAt=${cursor}` : ""}`,
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
  
        const res = await api.get(`/comments/t/${tweetId}`);
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
    }, [tweetId]);

    const addComment = async () => {
        const commentText = commentRef.current.value;
        console.log(comments)
        commentRef.current.value = "";
        if (commentText.trim() !== "") {
          try {
            const commentadded = await api.post(`/comments/t/${tweetId}`, {
              content: commentText,
            });
            console.log(commentadded.data.data)
            setComments(prev => [commentadded.data.data, ...prev])
          } catch (error) {
            alert("Unable to post comment")
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

      const deleteComment = async (commentId) => {
          try {
            const deleted = api.delete(`comments/c/${commentId}`)
            setComments(prev => prev.filter(e => e._id !== commentId))
          } catch (error) {
            alert("Unable to delete comment")
          }
        }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* TWEET CARD */}
      <div className="border rounded-xl p-5 shadow-sm bg-white">
        {/* AUTHOR */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={channelInfo?.avatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />

          <div>
            <p className="font-semibold text-sm">{channelInfo?.fullName}</p>
            <p className="text-xs text-gray-500">@{channelInfo?.username}</p>
          </div>
        </div>

        {/* TWEET CONTENT */}
        <p className="text-base leading-relaxed whitespace-pre-line">
          {tweet?.content}
        </p>

        {/* IMAGE SLIDER */}
        {images.length > 0 && (
          <div className="relative mt-4 rounded-xl overflow-hidden">
            {/* IMAGE */}
            <div className="w-full h-[350px] bg-black flex items-center justify-center">
              <img
                src={images[currentImage]}
                alt=""
                className="max-h-full max-w-full object-contain transition-all duration-500 ease-in-out"
              />
            </div>

            {/* PREV BUTTON */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-2 py-1 rounded-full"
              >
                ‹
              </button>
            )}

            {/* NEXT BUTTON */}
            {images.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-2 py-1 rounded-full"
              >
                ›
              </button>
            )}

            {/* IMAGE COUNTER */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {currentImage + 1} / {images.length}
              </div>
            )}
          </div>
        )}

        {/* TIMESTAMP */}
        <p className="text-xs text-gray-500 mt-4">
          {new Date(tweet?.createdAt).toLocaleString()}
        </p>
      </div>


      {/* COMMENTS LIST */} 
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
                        src={c?.owner?.avatar || user.avatar}
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
                            onClick={() => deleteComment(c._id)}
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
  );
}

export default Tweet;
