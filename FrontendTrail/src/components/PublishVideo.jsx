import { useState } from "react";
import { UploadCloud } from "lucide-react";
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

  const handleThumbnail = (file) => {
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Upload Video</h1>

      <form onSubmit={uploadVideo} className="space-y-6">

        {/* TITLE */}
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={4}
            placeholder="Describe your video"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* VIDEO UPLOAD */}
        <div>
          <label className="text-sm font-medium">Upload Video</label>

          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-8 mt-2 cursor-pointer hover:bg-gray-50">
            <UploadCloud size={36} className="text-gray-500 mb-2" />
            <span className="text-sm text-gray-500">
              Click to upload video
            </span>
            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => setVideo(e.target.files[0])}
            />
          </label>

          {video && (
            <p className="text-xs text-gray-500 mt-2">
              Selected: {video.name}
            </p>
          )}
        </div>

        {/* THUMBNAIL UPLOAD */}
        <div>
          <label className="text-sm font-medium">Thumbnail</label>

          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-8 mt-2 cursor-pointer hover:bg-gray-50">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-32 object-cover rounded"
              />
            ) : (
              <>
                <UploadCloud size={36} className="text-gray-500 mb-2" />
                <span className="text-sm text-gray-500">
                  Upload thumbnail
                </span>
              </>
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium transition"
        >
          {loading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
}

export default PublishVideo;
