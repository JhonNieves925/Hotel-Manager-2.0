import axios from 'axios'

// DESARROLLO LOCAL → baseURL: 'http://localhost:8080/api'
// PRODUCCIÓN      → baseURL: '/api'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('huesped_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('huesped_token')
      localStorage.removeItem('huesped_usuario')
      window.location.href = '/huesped/login'
    }
    return Promise.reject(error)
  }
)

export default api