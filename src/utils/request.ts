import axios from 'axios';
import proxy from '../config/host';
import { MessagePlugin } from 'tdesign-vue';
import { TOKEN_NAME } from '@/config/global';
import store from "@/store"
import router from "@/router"
const env = import.meta.env.MODE || 'development';

const API_HOST = env === 'mock' ? '/' : proxy[env].API; // 如果是mock模式 就不配置host 会走本地Mock拦截

const CODE = {
  LOGIN_TIMEOUT: 1000,
  REQUEST_SUCCESS: 200,
  REQUEST_FOBID: 1001,
  TOKEN_FAILURE: [406,504]
};
const CodeMessage = {
  404: '请求的资源未找到，请检查地址',
  406: 'token过期请退出重新登录',
  500: '服务器内部错误，请稍后重试',
  400: '请求无效，请检查请求参数',
}
const instance = axios.create({
  baseURL: API_HOST,
  timeout: 1000 * 60 * 2,
  withCredentials: true,
});

// eslint-disable-next-line
// @ts-ignore
// axios的retry ts类型有问题
instance.interceptors.retry = 3;

instance.interceptors.request.use((config) => {
  config.headers['X-Access-Token'] = sessionStorage.getItem(TOKEN_NAME)//携带权限参数'
  return config
});

instance.interceptors.response.use(
  (response) => {
    // console.log(response)
    if (response.status === 200) {
      const { data } = response;
      if(response.config.responseType === "arraybuffer"){
        return response
      }
      if (data.retCode === CODE.REQUEST_SUCCESS) {
        return data;
      } else if (CODE.TOKEN_FAILURE.includes(data.retCode)) {
        MessagePlugin.error(data.retMsg || CodeMessage[data.retCode])
        store.dispatch('user/logout').then(() => {
          router.push(`/login`);
        })
      } else {
        MessagePlugin.error(data.retMsg || CodeMessage[data.retCode])
      }
      return response;
    } else {
      MessagePlugin.error('系统错误,请联系管理员')
    }
  },
  (err) => {
    console.log(err)
      const { config } = err;

    if (!config || !config.retry) return Promise.reject(err);

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= config.retry) {
      return Promise.reject(err);
    }

    config.retryCount += 1;

    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        resolve({});
      }, config.retryDelay || 1);
    });

    return backoff.then(() => instance(config));
  },
);

export default instance;
