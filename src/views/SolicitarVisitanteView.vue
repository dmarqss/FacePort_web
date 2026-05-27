<template>
  <div class="fp-screen">
    <CitySkyline />

    <div class="fp-header">
      <span class="fp-role-label"></span>
      <span class="fp-logo"></span>
      <button class="btn btn-outline" style="font-size:0.8rem;padding:7px 16px;" @click="logout">Sair</button>
    </div>

    <div class="fp-content" style="flex-direction:column; align-items:center; gap:20px;">
      <div class="fp-card solicitar-card">
        <h2 class="card-title">Solicitar Visitante</h2>
        <p class="card-sub">Insira o CPF do visitante para gerar o código de acesso</p>

        <div class="fp-input-group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
          </svg>
          <input
            class="fp-input"
            v-model="cpfVisitante"
            type="text"
            placeholder="CPF do visitante"
            maxlength="14"
            @input="formatCpf"
            @keyup.enter="solicitar"
          />
        </div>

        <button
          class="btn btn-primary"
          style="width:100%; margin-top:8px;"
          @click="solicitar"
          :disabled="loading || cpfVisitante.replace(/\D/g,'').length < 11"
        >
          <span v-if="loading" class="fp-spinner" style="width:20px;height:20px;border-width:2px"></span>
          <span v-else>Gerar Código</span>
        </button>

        <!-- Código result -->
        <transition name="fade">
          <div v-if="codigo" class="codigo-result">
            <p class="codigo-label">Código de acesso gerado:</p>
            <div class="fp-codigo-display">{{ codigo }}</div>
            <p class="codigo-hint">Válido por 24 horas. Compartilhe com o visitante.</p>
            <button class="btn btn-outline" style="font-size:0.8rem;margin-top:8px;" @click="copiar">
              {{ copied ? '✓ Copiado' : 'Copiar código' }}
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { solicitarVisitante } from '@/services/api'
import CitySkyline from '@/components/CitySkyline.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const cpfVisitante = ref('')
const loading = ref(false)
const codigo = ref('')
const copied = ref(false)

function formatCpf() {
  let v = cpfVisitante.value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 9)      v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9)}`
  else if (v.length > 6) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`
  else if (v.length > 3) v = `${v.slice(0,3)}.${v.slice(3)}`
  cpfVisitante.value = v
}

async function solicitar() {
  const cpfRaw = cpfVisitante.value.replace(/\D/g, '')
  if (cpfRaw.length !== 11) { toast.show('CPF inválido', 'error'); return }

  loading.value = true
  codigo.value = ''
  try {
    const res = await solicitarVisitante(cpfRaw)
    codigo.value = res.data
    toast.show('Código gerado com sucesso!', 'success')
  } catch {
    toast.show('Erro ao gerar código. Tente novamente.', 'error')
  } finally {
    loading.value = false
  }
}

async function copiar() {
  await navigator.clipboard.writeText(codigo.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.solicitar-card {
  width: 100%;
  max-width: 420px;
}

.card-title {
  font-family: var(--font-title);
  font-size: 1.1rem;
  letter-spacing: 3px;
  text-align: center;
  margin-bottom: 6px;
}

.card-sub {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.55);
  text-align: center;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
}

.codigo-result {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.15);
  text-align: center;
}

.codigo-label {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.55);
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.codigo-hint {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  margin-top: 6px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
