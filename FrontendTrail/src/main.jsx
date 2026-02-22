import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home.jsx'
import { AuthLayout, 
    History, 
    Video, 
    Channel, 
    Tweet, 
    PublishVideo, 
    PublishTweet, 
    PublishPlaylist, 
    Playlist,
    UpdateVideo
} from './components/index.js'


import Signup from './pages/Signup';
import Login from "./pages/Login.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/",
            element: (
                <Home />
            )
        },
        {
            path: "/login",
            element: (
                <AuthLayout authentication={false}>
                    <Login />
                </AuthLayout>
            ),
        },
        {
            path: "/signup",
            element: (
                <AuthLayout authentication={false}>
                    <Signup />
                </AuthLayout>
            ),
        },
        {
            path: "/history",
            element: (
                <AuthLayout authentication={true}>
                    <History />
                </AuthLayout>
            ),
        },
        {
            path: "/video/:videoId",
            element: (
                <Video />
            )
        },
        {
            path: "/video/update/:videoId",
            element: (
                <UpdateVideo />
            )
        },
        {
            path: "/c/:username",
            element: (
                <Channel />
            )
        },
        {
            path: "/tweet/:tweetId",
            element: (
                <Tweet />
            )
        },
        {
            path: "/video/v/publish",
            element: (
                <PublishVideo />
            )
        },
        {
            path: "/tweet/t/publish",
            element: (
                <PublishTweet />
            )
        },
        {
            path: "/playlist/p/publish",
            element: (
                <PublishPlaylist />
            )
        },
        {
            path: "/playlist/:playlistId",
            element: (
                <Playlist />
            )
        },
    ],
},
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>,
)
