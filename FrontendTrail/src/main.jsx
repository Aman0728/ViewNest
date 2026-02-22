import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import {
  AuthLayout,
  History,
  Video,
  Channel,
  Tweet,
  PublishVideo,
  PublishTweet,
  PublishPlaylist,
  Playlist,
  UpdateVideo,
  UpdateTweet,
} from "./components/index.js";

import Signup from "./pages/Signup";
import Login from "./pages/Login.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <AuthLayout authentication={true}>
            <Home />
          </AuthLayout>
        ),
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
          <AuthLayout authentication={true}>
            <Video />
          </AuthLayout>
        ),
      },
      {
        path: "/video/update/:videoId",
        element: (
          <AuthLayout authentication={true}>
            <UpdateVideo />
          </AuthLayout>
        ),
      },
      {
        path: "/c/:username",
        element: (
          <AuthLayout authentication={true}>
            <Channel />
          </AuthLayout>
        ),
      },
      {
        path: "/tweet/:tweetId",
        element: (
          <AuthLayout authentication={true}>
            <Tweet />
          </AuthLayout>
        ),
      },
      {
        path: "/tweet/update/:tweetId",
        element: (
          <AuthLayout authentication={true}>
            <UpdateTweet />
          </AuthLayout>
        ),
      },
      {
        path: "/video/v/publish",
        element: (
          <AuthLayout authentication={true}>
            <PublishVideo />
          </AuthLayout>
        ),
      },
      {
        path: "/tweet/t/publish",
        element: (
          <AuthLayout authentication={true}>
            <PublishTweet />
          </AuthLayout>
        ),
      },
      {
        path: "/playlist/p/publish",
        element: (
          <AuthLayout authentication={true}>
            <PublishPlaylist />
          </AuthLayout>
        ),
      },
      {
        path: "/playlist/:playlistId",
        element: (
          <AuthLayout authentication={true}>
            <Playlist />
          </AuthLayout>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
