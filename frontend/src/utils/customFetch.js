import axios from "axios";

export const customFetch = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1`,
  withCredentials: true,
});

