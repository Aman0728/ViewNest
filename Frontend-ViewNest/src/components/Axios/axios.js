import axios from "axios";

const api = axios.create({
    baseURL: "https://viewnest.onrender.com",
    withCredentials: true
  })

export {api}