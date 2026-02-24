import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { toggleTheme } from '../../store/themeSlice';
import Container from "../Container";
import ViewNestLogo from "./ViewNest_Logo.png";
import { 
  Plus, Video, MessageSquare, List, LogIn, UserPlus, Sun, Moon, Search, ArrowLeft 
} from 'lucide-react';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const user = useSelector(state => state.auth.userData);
  const themeMode = useSelector((state) => state.theme.mode);
  
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- NEW STATES & REFS FOR MOBILE SEARCH ---
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef(null);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); 
      setIsMobileSearchOpen(false); // Close mobile search after searching
    }
  };

  // Close mobile search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileSearchOpen && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setIsMobileSearchOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileSearchOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <Container>
        <nav className="flex items-center justify-between py-3 md:py-4 gap-2 sm:gap-4 relative h-[64px] md:h-auto">
          
          {/* MOBILE EXPANDED SEARCH BAR                */}
          {isMobileSearchOpen ? (
            <div 
              ref={mobileSearchRef} 
              className="flex items-center w-full h-full gap-2 animate-in fade-in slide-in-from-right-4 duration-200"
            >
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              <form 
                onSubmit={handleSearch}
                className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 transition-shadow"
              >
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent border-none outline-none px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors border-l border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-200/50 dark:bg-gray-700/50"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>
          ) : (
            
            /* STANDARD NAVIGATION LAYOUT                */
            <>
              {/* LEFT — LOGO */}
              <NavLink to="/" className="flex-shrink-0">
                <img src={ViewNestLogo} className="w-24 md:w-28" alt="ViewNest" />
              </NavLink>

              {/* MIDDLE — DESKTOP SEARCH BAR (Hidden on small screens) */}
              <div className="hidden md:flex flex-1 max-w-2xl px-6">
                <form 
                  onSubmit={handleSearch}
                  className="w-full flex items-center bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 transition-shadow"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-transparent border-none outline-none px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-l border-gray-200 dark:border-gray-700 flex items-center justify-center"
                  >
                    <Search size={18} />
                  </button>
                </form>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                
                {/* 🔹 MOBILE SEARCH ICON BUTTON (Hidden on Desktop) */}
                <button
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="md:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Open Search"
                >
                  <Search size={20} />
                </button>

                {/* 🔹 THEME TOGGLE BUTTON */}
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Toggle Theme"
                >
                  {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* 🔹 USER LOGGED IN */}
                {authStatus ? (
                  <>
                    {/* CREATE BUTTON & DROPDOWN WRAPPER */}
                    <div className="relative hidden sm:block">
                      <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                      >
                        <Plus size={18} />
                        <span>Create</span>
                      </button>

                      {/* DROPDOWN */}
                      {open && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <NavLink to="/video/v/publish" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <Video size={16} className="text-indigo-500" /> Video
                            </NavLink>
                            <NavLink to="/tweet/t/publish" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <MessageSquare size={16} className="text-indigo-500" /> Tweet
                            </NavLink>
                            <NavLink to="/playlist/p/publish" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <List size={16} className="text-indigo-500" /> Playlist
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
                    <NavLink to="/login" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium transition-colors">
                      <LogIn size={18} /> <span>Login</span>
                    </NavLink>
                    <NavLink to="/signup" className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <UserPlus size={18} /> <span className="hidden sm:inline">Signup</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}

export default Header;