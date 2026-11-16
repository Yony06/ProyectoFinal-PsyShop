<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-icon">P</span>
        <span class="brand-name">Psy<span class="accent">Shop</span></span>
      </div>

      <p class="menu-label">Menú principal</p>

      <nav class="navigation" aria-label="Menú principal">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/videojuegos" class="nav-item" active-class="active">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="6" x2="10" y1="11" y2="11" />
            <line x1="8" x2="8" y1="9" y2="13" />
            <line x1="15" x2="15.01" y1="12" y2="12" />
            <line x1="18" x2="18.01" y1="10" y2="10" />
            <path
              d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z" />
          </svg>
          <span>Videojuegos</span>
        </router-link>

        <router-link to="/pedidos" class="nav-item" active-class="active">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m7.5 4.27 9 5.15" />
            <path
              d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
          <span>Pedidos</span>
        </router-link>

        <router-link to="/inventario" class="nav-item" active-class="active">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          <span>Inventario</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <p class="system-status">
          <span class="status-dot"></span>
          Sistema PsyShop
        </p>
        <small>Panel administrativo</small>
      </div>

      <button class="logout-button" aria-label="Cerrar sesión" @click="pedirConfirmacion">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
        <span class="logout-text">Cerrar sesión</span>
      </button>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div>
          <p class="crumb">Administración</p>
          <h1>{{ tituloPagina }}</h1>
        </div>

        <div class="admin-profile">
          <div class="avatar">{{ obtenerNombre().charAt(0).toUpperCase() }}</div>
          <div class="profile-text">
            <strong>{{ obtenerNombre() }}</strong>
            <small>Gestión de PsyShop</small>
          </div>
        </div>
      </header>

      <router-view />
    </main>

    <!-- Confirmación para cerrar sesión -->
    <div v-if="confirmando" class="confirm-overlay" @click.self="cancelar" @keydown.esc="cancelar">
      <div class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
        aria-describedby="confirm-text">
        <div class="confirm-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </div>

        <h2 id="confirm-title">¿Cerrar sesión?</h2>
        <p id="confirm-text">
          Saldrás del panel de administración. Podrás volver a entrar con tu
          cuenta cuando quieras.
        </p>

        <div class="confirm-actions">
          <button ref="btnCancelar" type="button" class="confirm-cancel" :disabled="cargando" @click="cancelar">
            Cancelar
          </button>

          <button type="button" class="confirm-ok" :disabled="cargando" @click="cerrarSesion">
            {{ cargando ? 'Cerrando...' : 'Sí, cerrar sesión' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import api from './api';

export default {
  name: 'App',

  // "cargando" se usaba sin estar declarada; ahora se declara aquí
  data() {
    return {
      cargando: false,
      confirmando: false
    };
  },

  computed: {
    tituloPagina() {
      if (this.$route.path === '/videojuegos') return 'Videojuegos';
      if (this.$route.path === '/pedidos') return 'Pedidos';
      if (this.$route.path === '/inventario') return 'Inventario';
      if (this.$route.path === '/login') return 'Iniciar sesión';
      return 'Dashboard';
    }
  },

  methods: {
    // Nombre del usuario guardado en el login; si no hay, "Administrador"
    obtenerNombre() {
      try {
        const usuario = JSON.parse(localStorage.getItem('user') || 'null');
        return usuario && usuario.name ? usuario.name : 'Administrador';
      } catch (error) {
        return 'Administrador';
      }
    },

    pedirConfirmacion() {
      this.confirmando = true;
      // El foco empieza en "Cancelar": la opción segura
      this.$nextTick(() => {
        if (this.$refs.btnCancelar) this.$refs.btnCancelar.focus();
      });
    },

    cancelar() {
      if (this.cargando) return;
      this.confirmando = false;
    },

    async cerrarSesion() {
      this.cargando = true;
      try {
        await api.post('/logout');

        // 1. Limpiar el token guardado
        localStorage.removeItem('token');

        // 2. Redirigir de vuelta al Login
        this.$router.push('/login');

      } catch (error) {
        console.error('Error al cerrar sesión');
      } finally {
        this.cargando = false;
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
}
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap');

/* ============================================================
   PsyShop · Admin (mismo estilo que la tienda)
   Estas variables quedan disponibles para TODAS las vistas del admin.
   ============================================================ */
:root {
  --void: #05060f;
  --deck: #0c1024;
  --deck-2: #121838;
  --edge: rgba(130, 160, 255, 0.2);
  --text: #e8ecff;
  --dim: #8c95b8;
  --cyan: #19e3ff;
  --violet: #7a5cff;
  --hot: #ff3d8b;
  --ok: #3ddc97;
  --warn: #ffb02e;

  --font-display: 'Chakra Petch', 'Segoe UI', sans-serif;
  --font-body: 'Barlow', 'Segoe UI', sans-serif;

  --cut: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
  --cut-sm: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--void);
  color: var(--text);
  font-family: var(--font-body);
}

h1,
h2,
h3 {
  font-family: var(--font-display);
}

.admin-layout {
  display: flex;
  height: 100vh;
  /* Cambiado de min-height a height fijo */
  overflow: hidden;
  /* Evita el scroll general de la página entera */
  background: var(--void);
}

/* ---------- Menú lateral ---------- */
.sidebar {
  /* Se elimina "position: sticky" y "top: 0" porque el padre ya controla la altura */
  align-self: flex-start;
  width: 260px;
  min-width: 260px;
  height: 100vh;
  /* Ocupa exactamente el alto de la ventana */
  padding: 26px 16px 20px;
  display: flex;
  flex-direction: column;
  background: var(--deck);
  border-right: 1px solid var(--edge);
  overflow-y: auto;
  /* Agrega scroll solo si el menú es muy largo */
}

/* Opcional: Ocultar la barra de scroll del menú para mayor estética */
.sidebar::-webkit-scrollbar {
  display: none;
}

.sidebar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 38px;
  padding: 0 6px;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
}

.brand-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--cyan), var(--violet));
  color: #031018;
  font-size: 1.3rem;
  clip-path: var(--cut-sm);
}

.accent {
  color: var(--cyan);
}

.menu-label {
  margin: 0 0 12px 10px;
  color: var(--dim);
  font-size: 0.8rem;
  font-weight: 600;
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  color: var(--dim);
  text-decoration: none;
  font-family: var(--font-display);
  font-size: 0.98rem;
  font-weight: 600;
  clip-path: var(--cut-sm);
  transition: background 0.2s, color 0.2s;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.nav-item:hover {
  background: rgba(130, 160, 255, 0.08);
  color: var(--text);
}

.nav-item.active {
  background: rgba(25, 227, 255, 0.1);
  color: var(--cyan);
}

/* Barra de neón en la opción activa */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: var(--cyan);
  box-shadow: 0 0 10px var(--cyan);
}

.nav-item:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: -2px;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px 10px;
  color: var(--text);
  font-size: 0.9rem;
}

.system-status {
  display: flex;
  align-items: center;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
}

.sidebar-footer small {
  display: block;
  margin: 4px 0 0 16px;
  color: var(--dim);
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 50%;
  background: var(--ok);
  box-shadow: 0 0 8px var(--ok);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 13px 14px;
  border: 1px solid rgba(255, 61, 139, 0.4);
  background: rgba(255, 61, 139, 0.08);
  color: #ff8fb8;
  font-family: var(--font-display);
  font-size: 0.98rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  clip-path: var(--cut-sm);
  transition: background 0.2s, color 0.2s;
}

.logout-button:hover {
  background: rgba(255, 61, 139, 0.18);
  color: #ffd0e2;
}

.logout-button:focus-visible {
  outline: 2px solid var(--hot);
  outline-offset: 2px;
}

/* ---------- Contenido principal ---------- */
.main-content {
  position: relative;
  isolation: isolate;
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow-y: auto;
  /* Mantiene el scroll de arriba hacia abajo */
  overflow-x: hidden;
  /* OCULTA estrictamente el scroll de izquierda a derecha */
  padding: 30px 34px;
}

/* Resplandor violeta de fondo */
.main-content::before {
  content: '';
  position: absolute;
  top: -120px;
  right: -120px;
  width: 460px;
  height: 460px;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(circle, rgba(122, 92, 255, 0.28), transparent 65%);
  filter: blur(18px);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--edge);
}

.crumb {
  margin: 0 0 6px;
  color: var(--dim);
  font-size: 0.9rem;
}

.topbar h1 {
  margin: 0;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  line-height: 1.05;
  font-weight: 700;
  text-transform: uppercase;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px 6px 6px;
  background: var(--deck);
  border: 1px solid var(--edge);
  clip-path: var(--cut-sm);
}

.avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cyan), var(--violet));
  color: #031018;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
}

.profile-text strong,
.profile-text small {
  display: block;
}

.profile-text strong {
  font-family: var(--font-display);
  font-size: 0.98rem;
}

.profile-text small {
  margin-top: 2px;
  color: var(--dim);
}

/* ---------- Confirmación de cierre de sesión ---------- */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(5, 6, 15, 0.78);
  backdrop-filter: blur(4px);
  animation: confirm-fade 0.2s ease;
}

.confirm-dialog {
  width: min(380px, 100%);
  padding: 30px 24px 24px;
  text-align: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 61, 139, 0.2), transparent 60%),
    var(--deck);
  border: 1px solid rgba(255, 61, 139, 0.45);
  box-shadow: 0 0 34px rgba(255, 61, 139, 0.18);
  clip-path: var(--cut);
  animation: confirm-pop 0.22s ease;
}

.confirm-dialog h2 {
  margin: 14px 0 0;
  font-size: 1.5rem;
}

.confirm-dialog p {
  margin: 8px 0 0;
  color: #aab3d6;
  line-height: 1.5;
}

.confirm-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border: 2px solid var(--hot);
  border-radius: 50%;
  color: var(--hot);
  box-shadow: 0 0 22px rgba(255, 61, 139, 0.3);
}

.confirm-icon svg {
  width: 28px;
  height: 28px;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 24px;
}

.confirm-cancel,
.confirm-ok {
  padding: 13px 10px;
  border: 0;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  clip-path: var(--cut-sm);
  transition: filter 0.2s, background 0.2s;
}

.confirm-cancel:disabled,
.confirm-ok:disabled {
  opacity: 0.6;
  cursor: default;
}

.confirm-cancel:focus-visible,
.confirm-ok:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 2px;
}

.confirm-cancel {
  background: rgba(130, 160, 255, 0.14);
  color: var(--text);
}

.confirm-cancel:hover:not(:disabled) {
  background: rgba(130, 160, 255, 0.26);
}

.confirm-ok {
  background: var(--hot);
  color: #1a0410;
}

.confirm-ok:hover:not(:disabled) {
  filter: brightness(1.12);
}

@keyframes confirm-fade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes confirm-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

/* ---------- Pantallas pequeñas: el menú pasa arriba ---------- */
@media (max-width: 900px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    position: static;
    align-self: stretch;
    width: 100%;
    min-width: 0;
    height: auto;
    padding: 14px 16px;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    border-right: 0;
    border-bottom: 1px solid var(--edge);
  }

  .brand {
    margin: 0;
    font-size: 1.3rem;
  }

  .menu-label,
  .sidebar-footer {
    display: none;
  }

  /* El botón de salir queda arriba a la derecha, solo con el ícono */
  .logout-button {
    width: auto;
    margin-left: auto;
    padding: 10px 12px;
  }

  .logout-text {
    display: none;
  }

  /* Las opciones pasan a una fila que se desliza hacia los lados */
  .navigation {
    order: 3;
    flex-direction: row;
    width: 100%;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .navigation::-webkit-scrollbar {
    display: none;
  }

  .nav-item {
    flex: 0 0 auto;
    padding: 10px 14px;
    white-space: nowrap;
  }

  .nav-item.active::before {
    top: auto;
    left: 10px;
    right: 10px;
    bottom: 0;
    width: auto;
    height: 3px;
  }

  .main-content {
    padding: 22px 16px;
  }

  .topbar {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .profile-text {
    display: none;
  }

  .admin-profile {
    padding: 4px;
    border-radius: 50%;
    clip-path: none;
    border: 0;
    background: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {

  .confirm-overlay,
  .confirm-dialog {
    animation: none;
  }
}
</style>