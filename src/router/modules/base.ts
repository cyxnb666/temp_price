import { SettingIcon, DashboardIcon } from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/roles',
    name: 'setting',
    meta: {
      title: '基础设置',
      icon: SettingIcon,
      menuId: 1
    },
    children: [
      {
        path: 'roles',
        name: 'settingRoles',
        component: () => import('@/pages/setting/roles/index.vue'),
        meta: { title: '角色权限', menuId: 2 },
      },
      {
        path: 'sysUser',
        name: 'settingSysUser',
        component: () => import('@/pages/setting/sysUser/index.vue'),
        meta: { title: '系统用户', menuId: 3 },
      },
      {
        path: 'priceUserMange',
        name: 'settingPriceUser',
        component: () => import('@/pages/setting/priceUserMange/index.vue'),
        meta: { title: '采价员管理', menuId: 4 },
      },
      {
        path: 'fruitOrvegetableCategory',
        name: 'settingCategory',
        component: () => import('@/pages/setting/fruitOrvegetableCategory/index.vue'),
        meta: { title: '果蔬品类', menuId: 5 },
      },
    ],
  },

];
