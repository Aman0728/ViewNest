import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { api } from "./Axios/axios";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("avatar", avatar);
      formData.append("coverImage", coverImage);

      const { data } = await api.post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const userdata = data.data;

      if (userdata) dispatch(login(userdata));

      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">
      <div className="w-full max-w-lg bg-gray-900/90 backdrop-blur-xl rounded-2xl p-10 border border-gray-800 shadow-2xl">

        <h2 className="text-center text-3xl font-bold text-white">
          Create your account
        </h2>

        <p className="mt-2 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 transition hover:underline"
          >
            Sign in
          </Link>
        </p>

        {error && (
          <p className="mt-6 text-center text-sm text-red-500 bg-red-500/10 py-2 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={registerUser} className="mt-8 space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />

          {/* AVATAR */}
          <div>
            <label className="text-gray-400 text-sm">Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="mt-1 text-sm text-gray-300"
            />
          </div>

          {/* COVER IMAGE */}
          <div>
            <label className="text-gray-400 text-sm">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
              className="mt-1 text-sm text-gray-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition duration-200 shadow-lg shadow-indigo-600/30"
          >
            Sign Up
          </button>

        </form>
      </div>
    </div>
  );
}

export default Signup;
