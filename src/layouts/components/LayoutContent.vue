<template>
  <t-layout :class="[`${prefix}-layout`]">
    <t-content :class="`${prefix}-content-layout`">
      <layout-breadcrumb v-if="setting.showBreadcrumb" />
      <common-content />
    </t-content>
  </t-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { RefreshIcon, ArrowLeftIcon, ArrowRightIcon, HomeIcon, CloseCircleIcon } from 'tdesign-icons-vue';

import CommonContent from './Content.vue';
import LayoutBreadcrumb from './Breadcrumb.vue';

import { prefix } from '@/config/global';
import { SettingType } from '@/interface';

export default Vue.extend({
  name: 'LayoutContent',
  components: {
    CommonContent,
    LayoutBreadcrumb,
    RefreshIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    HomeIcon,
    CloseCircleIcon,
  },
  data() {
    return {
      prefix,
      activeTabPath: '',
    };
  },
  computed: {
    ...mapGetters({
      mode: 'setting/mode',
      isUseTabsRouter: 'setting/isUseTabsRouter',
      menuRouters: 'permission/routers',
      tabRouterList: 'tabRouter/tabRouterList',
    }),
    setting(): SettingType {
      return this.$store.state.setting;
    },
  },
  methods: {
    handleRemove(path: string, routeIdx: number) {
      const nextRouter = this.tabRouterList[routeIdx + 1] || this.tabRouterList[routeIdx - 1];

      this.$store.commit('tabRouter/subtractCurrentTabRouter', { path, routeIdx });
      if (path === this.$router.history?.current?.path) {
        this.$router.push(nextRouter.path);
      }
    },
    handleChangeCurrentTab(path: string) {
      this.$router.push(path);
    },
    handleRefresh(currentPath: string, routeIdx: number) {
      this.$store.commit('tabRouter/toggleTabRouterAlive', routeIdx);
      this.$nextTick(() => {
        this.$store.commit('tabRouter/toggleTabRouterAlive', routeIdx);
        this.$router.replace({ path: currentPath });
      });
      this.activeTabPath = null;
    },
    handleCloseAhead(path: string, routeIdx: number) {
      this.$store.commit('tabRouter/subtractTabRouterAhead', { path, routeIdx });
      this.handleOperationEffect('ahead', routeIdx);
    },
    handleCloseBehind(path: string, routeIdx: number) {
      this.$store.commit('tabRouter/subtractTabRouterBehind', { path, routeIdx });
      this.handleOperationEffect('behind', routeIdx);
    },
    handleCloseOther(path: string, routeIdx: number) {
      this.$store.commit('tabRouter/subtractTabRouterOther', { path, routeIdx });
      this.handleOperationEffect('other', routeIdx);
    },
    handleOperationEffect(type: 'other' | 'ahead' | 'behind', routeIndex: number) {
      const currentPath = this.$router.history?.current?.path;
      const tabRouters = this.tabRouterList;
      const currentIdx = tabRouters.findIndex((i: { path: string }) => i.path === currentPath);
      // 存在三种情况需要刷新当前路由
      // 点击非当前路由的关闭其他、点击非当前路由的关闭左侧且当前路由小于触发路由、点击非当前路由的关闭右侧且当前路由大于触发路由
      const needRefreshRouter =
        (type === 'other' && currentIdx !== routeIndex) ||
        (type === 'ahead' && currentIdx < routeIndex) ||
        (type === 'behind' && currentIdx === -1);
      if (needRefreshRouter) {
        const nextRouteIdx = type === 'behind' ? tabRouters.length - 1 : 1;
        const nextRouter = this.tabRouterList[nextRouteIdx];

        this.$router.push(nextRouter.path);
      }

      this.activeTabPath = null;
    },
    handleTabMenuClick(visible: boolean, ctx, path: string) {
      if (ctx?.trigger === 'document') this.activeTabPath = null;
      if (visible) this.activeTabPath = path;
    },
  },
});
</script>
