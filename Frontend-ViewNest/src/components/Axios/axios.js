import axios from "axios";

const api = axios.create({
    baseURL: "https://viewnest-backend.onrender.com/api/v1",
    withCredentials: true
  })

export {api}