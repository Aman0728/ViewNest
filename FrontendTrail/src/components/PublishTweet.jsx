import { useState } from "react";
import { api } from "./Axios/axios";
import { useNavigate } from "react-router-dom";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";

function PublishTweet() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const maxImages = 10;
  const maxLength = 2800;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > maxImages) {
      alert(`You can upload up to ${maxImages} images`);
      return;
    }

    const previewFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previewFiles]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submitTweet = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", content);

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    try {
      setLoading(true);

      await api.post("/tweets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setContent("");
      setImages([]);
      // navigate("/somewhere"); // Optional: Navigate after posting
    } catch (err) {
      console.error(err);
      alert("Failed to post tweet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 px-2">
          Create Post
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
          <form onSubmit={submitTweet} className="flex flex-col">
            
            {/* TEXTAREA */}
            <div className="p-4 sm:p-5">
              <textarea
                placeholder="What’s happening?"
                value={content}
                maxLength={maxLength}
                onChange={(e) => setContent(e.target.value)}
                rows={content.split("\n").length > 3 ? 6 : 4}
                className="w-full bg-transparent resize-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg sm:text-xl transition-all"
              />
            </div>

            {/* IMAGE PREVIEW GRID */}
            {images.length > 0 && (
              <div className="px-4 sm:px-5 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, index) => (
                    <div 
                      key={index} 
                      className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-square"
                    >
                      <img
                        src={img.preview}
                        alt={`preview-${index}`}
                        className="w-full h-full object-cover"
                      />
                      {/* REMOVE BUTTON */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all focus:opacity-100 outline-none"
                        aria-label="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BAR (FOOTER) */}
            <div className="px-4 py-3 sm:px-5 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors">
              
              {/* LEFT: TOOLS */}
              <div className="flex items-center">
                <label 
                  className="cursor-pointer p-2 rounded-full text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors tooltip"
                  title="Add photos"
                >
                  <ImagePlus size={22} />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* RIGHT: SUBMIT & CHAR COUNT */}
              <div className="flex items-center gap-4">
                {/* CHARACTER COUNT (Only shows when user starts typing) */}
                {content.length > 0 && (
                  <div className="flex items-center justify-center w-8 h-8 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background Circle */}
                      <path
                        className="text-gray-200 dark:text-gray-700 stroke-current"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Progress Circle */}
                      <path
                        className={`${
                          content.length > maxLength - 20 ? "text-red-500" : "text-indigo-500"
                        } stroke-current transition-all duration-300`}
                        strokeWidth="3"
                        strokeDasharray={`${(content.length / maxLength) * 100}, 100`}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    {content.length > maxLength - 20 && (
                      <span className="absolute text-[10px] font-medium text-red-500">
                        {maxLength - content.length}
                      </span>
                    )}
                  </div>
                )}

                {/* POST BUTTON */}
                <button
                  type="submit"
                  disabled={loading || !content.trim() || content.length > maxLength}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Posting
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Post
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PublishTweet;