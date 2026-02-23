import { useState } from "react";
import { UploadCloud, Film, Image as ImageIcon, Loader2 } from "lucide-react";
import { api } from "./Axios/axios";
import { useNavigate } from "react-router-dom";

function PublishVideo() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
    }
  };

  const uploadVideo = async (e) => {
    e.preventDefault();

    if (!title || !description || !video || !thumbnail) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", video);
    formData.append("thumbnail", thumbnail);

    try {
      setLoading(true);

      const { data } = await api.post("/videos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/video/${data.data._id}`);
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload New Video</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Share your moments with the world. Fill in the details below.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 transition-colors duration-300">
          <form onSubmit={uploadVideo} className="space-y-8">

            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Catchy title goes here..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Tell your viewers about this video..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all resize-y"
              />
            </div>

            {/* UPLOAD GRIDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* VIDEO UPLOAD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Video File <span className="text-red-500">*</span>
                </label>
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-48 cursor-pointer transition-all group ${
                  video 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
                    : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}>
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={handleVideo}
                  />
                  {video ? (
                    <div className="flex flex-col items-center text-center px-4">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-3">
                        <Film size={28} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 line-clamp-1">
                        {video.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Click to change video
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center px-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={28} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Video
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        MP4, WebM, or OGG
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* THUMBNAIL UPLOAD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Thumbnail <span className="text-red-500">*</span>
                </label>
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-48 overflow-hidden cursor-pointer transition-all group ${
                  preview 
                    ? "border-indigo-500" 
                    : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleThumbnail}
                  />
                  {preview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={preview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          Change Image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center px-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon size={28} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Upload Thumbnail
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPG, PNG, or WEBP (16:9)
                      </span>
                    </div>
                  )}
                </label>
              </div>

            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto sm:min-w-[200px] float-right flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud size={20} />
                    Publish Video
                  </>
                )}
              </button>
              <div className="clear-both"></div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default PublishVideo;