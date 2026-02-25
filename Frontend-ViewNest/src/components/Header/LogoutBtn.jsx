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
  className="bg-red-50/50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-4 py-2.5 rounded-full font-medium transition-colors"
>
  Logout
</button>
);

}

export default LogoutBtn
