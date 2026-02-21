import React from 'react'
import { useDispatch } from 'react-redux'
import {logout} from '../../store/authSlice'
import { api } from '../Axios/axios';
import { useNavigate } from 'react-router-dom';

function LogoutBtn() {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const logoutHandler = async () => {
      await api.post("/users/logout",);
      dispatch(logout())
      navigate("/")
    }
  return (
  <button
    onClick={logoutHandler}
    className="px-4 md:px-6 py-2 text-xs md:text-sm font-medium text-gray-300
                             rounded-full transition-all duration-200
                             hover:text-white hover:bg-gray-800"
  >
    Logout
  </button>
);

}

export default LogoutBtn
