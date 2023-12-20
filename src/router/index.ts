import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
      props: route => ({
        redirect: route.query.redirect || '/',
      }),
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('@/views/MessagesView.vue'),
      props: route => ({
        filter: route.query.filter === 'true',
        eventId:
          typeof route.query.eventId === 'string'
            ? parseInt(route.query.eventId) || undefined
            : undefined,
      }),
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('@/views/EventsView.vue'),
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('@/views/UploadView.vue'),
    },
  ],
})

router.beforeEach((to, from) => {
  if (!to.meta.public && !localStorage.getItem('token')) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }
})

export default router
