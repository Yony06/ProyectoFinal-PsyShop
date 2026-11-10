<template>
  <div class="games-page">
    <div class="page-heading">
      <div>
        <h2>Catálogo de videojuegos</h2>
        <p>Administra los productos de tu tienda PsyShop.</p>
      </div>

      <button class="primary-button" @click="abrirFormulario">
        + Nuevo videojuego
      </button>
    </div>

    <div v-if="error" class="message error">{{ error }}</div>
    <div v-if="mensaje" class="message success">{{ mensaje }}</div>

    <section v-if="mostrarFormulario" class="form-card">
      <h3>{{ juegoEditandoId !== null ? 'Editar videojuego' : 'Registrar videojuego' }}</h3>
      <form @submit.prevent="guardarVideojuego">
        <div class="form-grid">
          <label>
            Título *
            <input v-model.trim="form.title" required maxlength="255" placeholder="Ej. Spider-Man 2">
          </label>

          <label>
            Plataforma *
            <select v-model="form.platform" required>
              <option value="" disabled>Selecciona una plataforma</option>
              <option>PS5</option>
              <option>PS4</option>
              <option>PS3</option>
              <option>PS Vita</option>
            </select>
          </label>

          <label>
            Precio (USD) *
            <input v-model.number="form.price" type="number" min="0" step="0.01" required>
          </label>

          <label>
            Existencias *
            <input v-model.number="form.stock" type="number" min="0" step="1" required>
          </label>

          <label>
            Género
            <input v-model.trim="form.genre" maxlength="80" placeholder="Ej. Acción">
          </label>

          <label>
            URL de imagen
            <input v-model.trim="form.image_url" type="url" maxlength="255" placeholder="https://...">
          </label>

          <label class="full-width">
            Descripción
            <textarea v-model.trim="form.description" rows="3" placeholder="Descripción del videojuego"></textarea>
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="cerrarFormulario">
            Cancelar
          </button>

          <button type="submit" class="primary-button" :disabled="guardando">
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
    <section class="table-card">
      <div class="table-heading">
        <div>
          <h3>Videojuegos registrados</h3>
          <p>{{ juegosActivos.length }} videojuegos activos</p>
        </div>
      </div>

      <p v-if="cargando" class="empty-state">Cargando videojuegos...</p>
      <p v-else-if="juegosActivos.length === 0" class="empty-state">
        No hay videojuegos activos para mostrar.
      </p>

      <div v-else class="table-container">
        <table>
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
                <small>ID: {{ juego.id }}</small>
              </td>
              <td>{{ juego.platform }}</td>
              <td>{{ juego.genre || 'Sin género' }}</td>
              <td class="price">{{ formatoPrecio(juego.price) }}</td>
              <td>{{ juego.stock }}</td>
              <td>
                <span class="status" :class="juego.stock > 0 ? 'available' : 'out-of-stock'">
                  {{ juego.stock > 0 ? 'Disponible' : 'Agotado' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="edit-button" @click="editarVideojuego(juego)">Editar</button>
                  <button class="delete-button" @click="desactivarVideojuego(juego)">Desactivar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- SECCIÓN 2: Juegos Desactivados -->
    <section v-if="juegosDesactivados.length > 0" class="table-card deactivated-section">
      <div class="table-heading">
        <div>
          <h3>Videojuegos desactivados</h3>
          <p>{{ juegosDesactivados.length }} videojuegos inactivos</p>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Videojuego</th>
              <th>Plataforma</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="juego in juegosDesactivados" :key="juego.id">
              <td>
                <div class="game-name">{{ juego.title }}</div>
                <small>ID: {{ juego.id }}</small>
              </td>
              <td>{{ juego.platform }}</td>
              <td>{{ juego.stock }}</td>
              <td>
                <button class="activate-button" @click="activarVideojuego(juego)">
                  Activar de nuevo
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
  <!-- Modal Confirmación Desactivar -->
  <div v-if="mostrarModalDesactivar" class="modal-overlay" @click.self="cerrarModalDesactivar">
    <div class="modal-card">
      <h3>Confirmar desactivación</h3>
      <p>
        ¿Estás seguro que deseas desactivar el videojuego <br>
        <strong class="text-highlight">"{{ juegoADesactivar?.title }}"</strong>?
      </p>

      <p v-if="errorModalDesactivar" class="error modal-error">{{ errorModalDesactivar }}</p>

      <div class="modal-actions">
        <button class="btn-cancel" @click="cerrarModalDesactivar" :disabled="desactivando">
          Cancelar
        </button>
        <button class="btn-delete" @click="confirmarDesactivar" :disabled="desactivando">
          {{ desactivando ? 'Desactivando...' : 'Sí, desactivar' }}
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
      mostrarModalDesactivar: false,
      juegoADesactivar: null,
      desactivando: false,
      errorModalDesactivar: ''
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
        // Agregamos ?all=true para traer activos e inactivos
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
    },


    async desactivarVideojuego(juego) {
      // Abre el modal y guarda el juego seleccionado
      this.juegoADesactivar = juego;
      this.errorModalDesactivar = '';
      this.mostrarModalDesactivar = true;
    },

    cerrarModalDesactivar() {
      // Cierra el modal y limpia los datos
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

    async activarVideojuego(juego) {
      const confirmado = window.confirm(`¿Deseas activar el videojuego "${juego.title}" nuevamente?`);
      if (!confirmado) return;

      this.error = '';
      this.mensaje = '';

      try {
        // Usamos el método PATCH (update) que ya existe en Laravel
        await api.patch(`/games/${juego.id}`, {
          is_active: true
        });

        this.mensaje = 'Videojuego activado correctamente.';
        await this.cargarVideojuegos();
      } catch (e) {
        this.error = e.response?.data?.message || 'No se pudo activar el videojuego.';
      }
    },

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

        this.mostrarFormulario = false
        this.form = this.formularioVacio()
        this.mensaje = 'Videojuego registrado correctamente.'

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
.games-page {
  color: #f5f3fa;
}

.page-heading,
.table-heading,
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
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
  color: #ffb4ba;
  /* Rojo suave para advertencia */
  font-size: 16px;
}

.modal-error {
  margin-top: 16px;
  margin-bottom: 0;
  font-size: 13px;
}

.deactivated-section {
  border: 1px solid #3b2a30;
  background: #121016;
}

.activate-button {
  background: #193c32;
  color: #8ee6bb;
  border: 0;
  padding: 8px 12px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.activate-button:hover {
  background: #235345;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #4b5563;
  color: #d1d5db;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel:hover:not(:disabled) {
  background: #374151;
}

.btn-delete {
  background: #48262b;
  color: #ffb4ba;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.btn-delete:hover:not(:disabled) {
  background: #603039;
}

.btn-cancel:disabled,
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-heading {
  margin-bottom: 24px;
}

.page-heading h2,
.table-heading h3,
.form-card h3 {
  margin: 0 0 8px;
}

.page-heading p,
.table-heading p {
  margin: 0;
  color: #a6a0b5;
  font-size: 13px;
}

.primary-button,
.secondary-button {
  padding: 12px 16px;
  border: 0;
  border-radius: 9px;
  font-weight: bold;
  cursor: pointer;
}

.primary-button {
  background: #8b5cf6;
  color: white;
}

.primary-button:hover {
  background: #7c3aed;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background: #302a40;
  color: #e5def4;
}

.form-card,
.table-card {
  margin-bottom: 24px;
  padding: 24px;
  border: 1px solid #292536;
  border-radius: 15px;
  background: #17151f;
}

.form-card h3 {
  margin-bottom: 22px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #c9c3d7;
  font-size: 13px;
}

.form-grid input,
.form-grid select,
.form-grid textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #383246;
  border-radius: 8px;
  outline: none;
  background: #100f16;
  color: white;
  font: inherit;
}

.form-grid input:focus,
.form-grid select:focus,
.form-grid textarea:focus {
  border-color: #8b5cf6;
}

.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  justify-content: flex-end;
  margin-top: 22px;
}

.table-heading {
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

th,
td {
  padding: 16px 12px;
  border-bottom: 1px solid #302a40;
  white-space: nowrap;
}

th {
  color: #a6a0b5;
  font-weight: normal;
}

.game-name {
  font-weight: bold;
}

td small {
  display: block;
  margin-top: 5px;
  color: #817a94;
}

.price {
  color: #c4a7ff;
  font-weight: bold;
}

.status {
  display: inline-block;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 11px;
}

.available {
  background: #193c32;
  color: #65d6a0;
}

.out-of-stock {
  background: #49301c;
  color: #ffc078;
}

.message {
  margin-bottom: 18px;
  padding: 13px 16px;
  border-radius: 9px;
}

.error {
  background: #48262b;
  color: #ffb4ba;
}

.success {
  background: #193c32;
  color: #8ee6bb;
}

.empty-state {
  padding: 25px 0;
  color: #a6a0b5;
  text-align: center;
}

@media (max-width: 650px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .form-card,
  .table-card {
    padding: 16px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .edit-button,
  .delete-button {
    padding: 8px 12px;
    border: 0;
    border-radius: 7px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
  }

  .edit-button {
    background: #302345;
    color: #c4a7ff;
  }

  .delete-button {
    background: #48262b;
    color: #ffb4ba;
  }

  .edit-button:hover {
    background: #45315f;
  }

  .delete-button:hover {
    background: #603039;
  }
}
</style>
