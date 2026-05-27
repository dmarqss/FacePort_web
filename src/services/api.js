import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
})

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('faceport_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const authLogin = (email, senha) =>
  api.post('/login', { email, senha })

// Morador
export const getMoradores = () => api.get('/morador')
export const createMorador = (formData) =>
  api.post('/morador', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteMorador = (cpf) => api.delete(`/morador/${cpf}`)
export const solicitarVisitante = (cpfVisitante) =>
  api.post(`/morador/solicitar/${cpfVisitante}`)

// Funcionário
export const getFuncionarios = () => api.get('/funcionario')
export const createFuncionario = (formData) =>
  api.post('/funcionario', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteFuncionario = (cpf) => api.delete(`/funcionario/${cpf}`)

// Admin
export const getAdmins = () => api.get('/admin')
export const createAdmin = (data) => api.post('/admin', data)
export const deleteAdmin = (cpf) => api.delete(`/admin/${cpf}`)

// Totem – reconhecimento facial
export const verificarRosto = (blob) => {
  const fd = new FormData()
  fd.append('foto', blob, 'face.jpg')
  return api.post('/totem', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}

// SSE – visitante numpad stream
export const createSseUrl = () => 'http://localhost:8080/acesso/stream'

export default api
