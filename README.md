<div align="center">

# 🏢 FACEPORT — Frontend

**Interface web do sistema de controle de acesso com reconhecimento facial**

[![Vue.js](https://img.shields.io/badge/Vue.js-3.4-42B883?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-2.1-FFD859?style=for-the-badge&logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![Axios](https://img.shields.io/badge/Axios-1.6-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)

</div>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Telas](#-telas)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
- [Variáveis e Configuração](#-variáveis-e-configuração)
- [Autenticação e Rotas](#-autenticação-e-rotas)
- [Integração com a API](#-integração-com-a-api)
- [SSE — Streaming em Tempo Real](#-sse--streaming-em-tempo-real)
- [Design System](#-design-system)
- [Geração por IA](#-geração-por-ia)
- [Autores](#-autores)

---

## 🎯 Sobre

O frontend do **Faceport** é a interface do sistema de controle de acesso do condomínio. Ele cobre todos os fluxos do produto:

- **Totem de acesso** com câmera ao vivo e reconhecimento facial automático
- **Portal do visitante** com numpad virtual e streaming SSE do Arduino
- **Painel do morador** para gerar códigos de acesso temporários
- **Painel administrativo** completo para gerenciar moradores, funcionários e admins — com captura de foto facial ao vivo no cadastro

O visual segue o estilo do protótipo original: fundo azul royal, cards com glassmorphism, tipografia Orbitron e a silhueta pixel-art da cidade ao fundo.

---

## 🖥 Telas

| Rota | Nome | Acesso | Descrição |
|------|------|--------|-----------|
| `/acesso` | Totem Principal | Público | Câmera ao vivo com reconhecimento facial automático a cada 4s. Overlay verde/vermelho ao identificar. Botão para acessar como visitante. |
| `/acesso/visitante` | Portal do Visitante | Público | Conecta via SSE ao backend e exibe em tempo real os dados digitados no teclado físico (Arduino). Inclui numpad virtual como fallback. Fluxo em fases: CPF → Código → Resultado. |
| `/login` | Login | Público | Autenticação por email e senha. Redireciona automaticamente para `/admin` ou `/morador/solicitar-visitante` conforme o role do JWT. |
| `/morador/solicitar-visitante` | Solicitar Acesso | MORADOR | Morador informa o CPF do visitante e recebe um código de 7 dígitos válido por 24h, com opção de copiar. |
| `/admin` | Painel Admin | ADMIN | Tabs para listar moradores, funcionários e admins. Criar novos cadastros via modal com câmera ao vivo para captura da foto facial. Excluir com confirmação. |

---

## 🛠 Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Vue.js | 3.4 | Framework reativo (Composition API + `<script setup>`) |
| Vite | 5.0 | Build tool e servidor de desenvolvimento |
| Vue Router | 4.3 | Roteamento SPA com navigation guards por role |
| Pinia | 2.1 | Gerenciamento de estado (authStore + toastStore) |
| Axios | 1.6 | Chamadas HTTP com interceptor de JWT automático |
| EventSource (nativo) | — | SSE para streaming de eventos do Arduino |
| MediaDevices API (nativa) | — | Acesso à câmera do dispositivo |
| CSS Custom Properties | — | Design system com variáveis de tema |
| Google Fonts — Orbitron + Exo 2 | — | Tipografia do sistema |

---

## 📁 Estrutura do Projeto

```
faceport-frontend/
│
├── index.html                        # Entry point HTML (carrega fontes Google)
├── vite.config.js                    # Config Vite + proxy /api → localhost:8080
├── package.json
│
└── src/
    ├── main.js                       # Inicializa Vue, Pinia e Router
    ├── App.vue                       # Root component — router-view + toast overlay global
    │
    ├── assets/
    │   └── global.css                # Design system completo:
    │                                 #   variáveis CSS, cards glassmorphism,
    │                                 #   botões, inputs, modal, numpad,
    │                                 #   spinner, badges, animações
    │
    ├── components/
    │   └── CitySkyline.vue           # SVG pixel-art da silhueta da cidade
    │                                 # (reutilizado em todas as telas)
    │
    ├── router/
    │   └── index.js                  # Rotas + beforeEach guard (auth + role)
    │
    ├── services/
    │   └── api.js                    # Axios com interceptor JWT.
    │                                 # Exporta funções para cada endpoint da API.
    │
    ├── stores/
    │   ├── auth.js                   # authStore (Pinia):
    │   │                             #   token JWT, role detectada, login, logout
    │   └── toast.js                  # toastStore (Pinia):
    │                                 #   fila de notificações com auto-dismiss
    │
    └── views/
        ├── LoginView.vue             # /login
        ├── AcessoView.vue            # /acesso  (totem + câmera)
        ├── VisitanteView.vue         # /acesso/visitante  (SSE + numpad)
        ├── SolicitarVisitanteView.vue# /morador/solicitar-visitante
        └── AdminView.vue             # /admin  (painel completo)
```

---

## 📦 Pré-requisitos

- **Node.js 18+**
- **npm 9+** (ou pnpm/yarn equivalente)
- **API Faceport** rodando em `http://localhost:8080`
- Navegador com suporte a **MediaDevices API** (câmera) e **EventSource** (SSE)

---

## ▶️ Como Executar

### 1. Instale as dependências

```bash
npm install
```

### 2. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará em: **`http://localhost:5173`**

O Vite faz proxy automático de todas as requisições `/api/*` para `http://localhost:8080`, eliminando problemas de CORS durante o desenvolvimento.

### 3. Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados em `dist/`. Para servir localmente:

```bash
npm run preview
```

---

## ⚙️ Variáveis e Configuração

### Proxy da API

Configurado em `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',  // ← altere aqui se a API rodar em outra porta
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

Para apontar para um backend em produção, basta alterar o `target`.

### Token JWT

O token é salvo no `localStorage` com a chave `faceport_token` e o role com `faceport_role`. O interceptor do Axios injeta automaticamente o header `Authorization: Bearer <token>` em todas as requisições.

---

## 🔐 Autenticação e Rotas

O fluxo de autenticação funciona assim:

```
POST /login  →  JWT retornado
      │
      ▼
authStore salva token + detecta role
      │
      ├── GET /admin   →  200 OK  →  role = ADMIN    →  redireciona para /admin
      └── GET /morador →  200 OK  →  role = MORADOR  →  redireciona para /morador/solicitar-visitante
```

### Navigation Guards

O `router/index.js` protege as rotas privadas:

| Situação | Comportamento |
|---|---|
| Rota pública | Sempre acessível |
| Rota privada sem token | Redireciona para `/login` |
| ADMIN acessando rota de MORADOR | Redireciona para `/admin` |
| MORADOR acessando rota de ADMIN | Redireciona para `/morador/solicitar-visitante` |

### Roles

| Role | Tela restrita |
|---|---|
| `ADMIN` | `/admin` |
| `MORADOR` | `/morador/solicitar-visitante` |
| — (público) | `/acesso`, `/acesso/visitante`, `/login` |

---

## 🌐 Integração com a API

Todas as chamadas HTTP estão centralizadas em `src/services/api.js`:

```javascript
// Autenticação
authLogin(email, senha)           // POST /login → { token }

// Moradores
getMoradores()                    // GET  /morador
createMorador(formData)           // POST /morador  (multipart: dados + foto)
deleteMorador(cpf)                // DELETE /morador/{cpf}
solicitarVisitante(cpf)           // POST /morador/solicitar/{cpf}

// Funcionários
getFuncionarios()                 // GET  /funcionario
createFuncionario(formData)       // POST /funcionario  (multipart: dados + foto)
deleteFuncionario(cpf)            // DELETE /funcionario/{cpf}

// Admins
getAdmins()                       // GET  /admin
createAdmin(data)                 // POST /admin  (JSON)
deleteAdmin(cpf)                  // DELETE /admin/{cpf}

// Totem
verificarRosto(blob)              // POST /totem  (multipart: foto capturada pela câmera)

// SSE
createSseUrl()                    // → '/api/acesso/stream'
```

### Captura de foto (câmera ao vivo)

Tanto no **totem** (`AcessoView`) quanto no **cadastro** (`AdminView`), a foto é capturada diretamente pelo browser usando a **MediaDevices API**:

```javascript
// Abre câmera
const stream = await navigator.mediaDevices.getUserMedia({ video: true })
videoEl.srcObject = stream

// Captura frame como Blob JPEG
const canvas = document.createElement('canvas')
canvas.getContext('2d').drawImage(videoEl, 0, 0)
canvas.toBlob((blob) => { /* envia para a API */ }, 'image/jpeg', 0.9)
```

No totem, a captura e envio são **automáticos a cada 4 segundos** quando a câmera detecta atividade.

---

## 📡 SSE — Streaming em Tempo Real

A tela `/acesso/visitante` se conecta ao endpoint SSE da API para receber em tempo real os eventos gerados pelo Arduino (teclado numérico físico):

```javascript
const sse = new EventSource('/api/acesso/stream')

sse.addEventListener('DIGITO',    (e) => { /* atualiza display */ })
sse.addEventListener('CPF',       (e) => { /* avança para fase código */ })
sse.addEventListener('CODIGO',    (e) => { /* aguarda resultado */ })
sse.addEventListener('RESULTADO', (e) => { /* "ABRIR" ou "NEGAR" */ })
sse.addEventListener('RESET',     (e) => { /* reinicia o fluxo */ })
```

### Fluxo visual em fases

```
[ CPF ]  →  [ CÓDIGO ]  →  [ RESULTADO ]
  │               │               │
  ▼               ▼               ▼
11 dígitos    7 dígitos      ✓ LIBERADO
digitados     digitados      ✗ NEGADO
```

O numpad virtual na tela funciona como **fallback** caso o Arduino não esteja conectado, permitindo testar o fluxo completo pelo browser.

---

## 🎨 Design System

O design foi inspirado nos protótipos originais do projeto e segue um estilo futurista de controle de acesso urbano.

### Paleta de cores (CSS Custom Properties)

```css
--blue-bg:        #1a6fff   /* fundo principal */
--blue-dark:      #1255cc
--blue-deeper:    #0d3fa3   /* botões primários */
--blue-card:      rgba(30, 100, 220, 0.55)  /* cards glassmorphism */
--text-green:     #39ff5a   /* acesso liberado / nomes */
--text-yellow:    #f0e040   /* CPF / código */
--text-red:       #ff3b3b   /* acesso negado / deletar */
```

### Tipografia

- **Orbitron** — títulos, logo, numpad, resultados (estilo tech/futurista)
- **Exo 2** — corpo, labels, botões (legibilidade)

### Componentes globais (`global.css`)

| Classe | Descrição |
|---|---|
| `.fp-screen` | Layout base de tela cheia |
| `.fp-card` | Card com glassmorphism e border sutil |
| `.fp-header` | Header com logo centralizado |
| `.btn-primary` | Botão azul escuro com hover lift |
| `.btn-outline` | Botão transparente com borda branca |
| `.btn-danger` | Botão vermelho para ações destrutivas |
| `.fp-input-group` | Input com ícone e linha inferior |
| `.fp-numpad` | Grid 3×4 do teclado numérico |
| `.fp-modal-overlay` | Overlay escurecido com blur |
| `.fp-toast-item` | Notificação deslizante (success/error/info) |
| `.fp-spinner` | Spinner de carregamento circular |
| `.fp-skyline` | Container da silhueta SVG da cidade |

### Silhueta pixel-art (`CitySkyline.vue`)

O rodapé de todas as telas exibe uma silhueta de cidade pixel-art desenhada em SVG puro — sem imagens externas. Inclui prédios de diferentes alturas, antenas e janelas estilizadas, tudo em tons de azul escuro sobre o fundo azul royal.

---


## 👥 Autores

| Nome |
|------|
| Davi Purcino Huffenbaecher Marques |
| Guilherme de Sousa Ostachuk |

---

<div align="center">

**FACEPORT Frontend** — Vue.js 3 · Vite · Pinia

</div>
