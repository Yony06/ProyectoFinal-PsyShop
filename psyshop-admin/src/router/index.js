
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OrdersView from '../views/OrdersView.vue'
import InventoryView from '../views/InventoryView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/videojuegos',
    name: 'videojuegos',
    component: () => import('../views/GamesView.vue')
  },
  {
  path: '/pedidos',
  name: 'pedidos',
  component: OrdersView,
},
{
   path: '/inventario',
  name: 'inventario',
  component: InventoryView,
},
{
  path: '/login',
  name: 'login',
  component: LoginView
},

]


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (to.name !== 'login' && !token) {
    return { name: 'login' }
  }

  if (to.name === 'login' && token) {
    return { name: 'home' }
  }
})

export default router

