<template>
  <t-breadcrumb :max-item-width="'150'" class="tdesign-breadcrumb">
    <t-breadcrumbItem v-for="item in crumbs" :key="item.to" :to="item.to">
      {{ item.title }}
    </t-breadcrumbItem>
  </t-breadcrumb>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TdesignStarterBreadcrumb',
  props: {
    isVisible: Boolean,
  },
  computed: {
    crumbs() {
      // 使用matched数组创建基础面包屑
      let breadcrumbs = this.$route.matched.map((route, idx) => {
        return {
          path: route.path,
          to: route.path,
          title: route.meta?.title || route.path.split('/').pop(),
        };
      });

      // 处理当前路由的特殊情况
      const currentRoute = this.$route.matched[this.$route.matched.length - 1];

      // 如果当前路由指定了父级路由，检查其是否在面包屑中
      if (currentRoute?.meta?.parent) {
        const parentName = currentRoute.meta.parent;

        // 查找父级路由
        const routes = this.$router.options.routes;
        let parentRoute = null;
        
        // 遍历查找父级路由
        for (const route of routes) {
          if (route.children) {
            for (const child of route.children) {
              if (child.name === parentName) {
                parentRoute = child;
                break;
              }
            }
          }
          if (parentRoute) break;
        }
        
        if (parentRoute) {
          // 构建完整的父级路径
          const baseRoutePath = this.$route.path.split('/').slice(0, 2).join('/');
          const parentFullPath = `${baseRoutePath}/${parentRoute.path}`;
          
          // 检查是否已经存在该面包屑
          if (!breadcrumbs.some(b => b.to === parentFullPath)) {
            // 找到当前路由在面包屑中的位置
            const currentIndex = breadcrumbs.length - 1;
            
            // 创建父级面包屑
            const parentCrumb = {
              path: parentRoute.path,
              to: parentFullPath,
              title: parentRoute.meta?.title || parentRoute.path
            };
            
            // 插入父级面包屑
            breadcrumbs = [
              ...breadcrumbs.slice(0, currentIndex),
              parentCrumb,
              breadcrumbs[currentIndex]
            ];
          }
        }
      }
      
      return breadcrumbs;
    },
  },
});
</script>
<style scoped>
.tdesign-breadcrumb {
  margin-bottom: 8px;
}
</style>