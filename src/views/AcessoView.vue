<template>
  <div class="fp-screen">
    <CitySkyline />

    <div class="fp-header">
      <span class="fp-role-label"></span>
      <span class="fp-logo"></span>
      <span></span>
    </div>

    <div class="fp-content" style="flex-direction:column; gap:18px;">
      <!-- Camera box -->
      <div class="fp-camera-box cam-wrapper">
        <div class="fp-camera-label">reconhecimento facial</div>

        <!-- Result overlay -->
        <div v-if="result" class="fp-result-overlay" :class="result">
          <span>{{ result === 'granted' ? '✓ ACESSO LIBERADO' : '✗ ACESSO NEGADO' }}</span>
        </div>

        <!-- Scanning ring -->
        <div v-if="scanning" class="scan-ring"></div>

        <video ref="videoEl" autoplay playsinline muted class="cam-video" />
        <canvas ref="canvasEl" style="display:none" />
      </div>

      <!-- Visitor button -->
      <button class="btn btn-primary visitor-btn" @click="goVisitante">
        Entrar como visitante
      </button>

      <!-- Status -->
      <p v-if="statusMsg" class="status-msg">{{ statusMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { verificarRosto } from '@/services/api'
import CitySkyline from '@/components/CitySkyline.vue'

const router = useRouter()
const videoEl = ref(null)
const canvasEl = ref(null)
const result = ref(null)   // 'granted' | 'denied' | null
const scanning = ref(false)
const statusMsg = ref('Posicione o rosto na câmera')

const faceDetector = typeof window !== 'undefined' && 'FaceDetector' in window
  ? new window.FaceDetector()
  : null

let stream = null
let detectInterval = null
let cooldown = false

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
    videoEl.value.srcObject = stream
    await videoEl.value.play()
    statusMsg.value = 'Posicione o rosto na câmera'
    startAutoDetect()
  } catch {
    statusMsg.value = 'Câmera não disponível'
  }
}

function captureBlob() {
  const video = videoEl.value
  const canvas = canvasEl.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
}

async function hasFace() {
  if (!videoEl.value || videoEl.value.readyState !== 4) return false

  if (faceDetector) {
    try {
      const faces = await faceDetector.detect(videoEl.value)
      return faces && faces.length > 0
    } catch {
      // fallback to basic heuristic when FaceDetector fails
    }
  }

  const canvas = canvasEl.value
  const video = videoEl.value
  if (!canvas) return false

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let bright = 0
  let total = 0

  for (let i = 0; i < imageData.data.length; i += 16) {
    const r = imageData.data[i]
    const g = imageData.data[i + 1]
    const b = imageData.data[i + 2]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    if (lum > 40) bright += 1
    total += 1
  }

  return total > 0 && bright / total > 0.08
}

async function sendFrame() {
  if (cooldown || scanning.value) return

  if (!(await hasFace())) {
    statusMsg.value = 'Aguardando rosto na câmera'
    return
  }

  cooldown = true
  scanning.value = true
  statusMsg.value = 'Verificando...'
  try {
    const blob = await captureBlob()
    const res = await verificarRosto(blob)
    const accepted = res.data === true || String(res.data).toLowerCase() === 'true'
    result.value = accepted ? 'granted' : 'denied'
    statusMsg.value = ''
  } catch {
    result.value = 'denied'
    statusMsg.value = ''
  } finally {
    scanning.value = false
    setTimeout(() => {
      result.value = null
      statusMsg.value = 'Posicione o rosto na câmera'
      cooldown = false
    }, 5000)
  }
}

function startAutoDetect() {
  // Auto-send while camera is active; only verify if a face is detected.
  detectInterval = setInterval(() => {
    if (videoEl.value && videoEl.value.readyState === 4 && !scanning.value && !cooldown) {
      sendFrame()
    }
  }, 1000)
}

function goVisitante() {
  router.push('/acesso/visitante')
}

onMounted(startCamera)
onUnmounted(() => {
  clearInterval(detectInterval)
  stream?.getTracks().forEach(t => t.stop())
})
</script>

<style scoped>
.cam-wrapper {
  width: 560px;
  max-width: 95vw;
  height: 340px;
  position: relative;
}

.cam-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.visitor-btn {
  padding: 12px 40px;
  font-size: 0.95rem;
  letter-spacing: 2px;
}

.status-msg {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.65);
  letter-spacing: 1px;
}

.scan-ring {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  border: 3px solid rgba(100,200,255,0.7);
  animation: pulse-ring 1.2s ease infinite;
  z-index: 6;
  pointer-events: none;
}
</style>
