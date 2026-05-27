# FACEPORT Frontend

Frontend Vue.js 3 para o sistema FACEPORT de controle de acesso com reconhecimento facial.

## Tecnologias

- **Vue 3** + Composition API
- **Vue Router 4** — rotas com guards de autenticação
- **Pinia** — gerenciamento de estado (auth + toasts)
- **Axios** — chamadas HTTP com injeção automática de JWT
- **Vite** — build tool

---

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O Vite fará proxy de `/api` → `http://localhost:8080` automaticamente.  
Se o backend rodar em outra porta, edite `vite.config.js`.

## Build para produção

```bash
npm run build
```

---

## Telas

| Rota | Descrição | Acesso |
|---|---|---|
| `/acesso` | Totem principal — scan facial automático | Público |
| `/acesso/visitante` | Tela SSE + numpad para visitante digitar CPF e código | Público |
| `/login` | Login com email e senha | Público |
| `/morador/solicitar-visitante` | Morador gera código de acesso para visitante | MORADOR |
| `/admin` | Painel admin: listar/criar/deletar moradores, funcionários e admins | ADMIN |

---

## Endpoints cobertos

| Endpoint | Método | Tela |
|---|---|---|
| `POST /login` | POST | `/login` |
| `GET /morador` | GET | `/admin` |
| `POST /morador` | POST (multipart) | `/admin` → modal criar |
| `DELETE /morador/{cpf}` | DELETE | `/admin` |
| `POST /morador/solicitar/{cpf}` | POST | `/morador/solicitar-visitante` |
| `GET /funcionario` | GET | `/admin` |
| `POST /funcionario` | POST (multipart) | `/admin` → modal criar |
| `DELETE /funcionario/{cpf}` | DELETE | `/admin` |
| `GET /admin` | GET | `/admin` |
| `POST /admin` | POST | `/admin` → modal criar |
| `DELETE /admin/{cpf}` | DELETE | `/admin` |
| `POST /totem` | POST (multipart foto) | `/acesso` |
| `GET /acesso/stream` | SSE | `/acesso/visitante` |

---

## Fluxo de autenticação

1. Login retorna JWT via `POST /login`
2. Token salvo no `localStorage`
3. Role detectada automaticamente tentando `GET /admin` → `ADMIN`, ou `GET /morador` → `MORADOR`
4. Redirect automático para tela correta da role

## Fluxo SSE (Visitante)

1. Frontend abre `EventSource` em `/api/acesso/stream`
2. Arduino envia dígitos via serial → backend → SSE eventos `DIGITO`, `CPF`, `CODIGO`, `RESULTADO`, `RESET`
3. Visitor pode também usar o numpad virtual na tela (fallback sem Arduino)
# FacePort_web
