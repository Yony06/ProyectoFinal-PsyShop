
<template>
  <div class="orders-page">
    <div class="page-header">
      <div>
        <h1>Gestión de pedidos</h1>
        <p>Consulta y administra los pedidos de PsyShop.</p>
      </div>

      <button @click="cargarPedidos" :disabled="cargando">
        {{ cargando ? 'Cargando...' : 'Actualizar pedidos' }}
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="mensaje" class="success">{{ mensaje }}</p>
    <p v-if="cargando" class="info">Cargando pedidos...</p>

    <div v-if="!cargando && !error" class="table-container">
      <table>
        <thead>
          <tr>
            <th>N.º</th>
            <th>Cliente</th>
            <th>Correo</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Videojuegos</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="pedido in pedidos" :key="pedido.id">
            <td>#{{ pedido.id }}</td>
            <td>{{ pedido.customer_name }}</td>
            <td>{{ pedido.customer_email }}</td>
            <td>{{ formatearFecha(pedido.created_at) }}</td>
            <td>{{ formatearPrecio(pedido.total) }}</td>

            <td>
              <span
                class="status"
                :class="claseEstado(pedido.status)"
              >
                {{ traducirEstado(pedido.status) }}
              </span>

              <select
                :value="pedido.status"
                :disabled="actualizandoId === pedido.id"
                @change="actualizarEstado(pedido, $event.target.value)"
                class="status-select"
              >
                <option value="pending">Pendiente</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>

              <small
                v-if="actualizandoId === pedido.id"
                class="info"
              >
                Guardando...
              </small>
            </td>

            <td>
              <ul v-if="pedido.items && pedido.items.length">
                <li
                  v-for="item in pedido.items"
                  :key="item.id"
                >
                  {{ item.game?.title || 'Videojuego no disponible' }}
                  × {{ item.quantity }}
                </li>
              </ul>

              <span v-else>Sin artículos</span>
            </td>
          </tr>

          <tr v-if="pedidos.length === 0">
            <td colspan="7" class="empty">
              No hay pedidos registrados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!cargando && !error" class="pagination">
      <button
        @click="cambiarPagina(paginaActual - 1)"
        :disabled="paginaActual <= 1"
      >
        Anterior
      </button>

      <span>Página {{ paginaActual }} de {{ ultimaPagina }}</span>

      <button
        @click="cambiarPagina(paginaActual + 1)"
        :disabled="paginaActual >= ultimaPagina"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script>
import api from '../api'

export default {
  name: 'OrdersView',

  data() {
    return {
      pedidos: [],
      cargando: false,
      error: '',
      mensaje: '',
      paginaActual: 1,
      ultimaPagina: 1,
      actualizandoId: null,
    }
  },

  mounted() {
    this.cargarPedidos()
  },

  methods: {
    async cargarPedidos(pagina = this.paginaActual) {
      this.cargando = true
      this.error = ''
      this.mensaje = ''

      try {
        const respuesta = await api.get('/admin/orders', {
          params: { page: pagina },
        })

        this.pedidos = respuesta.data.data || []
        this.paginaActual = respuesta.data.current_page || 1
        this.ultimaPagina = respuesta.data.last_page || 1
      } catch (e) {
        this.error =
          e.response?.data?.message ||
          'No se pudieron cargar los pedidos. Verifica que Laravel esté funcionando.'
      } finally {
        this.cargando = false
      }
    },

    cambiarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.ultimaPagina) {
        this.cargarPedidos(pagina)
      }
    },

    formatearPrecio(precio) {
      return new Intl.NumberFormat('es-SV', {
        style: 'currency',
        currency: 'USD',
      }).format(Number(precio))
    },

    formatearFecha(fecha) {
      if (!fecha) return '—'

      return new Date(fecha).toLocaleDateString('es-SV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    },

    traducirEstado(estado) {
      const estados = {
        pending: 'Pendiente',
        completed: 'Completado',
        cancelled: 'Cancelado',
      }

      return estados[estado] || estado
    },

    claseEstado(estado) {
      return `status-${String(estado || '').toLowerCase()}`
    },

    async actualizarEstado(pedido, nuevoEstado) {
      if (pedido.status === nuevoEstado) return
      if (this.actualizandoId !== null) return

      const estadoAnterior = pedido.status

      this.error = ''
      this.mensaje = ''
      this.actualizandoId = pedido.id

      try {
        const respuesta = await api.patch(
          `/admin/orders/${pedido.id}/status`,
          { status: nuevoEstado }
        )

        pedido.status =
          respuesta.data.order?.status || nuevoEstado

        this.mensaje =
          respuesta.data.message ||
          'Estado del pedido actualizado correctamente.'
      } catch (e) {
        pedido.status = estadoAnterior

        this.error =
          e.response?.data?.message ||
          'No se pudo actualizar el estado del pedido.'
      } finally {
        this.actualizandoId = null
      }
    },
  },
}
</script>

<style scoped>
.orders-page {
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
  color: #ffffff;
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: #9ca3af;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background: #1d4ed8;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #374151;
  vertical-align: top;
}

th {
  background: #1f2937;
  color: #d1d5db;
  white-space: nowrap;
}

td {
  color: #e5e7eb;
}

td ul {
  margin: 0;
  padding-left: 18px;
}

.status {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 20px;
  background: #374151;
  font-size: 12px;
}

.status-pending {
  background: #713f12;
  color: #fde68a;
}

.status-completed {
  background: #14532d;
  color: #bbf7d0;
}

.status-cancelled {
  background: #7f1d1d;
  color: #fecaca;
}

.status-select {
  display: block;
  width: 100%;
  min-width: 130px;
  margin-top: 8px;
  padding: 9px 10px;
  border: 1px solid #4b5563;
  border-radius: 7px;
  background: #1f2937;
  color: #f9fafb;
  font-size: 13px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
}

.status-select:hover {
  border-color: #3b82f6;
}

.status-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgb(59 130 246 / 20%);
}

.status-select option {
  background: #111827;
  color: #f9fafb;
}

.error {
  padding: 12px;
  border-radius: 8px;
  background: #7f1d1d;
  color: #fecaca;
}

.success {
  padding: 12px;
  border-radius: 8px;
  background: #14532d;
  color: #bbf7d0;
}

.info,
.empty {
  color: #9ca3af;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .orders-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
