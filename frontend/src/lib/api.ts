import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
});

export const TOKEN_KEY = 'goldenhour_token';

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; details?: { message: string }[] } | undefined;
    if (data?.details?.length) return data.details.map((d) => d.message).join(', ');
    return data?.message || err.message;
  }
  return 'Something went wrong';
};
