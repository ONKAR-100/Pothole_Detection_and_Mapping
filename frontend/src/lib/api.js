import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 300_000,
})

export const detectImage = (formData) =>
  api.post('/detect/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data)

export const detectVideo = (formData) =>
  api.post('/detect/video', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data)

export const detectFrame = (formData) =>
  api.post('/detect/frame', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data)

export const downloadAnnotatedVideo = (path) =>
  api.get('/detect/video/download', {
    params: { path },
    responseType: 'blob',
  }).then(r => r.data)

export const getMyDetections = () =>
  api.get('/detections/my').then(r => r.data)

export const getAllDetections = (params = {}) =>
  api.get('/detections', { params }).then(r => r.data)

export const getDetectionById = (id) =>
  api.get(`/detections/${id}`).then(r => r.data)

export const getMapPins = () =>
  api.get('/detections/map/pins').then(r => r.data)

export const getStats = () =>
  api.get('/detections/stats').then(r => r.data)

export const getDashboardStats = () =>
  api.get('/dashboard/stats').then(r => r.data)

export const getAlerts = (limit = 20) =>
  api.get('/dashboard/alerts', { params: { limit } }).then(r => r.data)

export const markAlertsRead = () =>
  api.post('/dashboard/alerts/read').then(r => r.data)

export const getTimeline = () =>
  api.get('/dashboard/timeline').then(r => r.data)

export const generateReport = (body) =>
  api.post('/reports/generate', body, { responseType: 'blob' }).then(r => r.data)

export const sendReport = (body) =>
  api.post('/reports/send', body).then(r => r.data)

export const getReports = () =>
  api.get('/reports').then(r => r.data)

export const getContacts = () =>
  api.get('/municipality/contacts').then(r => r.data)

export const createContact = (body) =>
  api.post('/municipality/contacts', body).then(r => r.data)

export const deleteContact = (id) =>
  api.delete(`/municipality/contacts/${id}`).then(r => r.data)

export const getMe = () =>
  api.get('/auth/me').then(r => r.data)

export default api
