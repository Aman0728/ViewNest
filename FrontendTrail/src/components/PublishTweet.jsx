import { useState } from "react";
import { api } from "./Axios/axios";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";

function PublishTweet() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const maxLength = 2800;

  const submitTweet = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setLoading(true);

      await api.post("/tweets", { content });

      navigate("/"); // or profile page
    } catch (err) {
      console.log(err);
      alert("Failed to post tweet");
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
              content.length > maxLength - 20
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {content.length}/{maxLength}
          </span>

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
