<template>
  <main class="login-container">
    <section class="admin-card login-card">
      <div class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h1 class="glow-text">Psy<span class="text-cyan">Shop</span></h1>
      </div>

      <p class="subtitle crumb">Acceso seguro al sistema de administración</p>

      <form @submit.prevent="iniciarSesion" class="form-body">
        <label class="psy-label" for="email">
          Correo electrónico
          <input id="email" class="psy-input" v-model.trim="email" type="email" placeholder="admin@psyshop.com"
            autocomplete="username" required />
        </label>

        <label class="psy-label" for="password">
          Contraseña
          <input id="password" class="psy-input" v-model="password" type="password" placeholder="Ingresa tu contraseña"
            autocomplete="current-password" required />
        </label>

        <p v-if="error" class="message error">{{ error }}</p>

        <button class="btn-neon login-btn" type="submit" :disabled="cargando">
          <svg v-if="!cargando" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          {{ cargando ? 'Verificando acceso...' : 'Iniciar sesión' }}
        </button>
      </form>
    </section>

    <!-- Resplandores decorativos de fondo -->
    <div class="ambient-glow cyan"></div>
    <div class="ambient-glow violet"></div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api';

const email = ref('');
const password = ref('');
const error = ref('');
const cargando = ref(false);

async function iniciarSesion() {
  console.log('PSYSHOP: iniciarSesion se ejecutó');
  error.value = '';
  cargando.value = true;

  try {
    const respuesta = await api.post('/login', {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('token', respuesta.data.token);
    localStorage.setItem('user', JSON.stringify(respuesta.data.user));

    window.location.href = '/';
  } catch (e) {
    error.value =
      e.response?.data?.message ||
      'No se pudo iniciar sesión. Comprueba tus datos e intenta de nuevo.';
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
/* Las variables globales (--void, --deck, --cyan, etc.) se heredan de App.vue */

.login-container {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--void);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* Luces ambientales del fondo */
.ambient-glow {
  position: absolute;
  width: 40vw;
  height: 40vw;
  border-radius: 50%;
  filter: blur(80px);
  z-index: -1;
  opacity: 0.15;
  pointer-events: none;
}

.ambient-glow.cyan {
  top: -10%;
  left: -10%;
  background: var(--cyan);
}

.ambient-glow.violet {
  bottom: -10%;
  right: -10%;
  background: var(--violet);
}

/* Tarjeta principal */
.admin-card {
  background: var(--deck);
  border: 1px solid var(--edge);
  clip-path: var(--cut);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(130, 160, 255, 0.05);
  animation: login-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes login-pop {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

/* Cabecera */
.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.brand-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--cyan), var(--violet));
  color: #031018;
  clip-path: var(--cut);
  box-shadow: 0 0 20px rgba(25, 227, 255, 0.3);
}

.brand-icon svg {
  width: 32px;
  height: 32px;
}

.glow-text {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text);
  letter-spacing: 2px;
}

.text-cyan {
  color: var(--cyan);
  text-shadow: 0 0 15px rgba(25, 227, 255, 0.4);
}

.subtitle {
  text-align: center;
  margin-bottom: 34px;
}

.crumb {
  margin-top: 0;
  color: var(--dim);
  font-size: 0.95rem;
}

/* Formulario y controles */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.psy-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--dim);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
}

.psy-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(5, 6, 15, 0.6);
  border: 1px solid rgba(130, 160, 255, 0.15);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 1rem;
  clip-path: var(--cut-sm);
  transition: all 0.2s;
  outline: none;
}

.psy-input:focus {
  background: var(--void);
  border-color: var(--cyan);
  box-shadow: 0 0 15px rgba(25, 227, 255, 0.15);
}

.psy-input::placeholder {
  color: rgba(140, 149, 184, 0.3);
}

/* Mensajes de error */
.message {
  padding: 12px 16px;
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  clip-path: var(--cut-sm);
  border-left: 3px solid transparent;
}

.message.error {
  background: rgba(255, 61, 139, 0.1);
  border-left-color: var(--hot);
  color: #ff8fb8;
}

/* Botón de ingreso */
.btn-neon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 14px;
  background: linear-gradient(90deg, rgba(25, 227, 255, 0.1), rgba(122, 92, 255, 0.1));
  border: 1px solid var(--cyan);
  color: var(--cyan);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  text-transform: uppercase;
  cursor: pointer;
  clip-path: var(--cut-sm);
  transition: all 0.2s;
  box-shadow: inset 0 0 15px rgba(25, 227, 255, 0.1);
}

.btn-neon svg {
  width: 18px;
  height: 18px;
}

.btn-neon:hover:not(:disabled) {
  background: var(--cyan);
  color: #031018;
  box-shadow: 0 0 25px rgba(25, 227, 255, 0.4);
}

.btn-neon:disabled {
  opacity: 0.5;
  cursor: wait;
}
</style>