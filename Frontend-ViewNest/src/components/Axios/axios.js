import axios from "axios";

const api = axios.create({
    baseURL: "https://viewnest.onrender.com/api/v1", // for production
    // baseURL: "http://localhost:8000/api/v1", // form local development
    withCredentials: true
  })

export {api}