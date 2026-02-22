import React, {useState} from 'react'
import { api } from './Axios/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadCloud } from "lucide-react";
import { useSelector } from 'react-redux';

function UpdateVideo() {
    const navigate = useNavigate()
    const {videoId} = useParams()
    const user = useSelector(state => state.auth.userData)
    const [title, setTitle] = useState("");
      const [description, setDescription] = useState("");
      const [thumbnail, setThumbnail] = useState(null);
      const [loading, setLoading] = useState(false);
      const [preview, setPreview] = useState(null);
      const handleThumbnail = (file) => {
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };
      

      const updateVideo = async (e) => {
    e.preventDefault();

    if (!title || !description || !thumbnail) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("thumbnail", thumbnail);
    

    try {
      setLoading(true);

      const { data } = await api.patch(`/videos/${videoId}`, formData, {
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
  return (
    <div>
        
        <form onSubmit={updateVideo} className="space-y-6">

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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium transition"
        >
          {loading ? "Updating..." : "Update Video"}
        </button>
      </form>
    </div>
  )
}

export default UpdateVideo