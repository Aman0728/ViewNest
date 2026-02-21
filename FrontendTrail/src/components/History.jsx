import React, {useEffect, useState} from 'react'
import { api } from './Axios/axios'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';

function History() {
    const userdata = useSelector(state => state.auth.userData)
    const [history, setHistory] = useState([]);
    const navigate = useNavigate()
    useEffect(() => {
        const getData = async () => {
            const {data} = await api.get("/users/watch/history")
            console.log(data.data)
            setHistory(data.data)
        }
        getData()
    },[])

  const removeFromHistory = async(videoId) => {
    setHistory(prev => prev.filter(e => e.video._id.toString() !== videoId))
    console.log(history[0])
    const {data} = await api.delete(`users/watch/history/${videoId}`)
    console.log(data.data)
  }
  
  if(history.length === 0) return <p>Loading History</p>
  return (
  <div className="max-w-5xl mx-auto px-4 py-6">

    <h1 className="text-2xl font-semibold mb-6">
      Watch History
    </h1>

    {history?.length === 0 && (
      <p className="text-gray-500">No watch history yet.</p>
    )}

    <div className="space-y-4">
      {history?.map((item) => (
        <div
          key={item.video._id}
          className="flex gap-4 items-start border-b pb-4"
        >
          {/* THUMBNAIL */}
          <button
            onClick={() => navigate(`/videos/${item.video._id}`)}
            className="shrink-0"
          >
            <div className="w-48 aspect-video bg-black rounded-lg overflow-hidden">
              <img
                src={item.video.thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* VIDEO INFO */}
          <div className="flex-1">
            <button
              onClick={() => navigate(`/video/${item.video._id}`)}
              className="text-left"
            >
              <h2 className="font-semibold text-lg line-clamp-2 hover:text-blue-600">
                {item.video.title}
              </h2>
            </button>

            <p className="text-sm text-gray-500 mt-1">
              {item.video.owner.fullName}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {item.video.views} views
            </p>

            {/* WATCHED TIME */}
            {item.watchedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Watched on{" "}
                {new Date(item.watchedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* REMOVE BUTTON */}
          <button
            onClick={() => removeFromHistory(item.video._id)}
            className="text-sm text-gray-400 hover:text-red-500 transition"
          >
            Remove
          </button>
        </div>
      ))}
    </div>

  </div>
);

}

export default History
