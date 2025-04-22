<template>
  <t-card :bordered="false">
    <div class="table-tree-container">
      <div class="list-tree-wrapper">
        <div class="list-tree-operator" v-loading="loading">
          <t-input v-model="filterText" @change="onInput" placeholder="请输入关键词">
            <search-icon slot="suffix-icon" size="20px" />
          </t-input>
          <t-tree
            :data="items"
            :keys="treeProps"
            hover
            v-model="checks"
            height="90%"
            :checkable="checkable"
            :check-strictly="checkStrictly"
            :value-mode="valueMode"
            expand-on-click-node
            :default-expanded="expanded"
            :filter="filterByText"
            @change="treeClick"
          />
        </div>
        <div class="list-tree-content">
          <common-table ref="tab" />
        </div>
      </div>
    </div>
  </t-card>
</template>
  <script>
import { SearchIcon } from 'tdesign-icons-vue';
import CommonTable from './components/CommonTable.vue';

export default {
  name: 'ListTree',
  components: {
    SearchIcon,
    CommonTable,
  },
  data() {
    return {
      valueMode: 'all',
      checkable: true,
      checkStrictly: false,
      checks:[],
      data: [],
      loading: false,
      filterText: '',
      filterByText: null,
      value: 'first',
      expanded: [],
      items: [],
      treeProps: {
        label: 'areaname',
        value: 'areacode',
        children: 'children',
      },
    };
  },
  created() {
    this.getAreaList();
  },
  methods: {
    getAreaList() {
      this.loading = true;
      this.$request
        .get('/web/area/selectWholeAreaTrees')
        .then((res) => {
          this.loading = false;
          console.log(res, 'res');
          if (res.retCode === 200) {
            this.items = res.retData || [];
          }
        })
        .catch((e) => {
          this.loading = false;
          console.log(e);
        });
    },
    treeClick() {
      console.log(this.checks);
      this.$refs.tab.formData.areaCodes = this.checks;
      this.$refs.tab.getList(true)
    },
    onInput() {
      if (this.filterText) {
        // 存在过滤文案，才启用过滤
        this.filterByText = (node) => {
          console.log(node);
          const rs = node.data.areaname.indexOf(this.filterText) >= 0;
          return rs;
        };
      } else {
        // 过滤文案为空，则还原 tree 为无过滤状态
        this.filterByText = null;
      }
    },
    rehandleClickOp({ text, row }) {
      console.log(text, row);
    },
  },
};
</script>
  
  <style lang="less" scoped>
@import '@/style/variables.less';

.table-tree-container {
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);

  .t-tree {
    margin-top: 24px;
  }
}

.list-tree-wrapper {
  overflow-y: hidden;
}

.list-tree-operator {
  width: 300px;
  float: left;
  padding: 30px 32px;
  height: 700px;
}

.list-tree-content {
  border-left: 1px solid var(--td-component-border);
  overflow: auto;
}
</style>
  