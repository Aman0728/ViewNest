import React, {useState} from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import { api } from './Axios/axios'


function Login() {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [error,setError] = useState('');
    const login = async(e) => {
      e.preventDefault()
        try {
          const { data } = await api.post("/users/login", {
              username,
              password
          })
          const userdata = data?.data
          if(userdata) dispatch(authLogin(userdata));
          navigate("/")
        } catch (err) {
          setError(err)
          console.log(error)
        }
    }
  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">
    <div className="w-full max-w-lg bg-gray-900/90 backdrop-blur-xl rounded-2xl p-10 border border-gray-800 shadow-2xl">
      
      <div className="mb-6 flex justify-center">
        {/* <span className="inline-block w-full max-w-[100px]">
            <Logo width="100%" />
        </span> */}
      </div>

      <h2 className="text-center text-3xl font-bold text-white">
        Sign in to your account
      </h2>

      <p className="mt-2 text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="text-indigo-400 hover:text-indigo-300 transition hover:underline"
        >
          Sign Up
        </Link>
      </p>

      {error && (
        <p className="mt-6 text-center text-sm text-red-500 bg-red-500/10 py-2 rounded-lg">
          Invalid Credentials
        </p>
      )}

      <form onSubmit={login} className="mt-8 space-y-5">
        <input
          type="text"
          placeholder="Usernmae"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition duration-200 shadow-lg shadow-indigo-600/30"
        >
          Login
        </button>
      </form>
    </div>
  </div>
);

}

export default Login
