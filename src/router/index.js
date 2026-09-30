import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../pages/Dashboard.vue') },
      { path: 'nasabah', name: 'Nasabah', component: () => import('../pages/Nasabah.vue') },
      { path: 'nasabah/:id', name: 'NasabahDetail', component: () => import('../pages/NasabahDetail.vue') },
      { path: 'jenis-sampah', name: 'JenisSampah', component: () => import('../pages/JenisSampah.vue') },
      { path: 'setoran/baru', name: 'Setoran', component: () => import('../pages/Setoran.vue') },
      { path: 'penarikan', name: 'Penarikan', component: () => import('../pages/Penarikan.vue') },
      { path: 'transaksi', name: 'Transaksi', component: () => import('../pages/Transaksi.vue') },
      { path: 'transaksi/:id', name: 'TransaksiDetail', component: () => import('../pages/TransaksiDetail.vue') },
      { path: 'laporan', name: 'Laporan', component: () => import('../pages/Laporan.vue') },
      { path: 'pengguna', name: 'Pengguna', component: () => import('../pages/Pengguna.vue'), meta: { adminOnly: true } },
      { path: 'pengaturan', name: 'Pengaturan', component: () => import('../pages/Pengaturan.vue') },
      { path: 'tidak-diizinkan', name: 'TidakDiizinkan', component: () => import('../pages/TidakDiizinkan.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.public) {
    if (authStore.isAuthenticated && to.name === 'Login') return next('/')
    return next()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (to.meta.adminOnly && !authStore.isAdmin) {
    return next('/tidak-diizinkan')
  }

  if (authStore.isAuthenticated) {
    if (authStore.checkTimeout()) {
      return next('/login')
    }
    authStore.updateLastActive()
  }

  next()
})

export default router
