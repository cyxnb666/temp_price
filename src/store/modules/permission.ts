import { resetRouter, defaultRouterList, asyncRouterList} from '@/router';
import router from '@/router';
const PermisId = []
function filterPermissionsRouters(routes) {
  getPromisId(routes)
  const res = [];
  asyncRouterList.forEach((route) => {
    const children = [];
    route.children?.forEach((childRouter) => {
      const menuId = childRouter.meta?.menuId;
      if (PermisId.indexOf(menuId) !== -1) {
        children.push(childRouter);
      }
    });
    if (children.length > 0) {
      route.children = children;
      res.push(route);
    }
  });
  console.log(res)
  return res;
}
function getPromisId(menu) {
  menu.forEach(v => {
    if (v.children && v.children.length) {
      getPromisId(v.children)
    }
    PermisId.push(v.menuId)
  })
}
const state = {
  whiteListRouters: ['/login'],
  routers: [],
};

const mutations = {
  setRouters: (state, routers) => {
    state.routers = routers;
  },
};

const getters = {
  routers: (state) => state.routers,
  whiteListRouters: (state) => state.whiteListRouters,
};

const actions = {
  async initRoutes({ commit, state }, menu) {
    let accessedRouters = [...defaultRouterList, ...filterPermissionsRouters(menu)];
    commit('setRouters', accessedRouters);
  console.log(accessedRouters,'accessedRouters')
    state.routers.forEach(route => {
      router.addRoute(route);
    });
  },
  async restore({ commit }) {
    // remove routers
    resetRouter();
    commit('setRouters', []);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
