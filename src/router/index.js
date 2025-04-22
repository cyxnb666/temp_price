import VueRouter from 'vue-router';

import baseRouters from './modules/base';
import priceLocationRouter from './modules/priceLocation';
import pricingTasksRouters from './modules/pricingTasks';

const env = import.meta.env.MODE || 'development';

// 存放动态路由
export const  asyncRouterList = [...pricingTasksRouters,...priceLocationRouter,...baseRouters];

// 存放固定的路由
export const defaultRouterList = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
  },
  {
    path: '/404',
    component: () =>
      import( /* webpackChunkName: "page" */ '@/pages/result/404/index.vue'),
    name: '404',
  },

];

const createRouter = () =>
  new VueRouter({
    mode: 'hash',
    base: env === 'site' ? '/starter/vue/' : null,
    routes: defaultRouterList,
    scrollBehavior() {
      return { x: 0, y: 0 };
    },
  });

const router = createRouter();

export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
