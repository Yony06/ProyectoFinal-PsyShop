<template>
  <div class="orders-page">
    <div class="page-header">
      <div>
        <h1 class="glow-text">Gestión de pedidos</h1>
        <p class="crumb">Consulta y administra los pedidos de PsyShop.</p>
      </div>

      <button class="btn-neon" @click="cargarPedidos" :disabled="cargando">
        <span class="btn-icon">↻</span>
        {{ cargando ? 'Cargando...' : 'Actualizar pedidos' }}
      </button>
    </div>

    <p v-if="error" class="message error">{{ error }}</p>
    <p v-if="mensaje" class="message success">{{ mensaje }}</p>

    <div class="admin-card">
      <div class="card-body">
        <p v-if="cargando" class="empty-state">Cargando pedidos...</p>

        <div v-if="!cargando && !error" class="table-container">
          <table class="psy-table">
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
                <td class="order-id">#{{ pedido.id }}</td>

                <td>
                  <strong class="customer-name">{{ pedido.customer_name }}</strong>
                </td>

                <td><span class="id-text">{{ pedido.customer_email }}</span></td>

                <td>{{ formatearFecha(pedido.created_at) }}</td>

                <td class="price">{{ formatearPrecio(pedido.total) }}</td>

                <td>
                  <div class="status-wrapper">
                    <span class="status-badge" :class="claseEstado(pedido.status)">
                      <span class="status-dot"></span>
                      {{ traducirEstado(pedido.status) }}
                    </span>

                    <select :value="pedido.status" :disabled="actualizandoId === pedido.id"
                      @change="actualizarEstado(pedido, $event.target.value)" class="psy-input status-select">
                      <option value="pending">Pendiente</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>

                    <small v-if="actualizandoId === pedido.id" class="info-text text-cyan">
                      Guardando...
                    </small>
                  </div>
                </td>

                <td>
                  <ul class="items-list" v-if="pedido.items && pedido.items.length">
                    <li v-for="item in pedido.items" :key="item.id">
                      <span class="item-title">{{ item.game?.title || 'Videojuego no disponible' }}</span>
                      <span class="item-qty">× {{ item.quantity }}</span>
                    </li>
                  </ul>
                  <span v-else class="crumb">Sin artículos</span>
                </td>
              </tr>

              <tr v-if="pedidos.length === 0">
                <td colspan="7" class="empty-state">
                  No hay pedidos registrados en el sistema.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!cargando && !error && pedidos.length > 0" class="pagination">
          <button class="btn-ghost" @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual <= 1">
            Anterior
          </button>

          <span class="page-info">
            Página <strong class="text-cyan">{{ paginaActual }}</strong> de {{ ultimaPagina }}
          </span>

          <button class="btn-ghost" @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual >= ultimaPagina">
            Siguiente
          </button>
        </div>
      </div>
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
/* Las variables globales (--void, --deck, --cyan, etc.) se heredan de App.vue */

.orders-page {
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

/* Tarjeta Principal */
.admin-card {
  background: var(--deck);
  border: 1px solid var(--edge);
  clip-path: var(--cut);
  margin-bottom: 30px;
}

.card-body {
  padding: 24px;
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

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  background: rgba(130, 160, 255, 0.08);
  border: 1px solid transparent;
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  clip-path: var(--cut-sm);
  transition: all 0.2s;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(130, 160, 255, 0.15);
  border-color: rgba(130, 160, 255, 0.3);
}

.btn-neon:disabled,
.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tabla de Pedidos */
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
  padding: 20px 12px;
  border-bottom: 1px solid rgba(130, 160, 255, 0.08);
  vertical-align: top;
}

.psy-table tbody tr {
  transition: background 0.2s;
}

.psy-table tbody tr:hover {
  background: rgba(130, 160, 255, 0.03);
}

.order-id {
  font-family: var(--font-display);
  color: var(--violet);
  font-weight: 700;
}

.customer-name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--text);
}

.id-text {
  color: var(--dim);
  font-size: 0.9rem;
}

.price {
  color: var(--cyan);
  font-family: var(--font-display);
  font-weight: 700;
}

/* Estado del pedido */
.status-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* Colores de estado */
.status-pending {
  background: rgba(255, 176, 46, 0.15);
  border-color: rgba(255, 176, 46, 0.3);
  color: var(--warn);
}

.status-pending .status-dot {
  background: var(--warn);
  box-shadow: 0 0 6px var(--warn);
}

.status-completed {
  background: rgba(61, 220, 151, 0.15);
  border-color: rgba(61, 220, 151, 0.3);
  color: var(--ok);
}

.status-completed .status-dot {
  background: var(--ok);
  box-shadow: 0 0 6px var(--ok);
}

.status-cancelled {
  background: rgba(255, 61, 139, 0.15);
  border-color: rgba(255, 61, 139, 0.3);
  color: var(--hot);
}

.status-cancelled .status-dot {
  background: var(--hot);
  box-shadow: 0 0 6px var(--hot);
}

/* Selector de estado */
.psy-input.status-select {
  width: 100%;
  min-width: 130px;
  padding: 8px 10px;
  background: rgba(5, 6, 15, 0.5);
  border: 1px solid rgba(130, 160, 255, 0.15);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 0.9rem;
  clip-path: var(--cut-sm);
  transition: all 0.2s;
  outline: none;
  cursor: pointer;
}

.psy-input.status-select:focus {
  background: var(--void);
  border-color: var(--cyan);
}

.psy-input.status-select option {
  background: var(--void);
  color: var(--text);
}

.psy-input.status-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-text {
  font-size: 0.8rem;
  font-weight: bold;
}

.text-cyan {
  color: var(--cyan);
}

/* Lista de artículos */
.items-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.items-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  background: rgba(130, 160, 255, 0.04);
  border-radius: 4px;
  border-left: 2px solid rgba(130, 160, 255, 0.2);
}

.item-title {
  font-size: 0.9rem;
  color: var(--text);
}

.item-qty {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--violet);
  font-size: 0.85rem;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--edge);
}

.page-info {
  color: var(--dim);
  font-family: var(--font-display);
  font-size: 0.95rem;
}

/* Mensajes */
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

.message.success {
  background: rgba(61, 220, 151, 0.1);
  border-left-color: var(--ok);
  color: #8ee6bb;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
  color: var(--dim);
  font-family: var(--font-display);
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>