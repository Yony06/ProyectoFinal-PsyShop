<template>
  <div class="dashboard-content">
    <section class="welcome admin-card">
      <div>
        <p class="eyebrow">CENTRO DE CONTROL</p>
        <h2 class="glow-text">Bienvenido a PsyShop</h2>
        <p class="crumb">Administra tu tienda de videojuegos desde un solo lugar.</p>
      </div>
      <div class="welcome-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2"></rect>
          <path d="M6 12h4"></path>
          <path d="M8 10v4"></path>
          <circle cx="15" cy="13" r="1"></circle>
          <circle cx="18" cy="11" r="1"></circle>
        </svg>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-top">
          <span>Videojuegos</span>
          <span class="stat-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <path d="M6 12h4"></path>
              <path d="M8 10v4"></path>
              <circle cx="15" cy="13" r="1"></circle>
              <circle cx="18" cy="11" r="1"></circle>
            </svg>
          </span>
        </div>
        <!-- Total de videojuegos activos -->
        <h3 class="stat-value">{{ cargandoDatos ? '...' : totalVideojuegos }}</h3>
        <p class="crumb">Productos registrados</p>
      </article>

      <article class="stat-card">
        <div class="stat-top">
          <span>Pedidos</span>
          <span class="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </span>
        </div>
        <!-- Total de pedidos -->
        <h3 class="stat-value">{{ cargandoDatos ? '...' : totalPedidos }}</h3>
        <p class="crumb">Pedidos en total</p>
      </article>

      <article class="stat-card">
        <div class="stat-top">
          <span>Pendientes</span>
          <span class="stat-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
        </div>
        <!-- Pedidos pendientes -->
        <h3 class="stat-value text-warn">{{ cargandoDatos ? '...' : pedidosPendientes }}</h3>
        <p class="crumb">Por gestionar</p>
      </article>

      <article class="stat-card">
        <div class="stat-top">
          <span>Ventas registradas</span>
          <span class="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </span>
        </div>
        <!-- Total de ventas completadas -->
        <h3 class="stat-value text-cyan">{{ cargandoDatos ? '...' : formatearPrecio(totalVentas) }}</h3>
        <p class="crumb">Ingresos completados</p>
      </article>
    </section>

    <!-- Si hay error al cargar datos, lo mostramos -->
    <p v-if="error" class="message error" style="margin-bottom: 30px;">{{ error }}</p>

    <section class="admin-card content-card">
      <div class="card-header section-heading">
        <div>
          <h3>Accesos rápidos</h3>
          <p class="crumb">Administra las áreas principales de la tienda.</p>
        </div>
      </div>

      <div class="card-body quick-grid">
        <router-link to="/videojuegos" class="quick-item">
          <span class="quick-icon text-cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <path d="M6 12h4"></path>
              <path d="M8 10v4"></path>
              <circle cx="15" cy="13" r="1"></circle>
              <circle cx="18" cy="11" r="1"></circle>
            </svg>
          </span>
          <div class="quick-text">
            <strong>Videojuegos</strong>
            <p class="crumb">Gestionar el catálogo</p>
          </div>
          <span class="arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </router-link>

        <router-link to="/pedidos" class="quick-item">
          <span class="quick-icon text-violet">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </span>
          <div class="quick-text">
            <strong>Pedidos</strong>
            <p class="crumb">Consultar las compras</p>
          </div>
          <span class="arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </router-link>

        <router-link to="/inventario" class="quick-item">
          <span class="quick-icon text-hot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </span>
          <div class="quick-text">
            <strong>Inventario</strong>
            <p class="crumb">Revisar existencias</p>
          </div>
          <span class="arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </router-link>
      </div>
    </section>

    <footer class="footer">
      <span class="status-dot available"></span> PsyShop Admin · Panel de gestión
    </footer>
  </div>
</template>

<script>
import axios from 'axios';

// Configuración de axios para llamar a la API
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  name: 'HomeView',

  data() {
    return {
      cargandoDatos: true,
      error: '',

      // Variables dinámicas para el dashboard
      totalVideojuegos: 0,
      totalPedidos: 0,
      pedidosPendientes: 0,
      totalVentas: 0,
    };
  },

  mounted() {
    this.cargarDatosDashboard();
  },

  methods: {
    async cargarDatosDashboard() {
      this.cargandoDatos = true;
      this.error = '';

      try {
        // Hacemos las dos peticiones al mismo tiempo para mayor velocidad
        const [respuestaJuegos, respuestaPedidos] = await Promise.all([
          api.get('/games'),
          api.get('/admin/orders?page=1') // Consultamos la primera página de pedidos
        ]);

        // 1. Procesar Videojuegos
        const juegos = Array.isArray(respuestaJuegos.data)
          ? respuestaJuegos.data
          : respuestaJuegos.data.data || [];

        this.totalVideojuegos = juegos.length;

        // 2. Procesar Pedidos
        const pedidos = respuestaPedidos.data.data || [];

        // Asignamos el total de pedidos
        this.totalPedidos = pedidos.length;

        // Filtramos cuántos están en estado 'pending'
        this.pedidosPendientes = pedidos.filter(p => p.status === 'pending').length;

        // Sumamos el total ($) de los pedidos que están 'completed'
        this.totalVentas = pedidos
          .filter(p => p.status === 'completed')
          .reduce((suma, pedido) => suma + Number(pedido.total || 0), 0);

      } catch (e) {
        this.error = 'No se pudieron cargar los datos actualizados. Verifica la conexión con el servidor.';
        console.error(e);
      } finally {
        this.cargandoDatos = false;
      }
    },

    formatearPrecio(precio) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(Number(precio));
    },
  },
};
</script>

<style scoped>
/* Las variables como --void, --deck, --cyan etc. se heredan de App.vue */

.dashboard-content {
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

/* Tarjetas globales */
.admin-card,
.stat-card {
  background: var(--deck);
  border: 1px solid var(--edge);
  clip-path: var(--cut);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--edge);
  background: rgba(130, 160, 255, 0.02);
}

.card-header h3 {
  margin: 0 0 4px;
  font-size: 1.3rem;
  color: var(--text);
}

.card-body {
  padding: 24px;
}

/* Sección Welcome */
.welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 30px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, var(--deck), rgba(122, 92, 255, 0.15));
  position: relative;
  overflow: hidden;
}

/* Brillo extra en el welcome */
.welcome::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(25, 227, 255, 0.15), transparent 70%);
  pointer-events: none;
}

.eyebrow {
  color: var(--violet);
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0 0 8px;
}

.glow-text {
  margin: 0 0 8px;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  text-shadow: 0 0 20px rgba(122, 92, 255, 0.3);
}

.crumb {
  margin: 0;
  color: var(--dim);
  font-size: 0.9rem;
}

.welcome-icon {
  color: var(--cyan);
  filter: drop-shadow(0 0 15px rgba(25, 227, 255, 0.3));
}

.welcome-icon svg {
  width: 70px;
  height: 70px;
}

/* Grid de Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 22px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-color: rgba(130, 160, 255, 0.4);
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: var(--dim);
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  clip-path: var(--cut-sm);
}

.stat-icon svg {
  width: 18px;
  height: 18px;
}

.purple {
  background: rgba(122, 92, 255, 0.15);
  color: #bfaaff;
  border: 1px solid rgba(122, 92, 255, 0.3);
}

.blue {
  background: rgba(25, 227, 255, 0.15);
  color: var(--cyan);
  border: 1px solid rgba(25, 227, 255, 0.3);
}

.orange {
  background: rgba(255, 176, 46, 0.15);
  color: var(--warn);
  border: 1px solid rgba(255, 176, 46, 0.3);
}

.green {
  background: rgba(61, 220, 151, 0.15);
  color: var(--ok);
  border: 1px solid rgba(61, 220, 151, 0.3);
}

.stat-value {
  margin: 0 0 6px;
  font-size: 2.2rem;
  color: var(--text);
  line-height: 1;
}

.text-cyan {
  color: var(--cyan) !important;
}

.text-violet {
  color: var(--violet) !important;
}

.text-hot {
  color: var(--hot) !important;
}

.text-warn {
  color: var(--warn) !important;
}

/* Grid de Accesos Rápidos */
.content-card {
  margin-bottom: 30px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(5, 6, 15, 0.4);
  border: 1px solid rgba(130, 160, 255, 0.1);
  color: var(--text);
  text-decoration: none;
  clip-path: var(--cut-sm);
  transition: all 0.2s;
  cursor: pointer;
}

.quick-item:hover {
  background: rgba(130, 160, 255, 0.08);
  border-color: rgba(130, 160, 255, 0.3);
  transform: translateX(4px);
}

.quick-icon svg {
  width: 28px;
  height: 28px;
}

.quick-text strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.arrow {
  margin-left: auto;
  color: var(--dim);
  transition: color 0.2s, transform 0.2s;
}

.arrow svg {
  width: 20px;
  height: 20px;
}

.quick-item:hover .arrow {
  color: var(--cyan);
  transform: translateX(3px);
}

/* Mensaje de error */
.message {
  padding: 14px 18px;
  font-family: var(--font-display);
  font-weight: 600;
  clip-path: var(--cut-sm);
  border-left: 3px solid transparent;
}

.message.error {
  background: rgba(255, 61, 139, 0.1);
  border-left-color: var(--hot);
  color: #ff8fb8;
}

/* Footer local */
.footer {
  padding: 10px 0;
  color: var(--dim);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.available {
  background: var(--ok);
  box-shadow: 0 0 8px var(--ok);
}

/* Responsive */
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .welcome {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }

  .welcome-icon {
    align-self: flex-end;
    margin-top: -30px;
    opacity: 0.5;
  }

  .quick-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 550px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>