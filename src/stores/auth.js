import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchMe, login, register } from '../lib/api'

const TOKEN_KEY = 'ticketing-token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const roleSlug = computed(() => user.value?.role?.slug || '')
  const isAdmin = computed(() => roleSlug.value === 'admin')

  function setToken(nextToken) {
    token.value = nextToken

    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken)
      return
    }

    localStorage.removeItem(TOKEN_KEY)
  }

  async function refreshUser() {
    if (!token.value) {
      user.value = null
      return null
    }

    try {
      user.value = await fetchMe(token.value)
      return user.value
    } catch {
      setToken('')
      user.value = null
      return null
    }
  }

  async function initialize() {
    if (initialized.value) {
      return
    }

    token.value = localStorage.getItem(TOKEN_KEY) || ''
    initialized.value = true

    if (token.value) {
      await refreshUser()
    }
  }

  async function loginUser(credentials) {
    const response = await login(credentials)
    setToken(response.access_token)
    await refreshUser()
    return response
  }

  async function registerUser(payload) {
    const response = await register(payload)
    setToken(response.access_token)
    await refreshUser()
    return response
  }

  function logout() {
    setToken('')
    user.value = null
  }

  return {
    initialized,
    token,
    user,
    isAuthenticated,
    roleSlug,
    isAdmin,
    initialize,
    refreshUser,
    loginUser,
    registerUser,
    logout,
  }
})
