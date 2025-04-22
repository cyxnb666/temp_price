<template>
  <t-card :bordered="false">
    <div class="table-tree-container">
      <div class="list-tree-wrapper">
        <div class="list-tree-operator">
          <t-button @click="addCategory" :style="{ marginLeft: '8px' }"> 新增品种 </t-button>
          <t-tree
            :data="items"
            :keys="treeProps"
            hover
            :actived="actived"
            :activable="true"
            transition
            expandAll
            v-loading="loading"
            height="90%"
            :valueMode="valueMode"
            expand-on-click-node
            :onClick="treeClick"
          />
        </div>
        <div class="list-tree-content" v-show="actived.length">
          <common-table :actived="actived" :fruiveggieVarietyList="fruiveggieVarietyList" ref="veggietable" />
          <tabComponent :actived="actived" ref="tabComponent" />
        </div>
        <div
          class="list-tree-content"
          style="display: flex; align-items: center; justify-content: center; height: 100vh"
          v-show="!actived.length"
        >
          <t-empty />
        </div>
      </div>
    </div>
    <t-dialog
      :header="title"
      :destroyOnClose="true"
      :cancelBtn="null"
      :confirmBtn="null"
      :visible.sync="confirmVisible"
      :onClose="onCancel"
      v-loading="loading"
    >
      <t-form ref="form" @submit="onSubmit" :data="form" :rules="FORM_RULES" label-align="left" :label-width="90">
        <t-form-item label="品种类别" name="parentId">
          <t-select
            clearable
            v-model="form.parentId"
            class="form-item-content`"
            :options="fruiveggieVarietyList"
            placeholder="请选择品种类别"
          />
        </t-form-item>
        <t-form-item label="品种" name="varietyName">
          <t-input v-model="form.varietyName" maxlength="20" placeholder="请输入品种名称" />
        </t-form-item>
        <t-form-item label="上市时间" name="saleDate">
          <t-select
            clearable
            v-model="form.saleDate"
            class="form-item-content`"
            :options="MONTH_LIST"
            placeholder="请选择上市时间"
          />
        </t-form-item>
        <t-form-item :statusIcon="false" style="display: flex; justify-content: flex-end">
          <t-space size="10px">
            <t-button theme="default" variant="base" @click="onCancel">取消</t-button>
            <t-button theme="primary" type="submit">提交</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-dialog>
  </t-card>
</template>
    <script>
import { SearchIcon } from 'tdesign-icons-vue';
import CommonTable from './components/CommonTable.vue';
import { MONTH_LIST } from '@/constants';
import tabComponent from './components/tabs.vue';
export default {
  name: 'ListTree',
  components: {
    SearchIcon,
    CommonTable,
    tabComponent,
  },
  data() {
    return {
      data: [],
      MONTH_LIST,
      actived: [],
      title: '新增品种',
      confirmVisible: false,
      loading: false,
      treeloading: false,
      valueMode: 'all',
      FORM_RULES: {
        parentId: [{ required: true, message: '请选择品种类别', type: 'error' }],
        saleDate: [{ required: true, message: '请选择上市时间', type: 'error' }],
        varietyName: [{ required: true, message: '请输入品类名称', type: 'error' }],
      },
      form: {
        categoryId: '',
        parentId: '',
        saleDate: '',
        varietyCode: '',
        varietyId: '',
        varietyName: '',
      },
      fruiveggieVarietyList: [],
      expanded: [],
      items: [],
      treeProps: {
        label: 'varietyName',
        value: 'varietyId',
        children: 'children',
      },
    };
  },
  created() {
    this.getVarietyList();
    this.getFruiveggieVarietyList();
  },
  methods: {
    getFruiveggieVarietyList() {
      this.$request
        .get('/web/variety/getFruiveggieVarietyList')
        .then((res) => {
          this.loading = false;
          console.log(res, 'res');
          if (res.retCode === 200) {
            this.fruiveggieVarietyList =
              res.retData.map((v) => {
                return {
                  value: v.varietyId,
                  label: v.varietyName,
                };
              }) || [];
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getVarietyList() {
      this.treeloading = true;
      this.$request
        .get('/web/variety/list')
        .then((res) => {
          this.treeloading = false;
          if (res.retCode === 200) {
            this.items = res.retData || [];
            if (res.retData.length && res.retData[0].children.length) {
              this.$nextTick(() => {
                let data = res.retData[0].children[0];
                this.actived = [data.varietyId];
                this.$refs.veggietable.init(data);
                this.$refs.tabComponent.init(data);
              });
            }
          }
        })
        .catch((e) => {
          this.treeloading = false;
          console.log(e);
        });
    },
    treeClick({ node }) {
      console.log(node, 'node');
      if (node.data.parentId != 0) {
        this.actived = [node.data.varietyId];
        this.$refs.veggietable.init(node.data);
        this.$refs.tabComponent.init(node.data);
      }
    },
    addCategory() {
      this.confirmVisible = true;
    },
    onCancel() {
      this.$set(this.$data, 'form', this.$options.data().form);
      this.confirmVisible = false;
    },
    onSubmit({ validateResult }) {
      if (validateResult === true) {
        this.loading = true;
        let params = {
          condition: {
            ...this.form,
          },
        };
        this.$request
          .post('/web/variety/saveFruiveggieVariety', params)
          .then((res) => {
            this.loading = false;
            if (res.retCode === 200) {
              this.$message.success(res.retMsg || '新增品种成功');
              this.getVarietyList();
              this.onCancel();
            }
          })
          .catch((e) => {
            this.loading = false;
            console.log(e);
          });
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
  width: 200px;
  float: left;
  padding: 30px 32px;
  height: 700px;
}

.list-tree-content {
  border-left: 1px solid var(--td-component-border);
  overflow: auto;
}
</style>
    