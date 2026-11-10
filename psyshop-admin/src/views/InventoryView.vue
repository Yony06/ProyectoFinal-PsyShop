<template>
  <div class="inventory-page">
    <div class="page-header">
      <div>
        <h1>Inventario</h1>
        <p>Control de existencias de videojuegos de PsyShop.</p>
      </div>

      <button @click="cargarInventario" :disabled="cargando">
        {{ cargando ? 'Cargando...' : 'Actualizar inventario' }}
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span>Total de videojuegos</span>
        <strong>{{ inventario.length }}</strong>
      </div>

      <div class="stat-card">
        <span>Unidades disponibles</span>
        <strong>{{ totalUnidades }}</strong>
      </div>

      <div class="stat-card warning-card">
        <span>Stock bajo</span>
        <strong>{{ productosStockBajo }}</strong>
      </div>

      <div class="stat-card">
        <span>Sin existencias</span>
        <strong>{{ productosAgotados }}</strong>
      </div>
    </div>

    <div class="filters">
      <input v-model="busqueda" type="search" placeholder="Buscar videojuego..." />

      <select v-model="filtroStock">
        <option value="todos">Todos los productos</option>
        <option value="bajo">Stock bajo (1 a 5)</option>
        <option value="agotado">Agotados</option>
        <option value="disponible">Stock normal</option>
      </select>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="cargando" class="info">Cargando inventario...</p>

    <div v-if="!cargando && !error" class="table-container">
      <table>
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
              <small>ID: {{ juego.id }}</small>
            </td>

            <td>{{ juego.platform }}</td>

            <td>{{ formatearPrecio(juego.price) }}</td>

            <td>
              <strong>{{ juego.stock }}</strong>
              <span class="unit-label"> unidades</span>
            </td>

            <td>
              <span class="stock-badge" :class="claseStock(juego.stock)">
                {{ estadoStock(juego.stock) }}
              </span>
            </td>
            <td>
              <button class="edit-stock-button" @click="editarStock(juego)">
                Editar stock
              </button>
            </td>
          </tr>

          <tr v-if="inventarioFiltrado.length === 0">
            <td colspan="5" class="empty">
              No se encontraron videojuegos para este filtro.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="footer-note">
      El inventario se consulta desde la API de Laravel.
      Los pedidos registrados descuentan unidades automáticamente.
    </p>
  </div>
  <!-- Modal de Edición de Stock -->
  <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
    <div class="modal-card">
      <h3>Modificar existencias</h3>
      <p>
        Nuevas existencias para: <br>
        <strong class="text-highlight">{{ juegoSeleccionado?.title }}</strong>
      </p>

      <div class="modal-input-group">
        <label>Cantidad en inventario:</label>
        <input type="number" v-model.number="nuevoStock" min="0" step="1" @keyup.enter="guardarStock" />
      </div>

      <p v-if="errorModal" class="error modal-error">{{ errorModal }}</p>

      <div class="modal-actions">
        <button class="btn-cancel" @click="cerrarModal" :disabled="guardandoStock">
          Cancelar
        </button>
        <button class="btn-save" @click="guardarStock" :disabled="guardandoStock">
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
  const token = localStorage.getItem('token'); // Cambia 'token' por el nombre que uses
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
      // Abre el modal y carga los datos del juego seleccionado
      this.juegoSeleccionado = juego;
      this.nuevoStock = Number(juego.stock);
      this.errorModal = '';
      this.mostrarModal = true;
    },

    cerrarModal() {
      // Cierra el modal y limpia los datos
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
.inventory-page {
  padding: 28px;
  color: #e5e7eb;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

h1 {
  margin: 0 0 8px;
  color: #fff;
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: #9ca3af;
}

/* Estilos del Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: #111827;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.modal-card h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #fff;
  font-size: 20px;
}

.text-highlight {
  color: #60a5fa;
  font-size: 16px;
}

.modal-input-group {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-input-group label {
  color: #9ca3af;
  font-size: 14px;
}

.modal-input-group input {
  padding: 10px 12px;
  border: 1px solid #374151;
  border-radius: 8px;
  background: #1f2937;
  color: #f9fafb;
  font-size: 16px;
  outline: none;
}

.modal-input-group input:focus {
  border-color: #2563eb;
}

.modal-error {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #4b5563;
  color: #d1d5db;
}

.btn-cancel:hover:not(:disabled) {
  background: #374151;
}

.btn-save {
  background: #2563eb;
}

.btn-save:hover:not(:disabled) {
  background: #1d4ed8;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border: 1px solid #374151;
  border-radius: 12px;
  background: #111827;
}

.stat-card span {
  display: block;
  margin-bottom: 12px;
  color: #9ca3af;
  font-size: 13px;
}

.stat-card strong {
  color: #fff;
  font-size: 28px;
}

.warning-card strong {
  color: #fbbf24;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filters input,
.filters select {
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid #374151;
  border-radius: 8px;
  background: #111827;
  color: #f9fafb;
}

.filters input {
  flex: 1;
}

.filters select {
  width: 220px;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #374151;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #111827;
}

th,
td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #374151;
}

th {
  background: #1f2937;
  color: #d1d5db;
  white-space: nowrap;
}

td small {
  display: block;
  margin-top: 5px;
  color: #9ca3af;
}

.game-name {
  color: #fff;
  font-weight: 600;
}

.unit-label {
  color: #9ca3af;
  font-size: 12px;
}

.stock-badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.stock-ok {
  background: #14532d;
  color: #bbf7d0;
}

.stock-low {
  background: #713f12;
  color: #fde68a;
}

.stock-empty {
  background: #7f1d1d;
  color: #fecaca;
}

.error {
  padding: 12px;
  border-radius: 8px;
  background: #7f1d1d;
  color: #fecaca;
}

.info,
.empty {
  color: #9ca3af;
}

.footer-note {
  margin-top: 18px;
  color: #9ca3af;
  font-size: 13px;
}

@media (max-width: 1000px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .inventory-page {
    padding: 16px;
  }

  .page-header,
  .filters {
    align-items: stretch;
    flex-direction: column;
  }

  .filters select {
    width: 100%;
  }
}
</style>
