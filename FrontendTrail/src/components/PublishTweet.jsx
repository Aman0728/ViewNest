import { useState } from "react";
import { api } from "./Axios/axios";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Create Tweet</h1>

      <form onSubmit={submitTweet} className="space-y-4">
        {/* TEXTAREA */}
        <textarea
          placeholder="What’s happening?"
          value={content}
          maxLength={maxLength}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full p-4 border rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />

        {/* FOOTER */}
        <div className="flex items-center justify-between">
          {/* CHARACTER COUNT */}
          <span
            className={`text-xs ${
              content.length > maxLength - 20 ? "text-red-500" : "text-gray-500"
            }`}
          >
            {content.length}/{maxLength}
          </span>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="cursor-pointer text-sm text-indigo-600 font-medium">
              📷 Add Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* IMAGE PREVIEW */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.preview}
                    alt="preview"
                    className="w-full h-24 object-cover rounded-lg"
                  />

                  {/* REMOVE BUTTON */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* POST BUTTON */}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-full text-sm transition"
          >
            <Send size={16} />
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PublishTweet;
