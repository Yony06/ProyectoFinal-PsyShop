<template>
  <div class="games-page">
    <div class="page-heading">
      <div>
        <h2>Catálogo de videojuegos</h2>
        <p class="crumb">Administra los productos de tu tienda PsyShop.</p>
      </div>

      <button class="btn-neon" @click="abrirFormulario">
        <span class="btn-icon">+</span> Nuevo videojuego
      </button>
    </div>

    <div v-if="error" class="message error">{{ error }}</div>
    <div v-if="mensaje" class="message success">{{ mensaje }}</div>

    <section v-if="mostrarFormulario" class="admin-card form-card">
      <div class="card-header">
        <h3>{{ juegoEditandoId !== null ? 'Editar videojuego' : 'Registrar videojuego' }}</h3>
      </div>

      <form @submit.prevent="guardarVideojuego" class="card-body">
        <div class="form-grid">
          <label class="psy-label">
            Título *
            <input class="psy-input" v-model.trim="form.title" required maxlength="255" placeholder="Ej. Spider-Man 2">
          </label>

          <label class="psy-label">
            Plataforma *
            <select class="psy-input" v-model="form.platform" required>
              <option value="" disabled>Selecciona una plataforma</option>
              <option>PS5</option>
              <option>PS4</option>
              <option>PS3</option>
              <option>PS Vita</option>
            </select>
          </label>

          <label class="psy-label">
            Precio (USD) *
            <input class="psy-input" v-model.number="form.price" type="number" min="0" step="0.01" required>
          </label>

          <label class="psy-label">
            Existencias *
            <input class="psy-input" v-model.number="form.stock" type="number" min="0" step="1" required>
          </label>

          <label class="psy-label">
            Género
            <input class="psy-input" v-model.trim="form.genre" maxlength="80" placeholder="Ej. Acción">
          </label>

          <label class="psy-label">
            URL de imagen
            <input class="psy-input" v-model.trim="form.image_url" type="url" maxlength="255" placeholder="https://...">
          </label>

          <label class="psy-label full-width">
            Descripción
            <textarea class="psy-input" v-model.trim="form.description" rows="3"
              placeholder="Descripción del videojuego"></textarea>
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-ghost" @click="cerrarFormulario">
            Cancelar
          </button>

          <button type="submit" class="btn-neon" :disabled="guardando">
            {{ guardando
              ? 'Guardando...'
              : (juegoEditandoId !== null
                ? 'Guardar cambios'
                : 'Guardar videojuego') }}
          </button>
        </div>
      </form>
    </section>

    <!-- SECCIÓN 1: Juegos Activos -->
    <section class="admin-card">
      <div class="card-header table-heading">
        <div>
          <h3>Videojuegos registrados</h3>
          <p class="crumb">{{ juegosActivos.length }} videojuegos activos</p>
        </div>
      </div>

      <div class="card-body">
        <p v-if="cargando" class="empty-state">Cargando videojuegos...</p>
        <p v-else-if="juegosActivos.length === 0" class="empty-state">
          No hay videojuegos activos para mostrar.
        </p>

        <div v-else class="table-container">
          <table class="psy-table">
            <thead>
              <tr>
                <th>Videojuego</th>
                <th>Plataforma</th>
                <th>Género</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="juego in juegosActivos" :key="juego.id">
                <td>
                  <div class="game-name">{{ juego.title }}</div>
                  <small class="id-text">ID: {{ juego.id }}</small>
                </td>
                <td><span class="badge">{{ juego.platform }}</span></td>
                <td>{{ juego.genre || 'Sin género' }}</td>
                <td class="price">{{ formatoPrecio(juego.price) }}</td>
                <td>{{ juego.stock }}</td>
                <td>
                  <span class="status-dot" :class="juego.stock > 0 ? 'available' : 'out-of-stock'"></span>
                  {{ juego.stock > 0 ? 'Disponible' : 'Agotado' }}
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon-only edit" @click="editarVideojuego(juego)" aria-label="Editar"
                      title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <button class="btn-icon-only delete" @click="desactivarVideojuego(juego)" aria-label="Desactivar"
                      title="Desactivar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 2: Juegos Desactivados -->
    <section v-if="juegosDesactivados.length > 0" class="admin-card deactivated-section">
      <div class="card-header table-heading">
        <div>
          <h3 class="warn-text">Videojuegos desactivados</h3>
          <p class="crumb">{{ juegosDesactivados.length }} videojuegos inactivos en el sistema</p>
        </div>
      </div>

      <div class="card-body">
        <div class="table-container">
          <table class="psy-table">
            <thead>
              <tr>
                <th>Videojuego</th>
                <th>Plataforma</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="juego in juegosDesactivados" :key="juego.id" class="inactive-row">
                <td>
                  <div class="game-name">{{ juego.title }}</div>
                  <small class="id-text">ID: {{ juego.id }}</small>
                </td>
                <td><span class="badge ghost">{{ juego.platform }}</span></td>
                <td>{{ juego.stock }}</td>
                <td>
                  <!-- Este botón ahora abre el nuevo modal en lugar del alert nativo -->
                  <button class="btn-activate" @click="activarVideojuego(juego)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    Activar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>

  <!-- MODAL 1: Confirmación Desactivar (Estilo Advertencia / Rojo) -->
  <div v-if="mostrarModalDesactivar" class="confirm-overlay" @click.self="cerrarModalDesactivar">
    <div class="confirm-dialog">
      <div class="confirm-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>

      <h2>Confirmar desactivación</h2>
      <p>
        ¿Estás seguro que deseas desactivar el videojuego <br>
        <strong class="text-highlight">"{{ juegoADesactivar?.title }}"</strong>?
      </p>

      <p v-if="errorModalDesactivar" class="message error modal-error">{{ errorModalDesactivar }}</p>

      <div class="confirm-actions">
        <button class="confirm-cancel" @click="cerrarModalDesactivar" :disabled="desactivando">
          Cancelar
        </button>
        <button class="confirm-ok" @click="confirmarDesactivar" :disabled="desactivando">
          {{ desactivando ? 'Procesando...' : 'Sí, desactivar' }}
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL 2: Confirmación Activar (Estilo Éxito / Verde) -->
  <div v-if="mostrarModalActivar" class="confirm-overlay" @click.self="cerrarModalActivar">
    <div class="confirm-dialog modal-activate">
      <div class="confirm-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h2>Confirmar activación</h2>
      <p>
        ¿Deseas activar el videojuego <br>
        <strong class="text-highlight">"{{ juegoAActivar?.title }}"</strong> nuevamente?
      </p>

      <p v-if="errorModalActivar" class="message error modal-error">{{ errorModalActivar }}</p>

      <div class="confirm-actions">
        <button class="confirm-cancel" @click="cerrarModalActivar" :disabled="activando">
          Cancelar
        </button>
        <button class="confirm-ok" @click="confirmarActivar" :disabled="activando">
          {{ activando ? 'Procesando...' : 'Sí, activar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  name: 'GamesView',

  data() {
    return {
      videojuegos: [],
      cargando: false,
      guardando: false,
      mostrarFormulario: false,
      error: '',
      mensaje: '',
      juegoEditandoId: null,
      form: this.formularioVacio(),

      // Estado Modal Desactivar
      mostrarModalDesactivar: false,
      juegoADesactivar: null,
      desactivando: false,
      errorModalDesactivar: '',

      // Estado Modal Activar (NUEVO)
      mostrarModalActivar: false,
      juegoAActivar: null,
      activando: false,
      errorModalActivar: ''
    }
  },

  computed: {
    juegosActivos() {
      return this.videojuegos.filter(j => j.is_active === true || j.is_active === 1);
    },
    juegosDesactivados() {
      return this.videojuegos.filter(j => j.is_active === false || j.is_active === 0);
    }
  },

  mounted() {
    this.cargarVideojuegos()
  },

  methods: {
    formularioVacio() {
      return {
        title: '',
        slug: '',
        description: '',
        price: 0,
        stock: 0,
        platform: '',
        genre: '',
        image_url: '',
        is_active: true
      }
    },

    async cargarVideojuegos() {
      this.cargando = true
      this.error = ''

      try {
        const respuesta = await api.get('/games?all=true')
        this.videojuegos = respuesta.data.data
      } catch (e) {
        this.error = 'No se pudieron cargar los videojuegos.'
      } finally {
        this.cargando = false
      }
    },

    abrirFormulario() {
      this.error = ''
      this.mensaje = ''
      this.form = this.formularioVacio()
      this.mostrarFormulario = true

      this.$nextTick(() => {
        const formEl = document.querySelector('.form-card');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },

    editarVideojuego(juego) {
      this.error = ''
      this.mensaje = ''
      this.juegoEditandoId = juego.id

      this.form = {
        title: juego.title,
        slug: juego.slug,
        description: juego.description || '',
        price: Number(juego.price),
        stock: Number(juego.stock),
        platform: juego.platform,
        genre: juego.genre || '',
        image_url: juego.image_url || '',
        is_active: juego.is_active
      }

      this.mostrarFormulario = true

      this.$nextTick(() => {
        const formEl = document.querySelector('.form-card');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },

    // ------------------------------------------
    // MODAL: DESACTIVAR VIDEOJUEGO
    // ------------------------------------------
    async desactivarVideojuego(juego) {
      this.juegoADesactivar = juego;
      this.errorModalDesactivar = '';
      this.mostrarModalDesactivar = true;
    },

    cerrarModalDesactivar() {
      this.mostrarModalDesactivar = false;
      this.juegoADesactivar = null;
      this.errorModalDesactivar = '';
    },

    async confirmarDesactivar() {
      if (!this.juegoADesactivar) return;

      this.errorModalDesactivar = '';
      this.desactivando = true;

      try {
        await api.delete(`/games/${this.juegoADesactivar.id}`);

        this.mensaje = 'Videojuego desactivado correctamente.';
        await this.cargarVideojuegos();
        this.cerrarModalDesactivar();
      } catch (e) {
        this.errorModalDesactivar = e.response?.data?.message || 'No se pudo desactivar el videojuego.';
      } finally {
        this.desactivando = false;
      }
    },

    // ------------------------------------------
    // MODAL: ACTIVAR VIDEOJUEGO (NUEVO)
    // ------------------------------------------
    activarVideojuego(juego) {
      this.juegoAActivar = juego;
      this.errorModalActivar = '';
      this.mostrarModalActivar = true;
    },

    cerrarModalActivar() {
      this.mostrarModalActivar = false;
      this.juegoAActivar = null;
      this.errorModalActivar = '';
    },

    async confirmarActivar() {
      if (!this.juegoAActivar) return;

      this.errorModalActivar = '';
      this.activando = true;

      try {
        await api.patch(`/games/${this.juegoAActivar.id}`, {
          is_active: true
        });

        this.mensaje = 'Videojuego activado correctamente.';
        await this.cargarVideojuegos();
        this.cerrarModalActivar();
      } catch (e) {
        this.errorModalActivar = e.response?.data?.message || 'No se pudo activar el videojuego.';
      } finally {
        this.activando = false;
      }
    },

    // ------------------------------------------
    // FORMULARIO PRINCIPAL
    // ------------------------------------------
    cerrarFormulario() {
      this.mostrarFormulario = false
      this.error = ''
    },

    async guardarVideojuego() {
      this.error = ''
      this.mensaje = ''

      if (this.form.price < 0 || this.form.stock < 0) {
        this.error = 'El precio y las existencias no pueden ser negativos.'
        return
      }

      if (!Number.isInteger(Number(this.form.stock))) {
        this.error = 'Las existencias deben ser un número entero.'
        return
      }

      this.guardando = true

      try {
        this.form.slug = this.form.title
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        if (this.juegoEditandoId !== null) {
          await api.put(`/games/${this.juegoEditandoId}`, this.form)
          this.mensaje = 'Videojuego actualizado correctamente.'
        } else {
          await api.post('/games', this.form)
          this.mensaje = 'Videojuego registrado correctamente.'
        }

        this.mostrarFormulario = false
        this.juegoEditandoId = null
        this.form = this.formularioVacio()

        await this.cargarVideojuegos()
      } catch (e) {
        if (e.response?.status === 422) {
          const errores = e.response.data.errors || {}
          this.error = Object.values(errores).flat().join(' ')
            || 'Revisa los datos ingresados.'
        } else {
          this.error = 'No se pudo registrar el videojuego. Verifica el servidor y la API.'
        }
      } finally {
        this.guardando = false
      }
    },

    formatoPrecio(precio) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(precio)
    }
  }
}
</script>

<style scoped>
/* Las variables como --void, --deck, --cyan etc. se heredan de App.vue, 
   así que solo estilizamos la estructura local */

.games-page {
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

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 30px;
}

.page-heading h2 {
  margin: 0 0 4px;
  font-size: 1.8rem;
}

/* Tarjetas base del panel */
.admin-card {
  margin-bottom: 30px;
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

/* Formularios PsyShop */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.full-width {
  grid-column: 1 / -1;
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
  padding: 12px 14px;
  background: rgba(5, 6, 15, 0.5);
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
  box-shadow: 0 0 12px rgba(25, 227, 255, 0.15);
}

.psy-input::placeholder {
  color: rgba(140, 149, 184, 0.4);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 26px;
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

.badge.ghost {
  background: rgba(140, 149, 184, 0.1);
  border-color: rgba(140, 149, 184, 0.2);
  color: var(--dim);
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
}

.status-dot.available {
  background: var(--ok);
  box-shadow: 0 0 8px var(--ok);
}

.status-dot.out-of-stock {
  background: var(--warn);
  box-shadow: 0 0 8px var(--warn);
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
  padding: 12px 20px;
  background: rgba(130, 160, 255, 0.08);
  border: 1px solid transparent;
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
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

/* Botones de acción en tabla */
.action-buttons {
  display: flex;
  gap: 8px;
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

.btn-icon-only.delete:hover {
  background: rgba(255, 61, 139, 0.15);
  border-color: var(--hot);
  color: #ff8fb8;
}

.btn-activate {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(61, 220, 151, 0.1);
  border: 1px solid rgba(61, 220, 151, 0.3);
  color: var(--ok);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-activate svg {
  width: 14px;
  height: 14px;
}

.btn-activate:hover {
  background: rgba(61, 220, 151, 0.2);
  box-shadow: 0 0 10px rgba(61, 220, 151, 0.2);
}

/* Sección Desactivados */
.deactivated-section {
  border-color: rgba(255, 176, 46, 0.3);
  background: rgba(12, 16, 36, 0.6);
}

.warn-text {
  color: var(--warn) !important;
}

.inactive-row td {
  opacity: 0.6;
}

.inactive-row:hover td {
  opacity: 1;
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

.message.success {
  background: rgba(61, 220, 151, 0.1);
  border-left-color: var(--ok);
  color: #8ee6bb;
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

/* ============================================================
   Sobrescritura Local: MODAL DE ACTIVACIÓN (VERDE)
   Las clases base como .confirm-dialog vienen de App.vue (rojo)
   ============================================================ */
.confirm-dialog.modal-activate {
  background: radial-gradient(circle at 50% 0%, rgba(61, 220, 151, 0.2), transparent 60%), var(--deck);
  border-color: rgba(61, 220, 151, 0.45);
  box-shadow: 0 0 34px rgba(61, 220, 151, 0.18);
}

.modal-activate .confirm-icon {
  border-color: var(--ok);
  color: var(--ok);
  box-shadow: 0 0 22px rgba(61, 220, 151, 0.3);
}

.modal-activate .text-highlight {
  color: #8ee6bb;
  /* Verde brillante en lugar de rojo */
}

.modal-activate .confirm-ok {
  background: var(--ok);
  color: #021c10;
}

.modal-activate .confirm-ok:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 0 15px rgba(61, 220, 151, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>