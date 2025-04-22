<template>
  <div class="list-card-container" :bordered="false">
    <t-form
      ref="form"
      :data="formData"
      :label-width="80"
      colon
      @reset="onReset"
      @submit="onSearch"
      :style="{ marginBottom: '40px' }"
    >
      <t-row :gutter="20">
        <t-col :span="2" class="operation-container">
          <t-button @click="handleSetupContract" :style="{ marginLeft: '8px' }"> 新增品类 </t-button>
        </t-col>
      </t-row>
    </t-form>
    <div class="table-container">
      <t-table
        :columns="columns"
        :data="data"
        :rowKey="rowKey"
        height="250px"
        :verticalAlign="verticalAlign"
        :hover="hover"
        :pagination="pagination"
        :loading="dataLoading"
        :headerAffixedTop="true"
        :headerAffixProps="{ offsetTop: offsetTop }"
      >
        <template #op="slotProps">
          <a class="t-button-link" @click="handleClickDetail(slotProps)">编辑</a>
          <a class="t-button-link" @click="handleClickDelete(slotProps)">删除</a>
        </template>
      </t-table>
    </div>
    <div class="pagination">
      <t-pagination
        showFirstAndLastPageBtn
        :total="pagination.total"
        :default-current="pagination.pageNo"
        :default-page-size="pagination.pageSize"
        @current-change="onCurrentChange"
        @page-size-change="onPageSizeChange"
      />
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
        <t-form-item label="品类" name="categoryName">
          <t-input v-model="form.categoryName" maxlength='20' placeholder="请输入品类名称" />
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
  </div>
</template>
    <script lang="ts">
import Vue from 'vue';
import { SearchIcon } from 'tdesign-icons-vue';
import { prefix } from '@/config/global';
import { MONTH_LIST } from '@/constants';
export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
  },
  props: {
    fruiveggieVarietyList: {
      type: Array,
      default: () => [],
    },
    actived: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      MONTH_LIST,
      prefix,
      dataLoading: false,
      loading: false,
      data: [],
      value: 'first',
      columns: [
        {
          title: '品种',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'varietyName',
          fixed: 'left',
        },
        {
          title: '品类',
          width: 200,
          ellipsis: true,
          colKey: 'categoryName',
        },
        {
          title: '上市时间',
          width: 200,
          ellipsis: true,
          colKey: 'saleDate',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 200,
          colKey: 'op',
          title: '操作',
        },
      ],
      title: '新增品类',
      FORM_RULES: {
        // parentId: [{ required: true, message: '请选择品种类别', type: 'error' }],
        saleDate: [{ required: true, message: '请选择上市时间', type: 'error' }],
        categoryName: [{ required: true, message: '请输入品类名称', type: 'error' }],
      },
      formData: {
        categoryId: '',
        categoryName: '',
        parentId: '',
        saleDate: '',
        varietyId: '',
      },
      form: {
        categoryId: '',
        categoryName: '',
        parentId: '',
        saleDate: '',
        varietyId: '',
      },
      rowKey: 'categoryId',
      tableLayout: 'auto',
      verticalAlign: 'top',
      hover: true,
      areaList: [],
      rowClassName: (rowKey: string) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        pageSize: 5,
        total: 0,
        pageNo: 1,
      },
      treeProps: {
        keys: {
          label: 'areaname',
          value: 'areacode',
          children: 'children',
        },
      },
      searchValue: '',
      confirmVisible: false,
    };
  },
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    if (!this.actived.length) {
      // this.$message.error('请选择品类')
    }
  },

  methods: {
    init(node) {
      this.formData = {
        ...this.formData,
        categoryId: '',
        categoryName: '',
        parentId: node.parentId,
        saleDate: '',
        varietyId: node.varietyId,
      };
      this.getList(true);
    },
    onSearch() {
      this.getList(true);
    },
    onChange(row) {
      this.$request
        .post('/web/collector/enabledPriceCollector', {
          condition: { ...row, enabled: row.enabled == '1' ? '0' : '1' },
        })
        .then((res) => {
          if (res.retCode === 200) {
            this.getList(true);
            this.$message.success(res.retMsg);
          }
        })
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },
    onReset() {
      this.$set(this.$data, 'formData', this.$options.data().formData);
      this.getList(true);
    },
    changeVariety(val) {
      this.$emit('selectTree', val);
    },
    getList(type) {
      type && (this.pagination.pageNo = 1);
      this.dataLoading = true;
      let params = {
        condition: {
          ...this.formData,
        },
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize,
      };
      this.$request
        .post('/web/category/pageQueryFruiveggieCategorys', params)
        .then((res) => {
          const { records = [], total } = res.retData;
          this.data = records;
          this.pagination = {
            ...this.pagination,
            total,
          };
        })
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },
    onPageSizeChange(size, pageInfo) {
      this.pagination.pageSize = size;
      this.getList();
    },
    onCurrentChange(current, pageInfo) {
      this.pagination.pageNo = current;
      this.getList();
    },
    handleClickDetail({ row }) {
      this.confirmVisible = true;
      this.form = {
        ...this.form,
        ...row,
      };
      console.log(this.form);
      this.title = '编辑品类';
    },
    handleSetupContract() {
      this.title = '新增品类';
      this.confirmVisible = true;
    },
    handleClickDelete({ row }) {
      this.loading = true;
      const confirmDialog = this.$dialog.confirm({
        header: '删除品类',
        body: `确定删除${row.categoryName}品类吗?`,
        confirmBtn: {
          content: '确 定',
          theme: 'primary',
          loading: false,
        },
        theme: 'warning',
        onConfirm: () => {
          let params = {
            condition: {
              primaryKeys: [row.categoryId],
            },
          };
          this.$request
            .post('/web/category/softRemoveFruiveggieCategory', params)
            .then((res) => {
              this.$message.success(res.retMsg || '删除成功');
              confirmDialog.hide();
              this.loading = false;
              this.getList(true);
            })
            .catch(() => {
              this.loading = false;
            });
        },
      });
    },
    onSubmit({ validateResult }) {
      console.log(this.form);
      console.log(validateResult, 'validateResult');
      if (validateResult === true) {
        this.loading = true;
        let params = {
          condition: {
            ...this.form,
            parentId: this.formData.parentId,
            varietyId: this.formData.varietyId,
          },
        };
        console.log(params);
        let RequestURL = this.form.categoryId
          ? '/web/category/editFruiveggieCategory'
          : '/web/category/saveFruiveggieCategory';
        this.$request
          .post(RequestURL, params)
          .then((res) => {
            this.loading = false;
            if (res.retCode === 200) {
              this.confirmVisible = false;
              this.$message.success(res.retMsg);
              this.onCancel();
              this.getList();
            }
          })
          .catch(() => {
            this.loading = false;
          });
      }
    },
    onCancel() {
      this.$set(this.$data, 'form', this.$options.data().form);
      this.confirmVisible = false;
    },
  },
});
</script>
    
    <style lang="less" scoped>
.list-common-table {
  background-color: var(--td-bg-color-container);
  padding: 30px 32px;
  border-radius: var(--td-radius-default);
}
@import '@/style/variables';
.list-card-container {
  box-sizing: content-box;
}

.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}

.left-operation-container {
  padding: 0 0 6px 0;
  margin-bottom: 16px;

  .selected-count {
    display: inline-block;
    margin-left: var(--td-comp-margin-s);
    color: var(--td-text-color-secondary);
  }
}

.search-input {
  width: 360px;
}

.t-button + .t-button {
  margin-left: var(--td-comp-margin-s);
}
</style>
    