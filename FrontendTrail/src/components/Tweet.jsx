import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "./Axios/axios";

function Tweet() {
  const { tweetId } = useParams();
  const [tweet, setTweet] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
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

        {/* TIMESTAMP */}
        <p className="text-xs text-gray-500 mt-4">
          {new Date(tweet?.createdAt).toLocaleString()}
        </p>
      </div>

      {/* COMMENT INPUT */}
      <div className="mt-6 border rounded-xl p-4 bg-white shadow-sm">
        <textarea
          placeholder="Write a comment..."
          className="w-full resize-none outline-none text-sm"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-700 transition">
            Comment
          </button>
        </div>
      </div>

      {/* COMMENTS LIST */}
      {/* <div className="mt-6 space-y-4">
        <div className="flex gap-3">
          <img
            src="https://i.pravatar.cc/40"
            alt=""
            className="w-8 h-8 rounded-full"
          />
          <div className="bg-gray-100 rounded-lg p-3 w-full">
            <p className="text-sm font-medium">User Name</p>
            <p className="text-sm text-gray-700">This tweet is awesome 🔥</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Tweet;
