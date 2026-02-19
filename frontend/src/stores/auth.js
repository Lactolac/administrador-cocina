import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = ref(false)
  const sessionExpiry = ref(null)

  // Check if session has expired
  const isSessionExpired = () => {
    const savedExpiry = localStorage.getItem('sessionExpiry')
    if (!savedExpiry) return true
    return Date.now() > parseInt(savedExpiry)
  }

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username: credentials.username,
        password: credentials.password,
        country: credentials.country || 'sv',
        loginType: credentials.loginType || 'ad'
      })

      const { user: userData, token: authToken, expiresIn } = response.data

      user.value = userData
      token.value = authToken
      isAuthenticated.value = true

      // Calculate expiry time (1 hour from now)
      const expiryTime = Date.now() + (expiresIn || 3600) * 1000
      sessionExpiry.value = expiryTime

      // Save to localStorage
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('sessionExpiry', expiryTime.toString())

      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`

      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state immediately
      user.value = null
      token.value = null
      isAuthenticated.value = false
      sessionExpiry.value = null

      // Clear localStorage completely
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('sessionExpiry')

      // Remove axios header
      delete axios.defaults.headers.common['Authorization']
    }
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    const savedExpiry = localStorage.getItem('sessionExpiry')

    // Clear invalid data helper
    const clearInvalidSession = () => {
      user.value = null
      token.value = null
      isAuthenticated.value = false
      sessionExpiry.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('sessionExpiry')
      delete axios.defaults.headers.common['Authorization']
    }

    // If no token or no expiry, clear everything
    if (!savedToken || !savedExpiry) {
      clearInvalidSession()
      return
    }

    // Check if session has expired
    const expiryTime = parseInt(savedExpiry)
    if (isNaN(expiryTime) || Date.now() > expiryTime) {
      clearInvalidSession()
      return
    }

    // Validate user data
    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(savedUser)
        if (parsedUser && typeof parsedUser === 'object') {
          user.value = parsedUser
          token.value = savedToken
          sessionExpiry.value = savedExpiry
          isAuthenticated.value = true
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        } else {
          clearInvalidSession()
        }
      } catch (e) {
        console.error('Error parsing user data:', e)
        clearInvalidSession()
      }
    } else {
      clearInvalidSession()
    }
  }

  // Initialize auth state
  checkAuth()

  return {
    user,
    token,
    isAuthenticated,
    sessionExpiry,
    login,
    logout,
    checkAuth,
    isSessionExpired
  }
})
