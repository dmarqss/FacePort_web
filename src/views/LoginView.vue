<template>
  <div class="fp-screen login-screen">
    <CitySkyline />

    <!-- Role badge top-left (dynamic, shown before login) -->
    <div class="fp-header">
      <span class="fp-logo"></span>
      <span></span>
    </div>

    <div class="fp-content">
      <div class="fp-card login-card">
        <h2 class="login-title">login</h2>

        <div class="fp-input-group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
          </svg>
          <input
            class="fp-input"
            v-model="email"
            type="email"
            placeholder="Email"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="fp-input-group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            class="fp-input"
            v-model="senha"
            :type="showPass ? 'text' : 'password'"
            placeholder="Código"
            @keyup.enter="handleLogin"
          />
        </div>
        <div class="show-pass-row" @click="showPass = !showPass">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" opacity="0.6">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>{{ showPass ? 'Ocultar senha' : 'Ver senha' }}</span>
        </div>

        <button class="btn btn-primary login-btn" @click="handleLogin" :disabled="loading">
          <span v-if="loading" class="fp-spinner" style="width:20px;height:20px;border-width:2px"></span>
          <span v-else>Entrar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import CitySkyline from '@/components/CitySkyline.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const email = ref('')
const senha = ref('')
const showPass = ref(false)
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !senha.value) {
    toast.show('Preencha email e código.', 'error')
    return
  }
  loading.value = true
  try {
    const role = await auth.login(email.value, senha.value)
    if (role === 'ADMIN') {
      router.push('/admin')
    } else if (role === 'MORADOR') {
      router.push('/morador/solicitar-visitante')
    } else {
      toast.show('Papel não reconhecido.', 'error')
    }
  } catch (e) {
    toast.show('Credenciais inválidas.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-screen {
  align-items: center;
  justify-content: flex-start;
}

.login-card {
  width: 100%;
  max-width: 380px;
  text-align: center;
}

.login-title {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: 2rem;
  letter-spacing: 4px;
  margin-bottom: 32px;
  color: var(--white);
}

.show-pass-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  margin-top: -10px;
  margin-bottom: 24px;
  justify-content: flex-end;
}

.login-btn {
  width: 100%;
  font-size: 1.1rem;
  letter-spacing: 3px;
  padding: 16px;
}
</style>
