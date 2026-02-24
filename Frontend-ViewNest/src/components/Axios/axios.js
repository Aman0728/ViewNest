import axios from "axios";

const api = axios.create({
    baseURL: "https://viewnest-backend.onrender.com",
    withCredentials: true
  })

export {api}