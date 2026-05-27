<template>
  <div class="fp-screen">
    <CitySkyline />

    <div class="fp-header">
      <span class="fp-role-label">Visitante</span>
      <span class="fp-logo"></span>
      <span></span>
    </div>

    <div class="fp-content" style="flex-direction:column; gap:14px; align-items:center;">
      <!-- Main card -->
      <div class="fp-card visitor-card">
        <h2 class="visitor-title">Acesso Visitante</h2>
        <p class="visitor-sub">digite no numpad</p>

        <!-- Phase indicator -->
        <div class="phase-row">
          <span :class="['phase-dot', phase === 'cpf' ? 'active' : 'done']">CPF</span>
          <span class="phase-line"></span>
          <span :class="['phase-dot', phase === 'code' ? 'active' : phase === 'result' ? 'done' : '']">CÓDIGO</span>
          <span class="phase-line"></span>
          <span :class="['phase-dot', phase === 'result' ? 'active' : '']">RESULTADO</span>
        </div>

        <!-- Display field -->
        <div class="display-field" :class="{ 'phase-code': phase === 'code' }">
          <template v-if="phase === 'cpf'">
            <span class="field-label">CPF:</span>
            <span class="field-value cpf-val">{{ displayCpf }}</span>
          </template>
          <template v-else-if="phase === 'code'">
            <span class="field-label">CÓDIGO:</span>
            <span class="field-value code-val">{{ displayCode }}</span>
          </template>
          <template v-else-if="phase === 'result'">
            <div class="result-area" :class="resultStatus">
              <span class="result-icon">{{ resultStatus === 'granted' ? '✓' : '✗' }}</span>
              <span class="result-text">{{ resultStatus === 'granted' ? 'ACESSO LIBERADO' : 'ACESSO NEGADO' }}</span>
            </div>
          </template>
        </div>





        <div v-if="phase === 'result'" style="display:flex;justify-content:center;margin-top:18px;">
          <button class="btn btn-outline" @click="reset">Nova tentativa</button>
        </div>
      </div>

      <button class="btn btn-outline" style="font-size:0.8rem;" @click="$router.push('/acesso')">
        ← Voltar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createSseUrl } from '@/services/api'
import CitySkyline from '@/components/CitySkyline.vue'

const phase = ref('cpf')         // 'cpf' | 'code' | 'result'
const cpfBuffer = ref('')
const codeBuffer = ref('')
const resultStatus = ref('')     // 'granted' | 'denied'

let sse = null

// Display helpers
const displayCpf = computed(() => {
  const s = cpfBuffer.value.padEnd(11, '_')
  return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6,9)}-${s.slice(9,11)}`
})

const displayCode = computed(() => {
  return codeBuffer.value.padEnd(7, '_')
})

// ── SSE ──
function connectSse() {
  sse = new EventSource(createSseUrl())

  sse.addEventListener('DIGITO', (e) => {
    const buf = e.data
    if (phase.value === 'cpf') {
      cpfBuffer.value = buf.slice(0, 11)
    } else if (phase.value === 'code') {
      codeBuffer.value = buf.slice(0, 7)
    }
  })

  sse.addEventListener('CPF', (e) => {
  cpfBuffer.value = e.data
  phase.value = 'code'
})

  sse.addEventListener('CODIGO', () => {
    phase.value = 'code'
  })

  sse.addEventListener('RESULTADO', (e) => {
    resultStatus.value = e.data === 'ABRIR' ? 'granted' : 'denied'
    phase.value = 'result'
  })

  sse.addEventListener('RESET', () => {
    reset()
  })
}

// ── Manual numpad fallback ──

function reset() {
  phase.value = 'cpf'
  cpfBuffer.value = ''
  codeBuffer.value = ''
  resultStatus.value = ''
}

onMounted(connectSse)
onUnmounted(() => sse?.close())
</script>

<style scoped>
.visitor-card {
  width: 100%;
  max-width: 420px;
}

.visitor-title {
  font-family: var(--font-title);
  font-size: 1.1rem;
  letter-spacing: 3px;
  text-align: center;
  margin-bottom: 4px;
}

.visitor-sub {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.55);
  text-align: center;
  margin-bottom: 18px;
  letter-spacing: 1px;
}

.phase-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 18px;
}

.phase-dot {
  font-size: 0.72rem;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
}

.phase-dot.active {
  color: var(--white);
  border-color: var(--white);
  background: rgba(255,255,255,0.12);
}

.phase-dot.done {
  color: var(--text-green);
  border-color: var(--text-green);
}

.phase-line {
  width: 28px;
  height: 1px;
  background: rgba(255,255,255,0.2);
}

.display-field {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 14px;
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.field-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
  letter-spacing: 2px;
  flex-shrink: 0;
}

.field-value {
  font-family: var(--font-title);
  font-size: 1.25rem;
  letter-spacing: 3px;
  color: var(--white);
}

.code-val { color: var(--text-yellow); }

.result-area {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.result-area.granted { color: var(--text-green); }
.result-area.denied  { color: var(--text-red); }

.result-icon { font-size: 1.8rem; }

.result-text {
  font-family: var(--font-title);
  font-size: 1rem;
  letter-spacing: 2px;
}

.conn-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 14px;
}

.conn-badge.connected { color: var(--text-green); background: rgba(57,255,90,0.1); }
.conn-badge.disconnected { color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }
</style>