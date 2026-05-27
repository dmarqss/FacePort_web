<template>
  <div class="fp-screen">
    <CitySkyline />

    <div class="fp-header">
      <!-- Div vazia para manter o alinhamento do logo e do botão Criar idênticos ao original -->
      <div></div>
      
      <span class="fp-logo"></span>
      
      <button class="btn btn-primary" style="padding:10px 24px;font-size:0.9rem;" @click="openCreate">
        Criar
      </button>
    </div>

    <div class="fp-content" style="align-items:flex-start; padding-top:0; flex-direction:column; overflow:hidden;">
      <!-- Tabs -->
      <div class="fp-tabs" style="width:100%; max-width:860px; margin:0 auto;">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="fp-tab"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >{{ tab.label }}</button>
        
        <!-- Botão Sair apenas com a adição do contorno (border e border-radius) -->
        <button class="fp-tab" style="margin-left:auto; color:rgba(255,100,100,1); border: 1px solid rgba(255,100,100,1); border-radius: 6px; padding: 4px 16px;" @click="logout">Sair</button>
      </div>

      <!-- List card -->
      <div class="fp-card list-card">
        <div v-if="loading" style="display:flex;justify-content:center;padding:40px;">
          <div class="fp-spinner"></div>
        </div>

        <div v-else class="fp-list">
          <div v-if="currentList.length === 0" class="empty-msg">Nenhum registro encontrado.</div>

          <div v-for="item in currentList" :key="item.cpf || item.id" class="fp-list-row">
            <div class="row-info">
              <span class="fp-name">{{ item.nome }}</span>
              <span class="fp-cpf">CPF: {{ item.cpf }}</span>
              <span v-if="item.email" class="fp-info">{{ item.email }}</span>
              <span v-if="item.apartamento" class="fp-info">Apto: {{ item.apartamento }}</span>
              <span v-if="item.cargo" class="fp-info">Cargo: {{ item.cargo }}</span>
              <span v-if="item.horarioEntrada" class="fp-info">
                {{ item.horarioEntrada }} – {{ item.horarioSaida }}
              </span>
            </div>
            <button class="btn btn-danger" @click="confirmDelete(item)">Deletar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="modal" class="fp-modal-overlay" @click.self="modal = false">
      <div class="fp-modal create-modal">
        <h2>{{ createTitle }}</h2>

        <!-- Common fields -->
        <div class="modal-form">
          <div class="fp-input-group">
            <input class="fp-input" v-model="form.nome" placeholder="Nome completo" />
          </div>
          <div class="fp-input-group">
            <input class="fp-input" v-model="form.cpf" placeholder="CPF (somente números)" maxlength="14" @input="fmtFormCpf" />
          </div>

          <!-- Admin & Morador: email + senha -->
          <template v-if="activeTab !== 'funcionario'">
            <div class="fp-input-group">
              <input class="fp-input" v-model="form.email" placeholder="Email" type="email" />
            </div>
            <div class="fp-input-group">
              <input class="fp-input" v-model="form.senha" placeholder="Senha" type="password" />
            </div>
          </template>

          <!-- Morador: apartamento -->
          <template v-if="activeTab === 'morador'">
            <div class="fp-input-group">
              <input class="fp-input" v-model="form.apartamento" placeholder="Apartamento" />
            </div>
          </template>

          <!-- Funcionário fields -->
          <template v-if="activeTab === 'funcionario'">
            <div class="fp-input-group">
              <input class="fp-input" v-model="form.cargo" placeholder="Cargo" />
            </div>
            <div class="fp-input-group">
              <input type="time" class="fp-input" v-model="form.horarioEntrada" placeholder="Horário entrada (HH:MM)" />
            </div>
            <div class="fp-input-group">
              <input type="time" class="fp-input" v-model="form.horarioSaida" placeholder="Horário saída (HH:MM)" />
            </div>
          </template>

          <!-- Photo capture (morador + funcionário) -->
          <template v-if="activeTab !== 'admin'">
            <div class="photo-camera-area">
              <div class="fp-camera-box">
                <div class="fp-camera-label">Captura de foto</div>
                <template v-if="cameraActive">
                  <video ref="videoEl" autoplay playsinline muted class="cam-video"></video>
                </template>
                <template v-else>
                  <div class="camera-placeholder">
                    {{ cameraStatus }}
                  </div>
                </template>
              </div>

              <canvas ref="canvasEl" style="display:none"></canvas>

              <div class="photo-actions">
                <button class="btn btn-outline" type="button" @click="toggleCamera">
                  {{ cameraActive ? 'Parar câmera' : 'Abrir câmera' }}
                </button>
                <button
                  class="btn btn-primary"
                  type="button"
                  :disabled="!cameraActive"
                  @click="capturePhoto"
                >
                  {{ capturedPhoto ? 'Tirar outra foto' : 'Tirar foto' }}
                </button>
              </div>

              <div v-if="capturedPhoto" class="photo-preview">
                <img :src="capturedPhoto" alt="Foto capturada" />
              </div>
            </div>
          </template>
        </div>

        <div class="fp-modal-actions">
          <button class="btn btn-outline" @click="modal = false">Cancelar</button>
          <button class="btn btn-primary" @click="submitCreate" :disabled="creating">
            <span v-if="creating" class="fp-spinner" style="width:18px;height:18px;border-width:2px"></span>
            <span v-else>Salvar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <div v-if="deleteTarget" class="fp-modal-overlay" @click.self="deleteTarget = null">
      <div class="fp-modal">
        <h2>Confirmar exclusão</h2>
        <p style="text-align:center;color:rgba(255,255,255,0.7);font-size:0.9rem;margin-top:8px;">
          Deseja deletar <strong style="color:var(--white)">{{ deleteTarget.nome }}</strong>?
          <br>CPF: {{ deleteTarget.cpf }}
        </p>
        <div class="fp-modal-actions">
          <button class="btn btn-outline" @click="deleteTarget = null">Cancelar</button>
          <button class="btn btn-danger" style="padding:10px 24px;" @click="doDelete" :disabled="deleting">
            <span v-if="deleting" class="fp-spinner" style="width:18px;height:18px;border-width:2px"></span>
            <span v-else>Deletar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  getMoradores, createMorador, deleteMorador,
  getFuncionarios, createFuncionario, deleteFuncionario,
  getAdmins, createAdmin, deleteAdmin
} from '@/services/api'
import CitySkyline from '@/components/CitySkyline.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const tabs = [
  { key: 'morador', label: 'Moradores' },
  { key: 'funcionario', label: 'Funcionários' },
  { key: 'admin', label: 'Admins' },
]

const activeTab = ref('morador')
const lists = ref({ morador: [], funcionario: [], admin: [] })
const loading = ref(false)
const showNav = ref(false)

const modal = ref(false)
const creating = ref(false)
const form = ref({})
const photoFile = ref(null)
const photoInput = ref(null)
const videoEl = ref(null)
const canvasEl = ref(null)
const cameraActive = ref(false)
const cameraStatus = ref('Clique em Abrir câmera para capturar a foto')
const capturedPhoto = ref(null)
let cameraStream = null

const deleteTarget = ref(null)
const deleting = ref(false)

const currentList = computed(() => lists.value[activeTab.value] || [])
const createTitle = computed(() => ({
  morador: 'Novo Morador',
  funcionario: 'Novo Funcionário',
  admin: 'Novo Administrador'
}[activeTab.value]))

async function loadAll() {
  loading.value = true
  try {
    const [m, f, a] = await Promise.all([getMoradores(), getFuncionarios(), getAdmins()])
    lists.value.morador = m.data
    lists.value.funcionario = f.data
    lists.value.admin = a.data
  } catch {
    toast.show('Erro ao carregar dados', 'error')
  } finally {
    loading.value = false
  }
}

function switchTab(key) {
  activeTab.value = key
}

function openCreate() {
  form.value = { nome: '', cpf: '', email: '', senha: '', apartamento: '', cargo: '', horarioEntrada: '', horarioSaida: '' }
  photoFile.value = null
  capturedPhoto.value = null
  cameraStatus.value = 'Clique em Abrir câmera para capturar a foto'
  cameraActive.value = false
  stopCamera()
  modal.value = true
}

function fmtFormCpf() {
  let v = form.value.cpf.replace(/\D/g, '').slice(0, 11)
  if (v.length > 9)      v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9)}`
  else if (v.length > 6) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`
  else if (v.length > 3) v = `${v.slice(0,3)}.${v.slice(3)}`
  form.value.cpf = v
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop())
    cameraStream = null
  }
  cameraActive.value = false
}

async function toggleCamera() {
  if (cameraActive.value) {
    stopCamera()
    cameraStatus.value = 'Clique em Abrir câmera para capturar a foto'
    return
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
    cameraActive.value = true
    await nextTick()

    const video = videoEl.value
    if (!video) throw new Error('Video element not mounted')

    video.srcObject = cameraStream
    await video.play()
    cameraStatus.value = 'Posicione o rosto e tire a foto'
  } catch (error) {
    stopCamera()
    cameraStatus.value = 'Câmera não disponível ou acesso negado'
  }
}

async function capturePhoto() {
  if (!videoEl.value || !canvasEl.value || videoEl.value.readyState !== 4) {
    toast.show('Câmera não pronta.', 'error')
    return
  }

  const video = videoEl.value
  const canvas = canvasEl.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) {
    toast.show('Erro ao capturar a foto.', 'error')
    return
  }

  photoFile.value = new File([blob], 'face.jpg', { type: 'image/jpeg' })
  capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.85)
  cameraStatus.value = 'Foto pronta para envio'
}

async function submitCreate() {
  const cpfRaw = form.value.cpf.replace(/\D/g, '')
  if (!form.value.nome || cpfRaw.length !== 11) {
    toast.show('Preencha nome e CPF corretamente.', 'error'); return
  }

  creating.value = true
  try {
    if (activeTab.value === 'admin') {
      await createAdmin({
        nome: form.value.nome,
        cpf: cpfRaw,
        email: form.value.email,
        senha: form.value.senha
      })
    } else {
      if (!photoFile.value) { toast.show('Foto obrigatória', 'error'); creating.value = false; return }
      const fd = new FormData()
      const dados = { nome: form.value.nome, cpf: cpfRaw }
      if (activeTab.value === 'morador') {
        Object.assign(dados, { email: form.value.email, senha: form.value.senha, apartamento: form.value.apartamento })
        fd.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
        fd.append('foto', photoFile.value)
        await createMorador(fd)
      } else {
        Object.assign(dados, { cargo: form.value.cargo, horarioEntrada: form.value.horarioEntrada, horarioSaida: form.value.horarioSaida })
        fd.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
        fd.append('foto', photoFile.value)
        await createFuncionario(fd)
      }
    }
    toast.show('Criado com sucesso!', 'success')
    modal.value = false
    stopCamera()
    loadAll()
  } catch {
    toast.show('Erro ao criar. Verifique os dados.', 'error')
  } finally {
    creating.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  const cpf = deleteTarget.value.cpf
  try {
    if (activeTab.value === 'morador')     await deleteMorador(cpf)
    else if (activeTab.value === 'funcionario') await deleteFuncionario(cpf)
    else await deleteAdmin(cpf)
    toast.show('Deletado com sucesso!', 'success')
    deleteTarget.value = null
    loadAll()
  } catch {
    toast.show('Erro ao deletar.', 'error')
  } finally {
    deleting.value = false
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}

watch(modal, (value) => {
  if (!value) {
    stopCamera()
  }
})

onMounted(loadAll)
</script>

<style scoped>
.list-card {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.row-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  flex: 1;
  align-items: center;
}

.empty-msg {
  text-align: center;
  color: rgba(255,255,255,0.4);
  padding: 40px;
  font-size: 0.9rem;
}

.create-modal {
  max-width: 500px;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.photo-upload-area {
  border: 1.5px dashed rgba(255,255,255,0.3);
  border-radius: 10px;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.55);
  transition: all 0.18s;
  margin-top: 4px;
}

.photo-upload-area:hover, .photo-upload-area.hasPhoto {
  border-color: rgba(255,255,255,0.6);
  color: var(--white);
  background: rgba(255,255,255,0.06);
}

.photo-camera-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.fp-camera-box {
  position: relative;
  min-height: 240px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(150,200,255,0.4);
  box-shadow: 0 0 30px rgba(0,80,255,0.2);
  background: #0a2060;
}

.fp-camera-box video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.7);
  padding: 24px;
  text-align: center;
}

.photo-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.photo-preview img {
  width: 100%;
  max-height: 260px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
}
</style>