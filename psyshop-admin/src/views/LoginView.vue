<template>
  <main class="login-container">
    <section class="login-card">
      <h1>PsyShop</h1>
      <p class="subtitle">Panel de administración</p>

      <form @submit.prevent="iniciarSesion">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model.trim="email" type="email" placeholder="admin@psyshop.com" autocomplete="username"
          required />

        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" placeholder="Ingresa tu contraseña"
          autocomplete="current-password" required />

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>
    </section>
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
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #10131c;
  color: #f8fafc;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  border: 1px solid #303747;
  border-radius: 18px;
  background: #1a2030;
  box-shadow: 0 20px 50px #0005;
}

h1 {
  margin: 0;
  text-align: center;
  font-size: 34px;
  color: #8b9cff;
}

.subtitle {
  margin-bottom: 28px;
  text-align: center;
  color: #aab3c5;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  font-size: 14px;
  font-weight: 600;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  border: 1px solid #3b4559;
  border-radius: 8px;
  background: #111724;
  color: white;
}

button {
  margin-top: 12px;
  padding: 13px;
  border: 0;
  border-radius: 8px;
  background: #687cff;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.error {
  color: #ff9292;
  font-size: 14px;
}
</style>
