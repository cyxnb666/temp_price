import { TOKEN_NAME, MENU_NAME ,USERINFO} from '@/config/global';
import axiosInstance from '@/utils/request';
import { isURL, validatenull } from "@/utils/validate"
import { cloneDeep } from "lodash";
const InitUserInfo = {
  roles: [],
};

// 定义的state初始值
const state = {
  token: sessionStorage.getItem(TOKEN_NAME), // 默认token不走权限
  userInfo: JSON.parse(sessionStorage.getItem(USERINFO)),
  menu: [],
  roleList: []
};

const mutations = {
  setToken(state, token) {
    sessionStorage.setItem(TOKEN_NAME, token);
    state.token = token;
  },
  setRoleList(state, roleList) {
    state.roleList = roleList
  },
  removeToken(state) {
    sessionStorage.removeItem(TOKEN_NAME);
    state.token = '';
  },
  SET_MENU: (state, params) => {
    let { menu } = params;
    state.menu = menu
  },
  setUserInfo(state, userInfo) {
    sessionStorage.setItem(USERINFO, JSON.stringify(userInfo));
    state.userInfo = userInfo;
  },
};

const getters = {
  token: (state) => state.token,
  roles: (state) => state.userInfo?.roles,
  menu: (state) => state.menu,
  userInfo: (state) => state.userInfo,
  roleList:(state) => state.roleList
};

const actions = {
  async login({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      // 登录请求流程
      axiosInstance.post('/web/auth/login', {
        ...userInfo
      },{headers:{
        "jsessionid":userInfo.jsessionid
      }})
        .then((res: any) => {
          if (res.retCode === 200) {
            const { token } = res.retData
            commit('setToken', token);
            resolve(res.retData)
            commit('setUserInfo', res.retData);
          } else {
            reject()
            throw res;
          }
        })
        .catch((e: Error) => {
          reject()
          console.log(e);
        })
    })


  },
  async getUserMenu({ commit, state }) {
    return new Promise((resolve, reject) => {
      axiosInstance.post('/web/menu/selectMyVisibleMenus').then((res: any) => {
        if (res.retCode === 200) {
          const data = res.retData
          let menu = cloneDeep(data)
          commit('SET_MENU', { menu })
          resolve(menu)
        } else {
          reject()
        }
      })
    })
  },
  async getRoleList({ commit, state }, params = {
    "condition": {
      "menus": [],
      "remark": "",
      "roleId": 0,
      "roleName": ""
    },
    "pageNo": 1,
    "pageSize": 10000
  }) {
    return new Promise((resolve, reject) => {
      axiosInstance.post('/web/role/pageQueryRoles', params).then((res: any) => {
        if (res.retCode === 200) {
          const { records = [] } = res.retData;
          this.data = records;
          commit('setRoleList', { records });
          resolve(res)
        } else {
          reject()
        }
      })
    })


  },
  async logout({ commit }) {
    return new Promise((resolve, reject) => {
      axiosInstance.get('/web/auth/logout').then(res => {
        resolve(res)
        commit('removeToken');
        commit('setUserInfo', InitUserInfo);
      })
    })
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
