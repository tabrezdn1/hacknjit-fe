import { createRouter, createWebHistory } from 'vue-router'
import WavesForm from './components/WavesForm.vue'
import LandingPage from './components/LandingPage.vue'
import WaveSimulate from './components/WaveSimulate.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: LandingPage,
    },
    {
        path: "/home",
        component: LandingPage,
      },
    {
      path: "/waves-form",
      component: WavesForm,
    },
    {
      path: "/waves-simulate",
      component: WaveSimulate,
    },
  ],
});
