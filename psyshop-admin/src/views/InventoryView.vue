<template>
  <div class="inventory-page">
    <div class="page-header">
      <div>
        <h1 class="glow-text">Inventario</h1>
        <p class="crumb">Control de existencias de videojuegos de PsyShop.</p>
      </div>

      <button class="btn-neon" @click="cargarInventario" :disabled="cargando">
        <span class="btn-icon">↻</span>
        {{ cargando ? 'Cargando...' : 'Actualizar inventario' }}
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total de videojuegos</span>
        <strong class="stat-value">{{ inventario.length }}</strong>
      </div>

      <div class="stat-card">
        <span class="stat-label">Unidades disponibles</span>
        <strong class="stat-value text-cyan">{{ totalUnidades }}</strong>
      </div>

      <div class="stat-card warning-card">
        <span class="stat-label">Stock bajo</span>
        <strong class="stat-value text-warn">{{ productosStockBajo }}</strong>
      </div>

      <div class="stat-card error-card">
        <span class="stat-label">Sin existencias</span>
        <strong class="stat-value text-hot">{{ productosAgotados }}</strong>
      </div>
    </div>

    <div class="admin-card content-card">
      <div class="card-header filters">
        <div class="filter-group">
          <input class="psy-input" v-model="busqueda" type="search" placeholder="Buscar videojuego..." />
        </div>
        <div class="filter-group">
          <select class="psy-input" v-model="filtroStock">
            <option value="todos">Todos los productos</option>
            <option value="bajo">Stock bajo (1 a 5)</option>
            <option value="agotado">Agotados</option>
            <option value="disponible">Stock normal</option>
          </select>
        </div>
      </div>

      <div class="card-body">
        <p v-if="error" class="message error">{{ error }}</p>
        <p v-if="cargando" class="empty-state">Cargando inventario...</p>

        <div v-if="!cargando && !error" class="table-container">
          <table class="psy-table">
            <thead>
              <tr>
                <th>Videojuego</th>
                <th>Plataforma</th>
                <th>Precio</th>
                <th>Existencias</th>
                <th>Estado del stock</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="juego in inventarioFiltrado" :key="juego.id">
                <td>
                  <div class="game-name">{{ juego.title }}</div>
                  <small class="id-text">ID: {{ juego.id }}</small>
                </td>

                <td><span class="badge">{{ juego.platform }}</span></td>

                <td class="price">{{ formatearPrecio(juego.price) }}</td>

                <td>
                  <strong class="stock-amount">{{ juego.stock }}</strong>
                  <span class="unit-label"> un.</span>
                </td>

                <td>
                  <span class="status-dot" :class="claseStock(juego.stock)"></span>
                  {{ estadoStock(juego.stock) }}
                </td>

                <td>
                  <button class="btn-icon-only edit" @click="editarStock(juego)" aria-label="Editar Stock"
                    title="Editar Stock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>

              <tr v-if="inventarioFiltrado.length === 0">
                <td colspan="6" class="empty-state">
                  No se encontraron videojuegos para este filtro.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="footer-note crumb">
          El inventario se consulta desde la API de Laravel.
          Los pedidos registrados descuentan unidades automáticamente.
        </p>
      </div>
    </div>
  </div>

  <!-- Modal de Edición de Stock -->
  <div v-if="mostrarModal" class="confirm-overlay" @click.self="cerrarModal">
    <div class="confirm-dialog">
      <div class="confirm-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z">
          </path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>

      <h2>Modificar existencias</h2>
      <p>
        Nuevas existencias para: <br>
        <strong class="text-highlight">"{{ juegoSeleccionado?.title }}"</strong>
      </p>

      <div class="modal-input-group">
        <label class="psy-label">Cantidad en inventario:</label>
        <input class="psy-input" type="number" v-model.number="nuevoStock" min="0" step="1"
          @keyup.enter="guardarStock" />
      </div>

      <p v-if="errorModal" class="message error modal-error">{{ errorModal }}</p>

      <div class="confirm-actions">
        <button class="confirm-cancel" @click="cerrarModal" :disabled="guardandoStock">
          Cancelar
        </button>
        <button class="confirm-ok" @click="guardarStock" :disabled="guardandoStock">
          {{ guardandoStock ? 'Guardando...' : 'Guardar stock' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  name: 'InventoryView',

  data() {
    return {
      inventario: [],
      cargando: false,
      error: '',
      busqueda: '',
      filtroStock: 'todos',
      mostrarModal: false,
      juegoSeleccionado: null,
      nuevoStock: 0,
      guardandoStock: false,
      errorModal: ''
    }
  },

  computed: {
    totalUnidades() {
      return this.inventario.reduce(
        (total, juego) => total + Number(juego.stock || 0),
        0
      )
    },

    productosStockBajo() {
      return this.inventario.filter(
        juego => Number(juego.stock) >= 1 &&
          Number(juego.stock) <= 5
      ).length
    },

    productosAgotados() {
      return this.inventario.filter(
        juego => Number(juego.stock) === 0
      ).length
    },

    inventarioFiltrado() {
      let resultado = this.inventario

      const texto = this.busqueda.trim().toLowerCase()

      if (texto) {
        resultado = resultado.filter(juego =>
          String(juego.title || '').toLowerCase().includes(texto)
        )
      }

      if (this.filtroStock === 'bajo') {
        resultado = resultado.filter(
          juego => Number(juego.stock) >= 1 &&
            Number(juego.stock) <= 5
        )
      } else if (this.filtroStock === 'agotado') {
        resultado = resultado.filter(
          juego => Number(juego.stock) === 0
        )
      } else if (this.filtroStock === 'disponible') {
        resultado = resultado.filter(
          juego => Number(juego.stock) > 5
        )
      }

      return resultado
    },
  },

  mounted() {
    this.cargarInventario()
  },

  methods: {
    editarStock(juego) {
      this.juegoSeleccionado = juego;
      this.nuevoStock = Number(juego.stock);
      this.errorModal = '';
      this.mostrarModal = true;
    },

    cerrarModal() {
      this.mostrarModal = false;
      this.juegoSeleccionado = null;
      this.errorModal = '';
    },

    async guardarStock() {
      this.errorModal = '';

      if (!Number.isInteger(this.nuevoStock) || this.nuevoStock < 0) {
        this.errorModal = 'Ingresa un número entero válido mayor o igual a cero.';
        return;
      }

      this.guardandoStock = true;

      try {
        await api.put(`/games/${this.juegoSeleccionado.id}`, {
          stock: this.nuevoStock,
        });

        await this.cargarInventario();
        this.cerrarModal();
      } catch (e) {
        this.errorModal = e.response?.data?.message || 'Error al conectar con el servidor.';
      } finally {
        this.guardandoStock = false;
      }
    },

    async cargarInventario() {
      this.cargando = true
      this.error = ''

      try {
        const respuesta = await api.get('/games')
        const datos = respuesta.data

        this.inventario = Array.isArray(datos)
          ? datos
          : datos.data || []
      } catch (e) {
        this.error =
          e.response?.data?.message ||
          'No se pudo cargar el inventario. Verifica que Laravel esté funcionando.'
      } finally {
        this.cargando = false
      }
    },

    formatearPrecio(precio) {
      return new Intl.NumberFormat('es-SV', {
        style: 'currency',
        currency: 'USD',
      }).format(Number(precio || 0))
    },

    estadoStock(stock) {
      const cantidad = Number(stock)

      if (cantidad === 0) return 'Agotado'
      if (cantidad <= 5) return 'Stock bajo'

      return 'Disponible'
    },

    claseStock(stock) {
      const cantidad = Number(stock)

      if (cantidad === 0) return 'stock-empty'
      if (cantidad <= 5) return 'stock-low'

      return 'stock-ok'
    },
  },
}
</script>

<style scoped>
/* Las variables como --void, --deck, --cyan etc. se heredan de App.vue */

.inventory-page {
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 30px;
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

/* Tarjetas globales */
.admin-card {
  background: var(--deck);
  border: 1px solid var(--edge);
  clip-path: var(--cut);
  margin-bottom: 30px;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--edge);
  background: rgba(130, 160, 255, 0.02);
}

.card-body {
  padding: 24px;
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
  background: var(--deck);
  border: 1px solid var(--edge);
  clip-path: var(--cut);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-color: rgba(130, 160, 255, 0.4);
}

.warning-card {
  border-color: rgba(255, 176, 46, 0.3);
  background: rgba(255, 176, 46, 0.05);
}

.error-card {
  border-color: rgba(255, 61, 139, 0.3);
  background: rgba(255, 61, 139, 0.05);
}

.stat-label {
  display: block;
  margin-bottom: 12px;
  color: var(--dim);
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  display: block;
  font-size: 2.2rem;
  color: var(--text);
  line-height: 1;
}

.text-cyan {
  color: var(--cyan) !important;
}

.text-warn {
  color: var(--warn) !important;
}

.text-hot {
  color: var(--hot) !important;
}

/* Controles de filtro */
.filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-group {
  flex: 1;
}

.filter-group:last-child {
  flex: 0 0 280px;
}

.psy-input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(5, 6, 15, 0.5);
  border: 1px solid rgba(130, 160, 255, 0.15);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 0.95rem;
  clip-path: var(--cut-sm);
  transition: all 0.2s;
  outline: none;
}

.psy-input:focus {
  background: var(--void);
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(25, 227, 255, 0.15);
}

.psy-input::placeholder {
  color: rgba(140, 149, 184, 0.4);
}

/* Tablas */
.table-container {
  overflow-x: auto;
}

.psy-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.psy-table th {
  padding: 0 12px 16px;
  color: var(--dim);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--edge);
}

.psy-table td {
  padding: 16px 12px;
  border-bottom: 1px solid rgba(130, 160, 255, 0.08);
  white-space: nowrap;
  vertical-align: middle;
}

.psy-table tbody tr {
  transition: background 0.2s;
}

.psy-table tbody tr:hover {
  background: rgba(130, 160, 255, 0.03);
}

.game-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--text);
}

.id-text {
  display: block;
  margin-top: 4px;
  color: var(--dim);
  font-size: 0.85rem;
}

.price {
  color: var(--cyan);
  font-family: var(--font-display);
  font-weight: 700;
}

.stock-amount {
  font-size: 1.1rem;
  color: var(--text);
}

.unit-label {
  color: var(--dim);
  font-size: 0.85rem;
}

/* Badges y estados */
.badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(122, 92, 255, 0.15);
  border: 1px solid rgba(122, 92, 255, 0.3);
  color: #bfaaff;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 4px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
}

.stock-ok {
  background: var(--ok);
  box-shadow: 0 0 8px var(--ok);
}

.stock-low {
  background: var(--warn);
  box-shadow: 0 0 8px var(--warn);
}

.stock-empty {
  background: var(--hot);
  box-shadow: 0 0 8px var(--hot);
}

/* Botones principales y secundarios */
.btn-neon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(90deg, rgba(25, 227, 255, 0.1), rgba(122, 92, 255, 0.1));
  border: 1px solid var(--cyan);
  color: var(--cyan);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  cursor: pointer;
  clip-path: var(--cut-sm);
  transition: all 0.2s;
  box-shadow: inset 0 0 15px rgba(25, 227, 255, 0.1);
}

.btn-neon:hover:not(:disabled) {
  background: var(--cyan);
  color: #031018;
  box-shadow: 0 0 20px rgba(25, 227, 255, 0.4);
}

.btn-neon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon-only {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: rgba(130, 160, 255, 0.05);
  color: var(--dim);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-only svg {
  width: 16px;
  height: 16px;
}

.btn-icon-only.edit:hover {
  background: rgba(122, 92, 255, 0.15);
  border-color: var(--violet);
  color: #bfaaff;
}

/* Modal de edición (heredado de global pero con ajustes para input) */
.psy-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--dim);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.modal-input-group {
  margin: 20px 0;
  text-align: left;
}

/* Mensajes de alerta */
.message {
  padding: 14px 18px;
  margin-bottom: 24px;
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

.empty-state {
  padding: 40px 0;
  text-align: center;
  color: var(--dim);
  font-family: var(--font-display);
  font-size: 1.1rem;
}

.footer-note {
  margin-top: 24px;
}

/* Responsive */
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group:last-child {
    flex: none;
  }
}

@media (max-width: 550px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>