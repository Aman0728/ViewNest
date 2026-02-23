import React, { useState, useEffect } from 'react';
import { api } from './Axios/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { useSelector } from 'react-redux';

function UpdateVideo() {
  const navigate = useNavigate();
  const { videoId } = useParams();
  const user = useSelector((state) => state.auth.userData);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch existing video details to pre-fill the form
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const { data } = await api.get(`/videos/${videoId}`);
        setTitle(data.data.title || "");
        setDescription(data.data.description || "");
        setPreview(data.data.thumbnail || null); // Show current thumbnail
      } catch (error) {
        console.error("Failed to fetch video details", error);
      } finally {
        setFetching(false);
      }
    };

    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  const handleThumbnail = (file) => {
    if (file) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const updateVideo = async (e) => {
    e.preventDefault();

    // Note: If you want to allow users to update just the title/description 
    // without requiring a NEW thumbnail, you might want to remove `!thumbnail` from this check.
    if (!title || !description) {
      alert("Title and description are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      setLoading(true);
      await api.patch(`/videos/${videoId}`, formData, {
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
            Update Video Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Modify the title, description, or thumbnail for your video.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors duration-300">
          <form onSubmit={updateVideo} className="space-y-6">

            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={5}
                placeholder="Describe your video"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              />
            </div>

            {/* THUMBNAIL UPLOAD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Thumbnail
              </label>
              
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-8 mt-1 cursor-pointer bg-gray-50 dark:bg-gray-950/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group overflow-hidden relative">
                {preview ? (
                  <div className="relative w-full px-4 flex justify-center">
                    <img
                      src={preview}
                      alt="Thumbnail preview"
                      className="h-48 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl m-4">
                      <p className="text-white font-medium flex items-center gap-2">
                        <ImageIcon size={20} /> Change Image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    <UploadCloud size={40} className="mb-3" />
                    <span className="text-sm font-medium">Click to upload a new thumbnail</span>
                    <span className="text-xs mt-1 opacity-70">PNG, JPG or WEBP (MAX. 5MB)</span>
                  </div>
                )}
    
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleThumbnail(e.target.files[0])}
                />
              </label>
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
                    Updating Video...
                  </>
                ) : (
                  "Update Video"
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateVideo;