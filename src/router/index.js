import { createRouter, createWebHistory } from 'vue-router'
import ModelView from '../views/ModelView.vue'
import ST038 from '../views/ST038.vue'
import ST034 from '../views/ST034.vue'
import ST030 from '../views/ST030.vue'
import ST026 from '../views/ST026.vue'
import ST022 from '../views/ST022.vue'
import ST023 from '../views/ST023.vue'
import ST017 from '../views/ST017.vue'
import ST010 from '../views/ST010.vue'
import ST018 from '../views/ST018.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: ModelView
    },
    {
      path: '/model',
      name: 'model',
      component: ModelView
    },
    {
      path: '/ST_0.38',
      name: 'ST038',
      component: ST038
    },
    {
      path: '/ST_0.34',
      name: 'ST034',
      component: ST034
    },
    {
      path: '/ST_0.30',
      name: 'ST030',
      component: ST030
    },
    {
      path: '/ST_0.26',
      name: 'ST026',
      component: ST026
    },
    {
      path: '/ST_0.22',
      name: 'ST022',
      component: ST022
    },
    {
      path: '/ST_0.23',
      name: 'ST023',
      component: ST023
    },
    {
      path: '/ST_0.17',
      name: 'ST017',
      component: ST017
    },
    {
      path: '/ST_0.18',
      name: 'ST018',
      component: ST018
    },
    {
      path: '/ST_0.10',
      name: 'ST017',
      component: ST010
    }
  ]
})

export default router
