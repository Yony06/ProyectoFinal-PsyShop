<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-icon">P</span>
        <span>Psy<span class="accent">Shop</span></span>
      </div>

      <p class="menu-label">MENÚ PRINCIPAL</p>

      <nav class="navigation">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <span>▦</span> Dashboard
        </router-link>

        <router-link to="/videojuegos" class="nav-item" active-class="active">
          <span>🎮</span> Videojuegos
        </router-link>

        <router-link to="/pedidos" class="nav-item" active-class="active">
          <span class="nav-icon">📦</span>
          <span>Pedidos</span>
        </router-link>

        <router-link to="/inventario" class="nav-item" active-class="active">
          <span class="nav-icon">📊</span>
          <span>Inventario</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <span class="status-dot"></span>
        Sistema PsyShop
        <small>Panel administrativo</small>
      </div>
      <button class="logout-button" @click="cerrarSesion">
        ↪ Cerrar sesión
      </button>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div>
          <p class="eyebrow">ADMINISTRACIÓN</p>
          <h1>{{ tituloPagina }}</h1>
        </div>

        <div class="admin-profile">
          <div class="avatar">A</div>
          <div>
            <strong>Administrador</strong>
            <small>Gestión de PsyShop</small>
          </div>
        </div>
      </header>

      <router-view />
    </main>
  </div>
</template>


<script>
import api from './api';

export default {
  name: 'App',

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
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #100f16;
  color: #f5f3fa;
  font-family: Arial, Helvetica, sans-serif;
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #100f16;
}

.sidebar {
  width: 250px;
  min-width: 250px;
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  background: #17151f;
  border-right: 1px solid #292536;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 45px;
  font-size: 23px;
  font-weight: bold;
}

.brand-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #8b5cf6;
  color: white;
}

.accent {
  color: #a78bfa;
}

.menu-label {
  margin: 0 0 14px 10px;
  color: #817a94;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 1.5px;
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  color: #bcb7ca;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}

.nav-item:hover,
.nav-item.active {
  background: #302345;
  color: #c4a7ff;
}

.sidebar-footer {
  margin-top: auto;
  padding: 18px 8px 0;
  color: #c6c0d2;
  font-size: 13px;
}

.sidebar-footer small {
  display: block;
  margin: 8px 0 0 16px;
  color: #817a94;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 50%;
  background: #4ade80;
}

.main-content {
  flex: 1;
  min-width: 0;
  padding: 30px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #a78bfa;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 2px;
}

.topbar h1 {
  margin: 0;
  font-size: 28px;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #382354;
  color: #c4a7ff;
  font-weight: bold;
}

.admin-profile strong,
.admin-profile small {
  display: block;
}

.admin-profile small {
  margin-top: 5px;
  color: #a6a0b5;
}

@media (max-width: 700px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-width: 0;
    padding: 18px;
  }

  .brand {
    margin-bottom: 20px;
  }

  .navigation {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-footer {
    margin-top: 20px;
  }

  .main-content {
    padding: 20px;
  }

  .topbar {
    align-items: flex-start;
  }

  .logout-button {
    width: 100%;
    margin-top: auto;
    padding: 12px;
    border: 1px solid #493044;
    border-radius: 10px;
    background: #281c2a;
    color: #ffb4c2;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
  }

  .logout-button:hover {
    background: #3b2335;
  }
}
</style>
