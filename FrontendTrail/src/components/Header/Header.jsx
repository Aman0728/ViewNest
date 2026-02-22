import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { Container, LogoutBtn } from "../index"; // Ensure LogoutBtn is used if needed, or remove it
import ViewNestLogo from "./ViewNest_Logo.png";
import { 
  Plus, Video, MessageSquare, List, LogIn, UserPlus, Sun, Moon 
} from 'lucide-react';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const user = useSelector(state => state.auth.userData);
  
  const [open, setOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 🔹 Check for saved theme or system preference on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // 🔹 Toggle theme function
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <Container>
        <nav className="flex items-center justify-between py-3 md:py-4">
          
          {/* LEFT — LOGO */}
          <NavLink to="/" className="flex-shrink-0">
            <img src={ViewNestLogo} className="w-24 md:w-28" alt="ViewNest" />
          </NavLink>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* 🔹 THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* 🔹 USER LOGGED IN */}
            {authStatus ? (
              <>
                {/* CREATE BUTTON & DROPDOWN WRAPPER */}
                <div className="relative">
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Create</span>
                  </button>

                  {/* DROPDOWN */}
                  {open && (
                    <>
                      {/* Invisible overlay to close dropdown when clicking outside */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setOpen(false)}
                      ></div>
                      
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <NavLink
                          to="/video/v/publish"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Video size={16} className="text-indigo-500" />
                          Video
                        </NavLink>

                        <NavLink
                          to="/tweet/t/publish"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MessageSquare size={16} className="text-indigo-500" />
                          Tweet
                        </NavLink>

                        <NavLink
                          to="/playlist/p/publish"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <List size={16} className="text-indigo-500" />
                          Playlist
                        </NavLink>
                      </div>
                    </>
                  )}
                </div>

                {/* USER AVATAR */}
                <NavLink to={`/c/${user?.username}`} className="flex-shrink-0 ml-1">
                  <img
                    src={user?.avatar}
                    alt="profile"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-transparent hover:border-indigo-500 dark:border-gray-700 dark:hover:border-indigo-500 transition-all duration-200"
                  />
                </NavLink>
              </>
            ) : (
              /* 🔹 USER NOT LOGGED IN */
              <div className="flex items-center gap-2 sm:gap-3">
                <NavLink
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium transition-colors"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Login</span>
                </NavLink>

                <NavLink
                  to="/signup"
                  className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Signup</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}

export default Header;