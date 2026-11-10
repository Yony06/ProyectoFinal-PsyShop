<template>
  <div class="dashboard-content">
    <section class="welcome">
      <div>
        <p class="eyebrow">CENTRO DE CONTROL</p>
        <h2>Bienvenido a PsyShop</h2>
        <p>Administra tu tienda de videojuegos desde un solo lugar.</p>
      </div>
      <div class="welcome-icon">🎮</div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-top">
          <span>Videojuegos</span>
          <span class="stat-icon purple">🎮</span>
        </div>
        <h3>03</h3>
        <p>Productos registrados</p>
      </article>

      <article class="stat-card">
        <div class="stat-top">
          <span>Pedidos</span>
          <span class="stat-icon blue">▤</span>
        </div>
        <h3>01</h3>
        <p>Pedido de prueba registrado</p>
      </article>

      <article class="stat-card">
        <div class="stat-top">
          <span>Pendientes</span>
          <span class="stat-icon orange">◷</span>
        </div>
        <h3>01</h3>
        <p>Por gestionar</p>
      </article>

      <article class="stat-card">
        <div class="stat-top">
          <span>Ventas registradas</span>
          <span class="stat-icon green">$</span>
        </div>
        <h3>$59.99</h3>
        <p>Total de pedidos de prueba</p>
      </article>
    </section>

    <section class="content-card">
      <div class="section-heading">
        <div>
          <h2>Accesos rápidos</h2>
          <p>Administra las áreas principales de la tienda.</p>
        </div>
      </div>

      <div class="quick-grid">
        <router-link to="/videojuegos" class="quick-item">
          <span class="quick-icon">🎮</span>
          <div>
            <strong>Videojuegos</strong>
            <p>Gestionar el catálogo</p>
          </div>
          <span class="arrow">→</span>
        </router-link>

        <div class="quick-item">
          <span class="quick-icon">📦</span>
          <div>
            <strong>Pedidos</strong>
            <p>Consultar las compras</p>
          </div>
          <span class="arrow">→</span>
        </div>

        <div class="quick-item">
          <span class="quick-icon">📊</span>
          <div>
            <strong>Inventario</strong>
            <p>Revisar existencias</p>
          </div>
          <span class="arrow">→</span>
        </div>
      </div>
    </section>

    <footer class="footer">
      PsyShop Admin · Panel de gestión
    </footer>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 30px;
  margin-bottom: 28px;
  border-radius: 18px;
  background: linear-gradient(120deg, #211638, #39205b);
  color: white;
}

.eyebrow {
  color: #b99aff;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 2px;
}

.welcome h2 {
  margin: 10px 0;
  font-size: 28px;
}

.welcome p {
  color: #d0c7df;
}

.welcome-icon {
  font-size: 55px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 28px;
}

.stat-card,
.content-card {
  padding: 22px;
  border: 1px solid #292536;
  border-radius: 16px;
  background: #17151f;
  color: #f5f3fa;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #bcb7ca;
}

.stat-icon {
  padding: 8px;
  border-radius: 9px;
}

.purple { background: #382354; }
.blue { background: #1b304f; }
.orange { background: #49301c; }
.green { background: #193c32; }

.stat-card h3 {
  margin: 22px 0 8px;
  font-size: 30px;
}

.stat-card p,
.section-heading p,
.quick-item p {
  color: #a6a0b5;
  font-size: 13px;
}

.section-heading {
  margin-bottom: 22px;
}

.section-heading h2 {
  margin-bottom: 8px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #302a40;
  border-radius: 12px;
  color: white;
  text-decoration: none;
}

.quick-item p {
  margin-top: 6px;
}

.quick-icon {
  font-size: 24px;
}

.arrow {
  margin-left: auto;
  color: #b99aff;
}

.footer {
  padding: 28px 0 8px;
  color: #8f899f;
  font-size: 12px;
}

@media (max-width: 1000px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 550px) {
  .welcome {
    padding: 20px;
  }

  .welcome h2 {
    font-size: 22px;
  }

  .welcome-icon {
    font-size: 35px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
