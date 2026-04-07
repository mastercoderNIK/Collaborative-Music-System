import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || ''
      if (url.includes('/api/auth/me')) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_data')
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

export const searchMusic = (query) => api.get(`/api/music/search?q=${encodeURIComponent(query)}`)
export const getRecommendations = (videoId) => api.get(`/api/music/recommendations?video_id=${videoId}`)
export const getTrending = () => api.get('/api/music/trending')

export const createGroup = (name) => api.post('/api/groups/create', { name })
export const joinGroup = (token) => api.post('/api/groups/join', { token })
export const getMyGroups = () => api.get('/api/groups/mine')
export const leaveGroup = (groupId) => api.post(`/api/groups/${groupId}/leave`)
export const getGroupMembers = (groupId) => api.get(`/api/groups/${groupId}/members`)
export const getGroupCurrent = (groupId) => api.get(`/api/groups/${groupId}/current`)
export const syncGroupTrack = (groupId, track, position = 0) =>
  api.post(`/api/groups/${groupId}/sync`, { track, position })

export const getChatHistory = (groupId) => api.get(`/api/chat/${groupId}`)

export const castVote = (groupId, voteType) =>
  api.post('/api/votes/cast', { group_id: groupId, vote_type: voteType })
export const getVoteTally = (groupId) => api.get(`/api/votes/tally?group_id=${groupId}`)

export const submitFeedback = (message) => api.post('/api/feedback/submit', { message })

export const adminGetUsers = () => api.get('/api/admin/users')
export const adminGetGroups = () => api.get('/api/admin/groups')
export const adminGetFeedback = () => api.get('/api/admin/feedback')
export const adminDeleteUser = (userId) => api.delete(`/api/admin/users/${userId}`)
export const adminDeleteGroup = (groupId) => api.delete(`/api/admin/groups/${groupId}`)
export const deleteGroup = (groupId) => api.delete(`/api/groups/${groupId}`)

export default api