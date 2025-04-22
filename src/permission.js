import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style

import store from '@/store';
import router from '@/router';

NProgress.configure({ showSpinner: false });

const whiteListRouters = store.getters['permission/whiteListRouters'];

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const token = store.getters['user/token'];
  // console.log(token)
  if (token) {
    if (to.path === '/login') {
      setTimeout(() => {
        store.dispatch('user/logout');
        store.dispatch('permission/restore');
      });
      next();
      return;
    }

    const menu = store.getters['user/menu'];
    // console.log(menu)
    if (menu && menu.length > 0) {
      next();
    } else {
      try {
        store.dispatch('user/getUserMenu').then(res => {
          // console.log(res)
          if (res && res.length) {
            store.dispatch('permission/initRoutes', store.getters['user/menu']).then(() => {
              next({ ...to });
              store.dispatch('user/getRoleList');
            });
          } else {
            next(`/login?redirect=${to.path}`);
          }
        }).catch(()=>{
          next(`/login?redirect=${to.path}`);
        });
      } catch (error) {
        console.log(error, 'cuow')
        await store.commit('user/removeToken');
        next(`/login?redirect=${to.path}`);
        NProgress.done();
      }
    }
  } else {
    /* white list router */
    if (whiteListRouters.indexOf(to.path) !== -1) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
    }
    NProgress.done();
  }
});

router.afterEach(() => {
  NProgress.done();
});
