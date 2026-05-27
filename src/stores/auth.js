import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authLogin } from '@/services/api'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('faceport_token') || null)

  const payload = computed(() => (token.value ? parseJwt(token.value) : null))

  const role = ref(localStorage.getItem('faceport_role') || null)

  const isLoggedIn = computed(() => !!token.value)

  function normalizeRole(roleData) {
    if (!roleData) return null
    if (typeof roleData === 'string') return roleData
    if (typeof roleData.roleName === 'string') return roleData.roleName
    if (typeof roleData.name === 'string') return roleData.name
    if (typeof roleData.role === 'string') return roleData.role
    if (Array.isArray(roleData.roleValue) && roleData.roleValue.length > 0) {
      return roleData.roleValue[0]
    }
    return null
  }

  async function login(email, senha) {
    const res = await authLogin(email, senha)
    const tkn = res.data.token
    token.value = tkn
    localStorage.setItem('faceport_token', tkn)

    const backendRole = normalizeRole(res.data.role)
    role.value = backendRole ? backendRole.toUpperCase() : 'UNKNOWN'
    localStorage.setItem('faceport_role', role.value)

    return role.value
  }

  function logout() {
    token.value = null
    role.value = null
    localStorage.removeItem('faceport_token')
    localStorage.removeItem('faceport_role')
  }

  return { token, role, isLoggedIn, login, logout }
})
