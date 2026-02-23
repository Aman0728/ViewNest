import React, { useState, useEffect } from "react";
import { api } from "./Axios/axios";
import { useNavigate, useParams } from "react-router-dom";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { useSelector } from "react-redux";

function UpdateTweet() {
  const navigate = useNavigate();
  const { tweetId } = useParams();
  const user = useSelector((state) => state.auth.userData);

  const [content, setContent] = useState("");
  // 'images' will store the actual File objects if the user uploads new ones
  const [images, setImages] = useState([]);
  // 'previews' stores the URLs (either existing from backend or newly generated blobs)
  const [previews, setPreviews] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch existing tweet details to pre-fill the form
  useEffect(() => {
    const fetchTweetDetails = async () => {
      try {
        const { data } = await api.get(`/tweets/${tweetId}`);
        setContent(data.data.content || "");
        
        // If the tweet already has images, show them in the preview
        if (data.data.images && data.data.images.length > 0) {
          setPreviews(data.data.images);
        }
      } catch (error) {
        console.error("Failed to fetch tweet details", error);
      } finally {
        setFetching(false);
      }
    };

    if (tweetId) {
      fetchTweetDetails();
    }
  }, [tweetId]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages(files);
      
      // Generate preview URLs for the newly selected files
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeImage = (indexToRemove) => {
    // If they are local files, remove from the files array
    if (images.length > 0) {
      setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    }
    // Always remove from previews
    setPreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const updateTweet = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Tweet content cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    
    // Append new images if the user selected any
    if (images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image); // Ensure "images" matches your multer backend field
      });
    }

    try {
      setLoading(true);
      await api.patch(`/tweets/${tweetId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/c/${user?.username}`);
    } catch (err) {
      console.log(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 transition-colors duration-300 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Update Tweet
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Make changes to your tweet's text or attached images.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors duration-300">
          <form onSubmit={updateTweet} className="space-y-6">

            {/* CONTENT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tweet Content
              </label>
              <textarea
                rows={5}
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
            </div>

            {/* MULTIPLE IMAGE UPLOAD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Images (Optional)
              </label>
              
              <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-950/50 transition-colors">
                
                {/* PREVIEW GRID */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black">
                        <img 
                          src={src} 
                          alt={`Preview ${idx + 1}`} 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-70 transition-opacity"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* UPLOAD BUTTON */}
                <label className="flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                  <UploadCloud size={32} className="mb-2 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {previews.length > 0 ? "Replace Images" : "Upload Images"}
                  </span>
                  <span className="text-xs mt-1 text-gray-500 opacity-70">You can select multiple files</span>
                  
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating Tweet...
                  </>
                ) : (
                  "Update Tweet"
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateTweet;