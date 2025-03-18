import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
      'Content-Type': 'application/json',
  },
  withCredentials: true // Quan trọng nếu bạn sử dụng session/cookies
});
  
export default instance;