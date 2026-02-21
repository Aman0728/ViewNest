import React from "react";
import { Container, LogoutBtn } from "../index";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import ViewNestLogo from "./ViewNest_Logo.png";
import {
  Plus,
  Video,
  MessageSquare,
  List,
  LogIn,
  UserPlus,
} from "lucide-react";

function Header() {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);
  const user = useSelector(state => state.auth.userData);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <Container>
        <nav className="flex items-center justify-between py-3 md:py-4">
          {/* LEFT — LOGO */}
          <NavLink to="/">
            <img src={ViewNestLogo} className="w-24 md:w-28" alt="VideoGen" />
          </NavLink>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 relative">
            {/* 🔹 USER LOGGED IN */}
            {authStatus && (
              <>
                {/* CREATE BUTTON */}
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-full text-sm transition"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Create</span>
                </button>

                {/* DROPDOWN */}
                {open && (
                  <div className="absolute right-16 top-12 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden w-44">
                    <NavLink
                      to="/video/v/publish"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <Video size={16} />
                      Video
                    </NavLink>

                    <NavLink
                      to="/tweet/t/publish"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <MessageSquare size={16} />
                      Tweet
                    </NavLink>

                    <NavLink
                      to="/playlist/p/publish"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <List size={16} />
                      Playlist
                    </NavLink>
                  </div>
                )}

                {/* USER AVATAR */}
                <NavLink to={`/c/${user?.username}`}>
                  <img
                    src={user?.avatar}
                    alt="profile"
                    className="w-9 h-9 rounded-full object-cover border border-gray-700 hover:ring-2 hover:ring-indigo-500 transition"
                  />
                </NavLink>

                {/* LOGOUT BUTTON (desktop only) */}
                {/* <div className="hidden md:block">
                  <LogoutBtn />
                </div> */}
              </>
            )}

            {/* 🔹 USER NOT LOGGED IN */}
            {!authStatus && (
              <>
                <NavLink
                  to="/login"
                  className="flex items-center gap-1 text-gray-300 hover:text-white text-sm"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Login</span>
                </NavLink>

                <NavLink
                  to="/signup"
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-full text-sm transition"
                >
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Signup</span>
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
