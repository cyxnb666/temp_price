<template>
  <t-tabs v-model="tabValue" :onChange="tabChange">
    <!-- 默认插槽 和 具名插槽（panel）都是用来渲染面板内容 -->
    <t-tab-panel :value="tab.value" :label="tab.label" v-for="tab in tabList" :key="tab.value"  :destroyOnHide="false">
      <tab-table :tab="tab" :ref="tab.value" :veggeCategory="veggeCategory"></tab-table>
    </t-tab-panel>
  </t-tabs>
</template>
<script>
import tabTable from './tabTable.vue';
export default {
  components: { tabTable },
  data() {
    return {
      tabList: [
        { label: '按果径', value: 'DIAMETER' },
        { label: '按重量', value: 'WEIGHT' },
      ],
      tabValue: 'DIAMETER',
      veggeCategory:{},
      formData: {
        fvSpecsMax: '',
        fvSpecsMin: '',
        specsId: '',
        specsType: '',
        varietyId: '',
        varietyUnit: '',
      },
    };
  },
  methods: {
    tabChange(val){
      this.$refs[val][0].init(this.veggeCategory)
    },
    init(node) {
      this.veggeCategory = node;
      this.$refs[this.tabValue][0].init(node)
    },
  },
};
</script>