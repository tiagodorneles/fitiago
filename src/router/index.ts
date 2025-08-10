import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import WorkoutsView from '../views/WorkoutsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WorkoutsView,
    },
  ],
})

export default router
