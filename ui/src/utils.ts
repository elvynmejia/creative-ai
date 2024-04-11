import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;
export const SUPABASE_API_URL = import.meta.env.VITE_SUPABASE_API_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const ANON_USER_ID = "ANON_USER_ID";
export const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg"];

export const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
