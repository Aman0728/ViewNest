import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import {login, logout} from "./store/authSlice"
import { Header } from './components'
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const themeMode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (themeMode === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [themeMode]);

  // useEffect(() => {
  //   authService.getCurrentUser()
  //   .then((userData) => {
  //     if (userData) {
  //       dispatch(login({userData}))
  //     } else {
  //       dispatch(logout())
  //     }
  //   })
  //   .finally(() => setLoading(false))
  // }, [])
  
  return !loading ? (
    <div className='min-h-screen flex flex-wrap content-between bg-gray-200 dark:bg-gray-950 transition-colors duration-300 relative'>
      <div className='w-full block'>
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  ) : null
}

export default App