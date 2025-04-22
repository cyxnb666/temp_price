<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
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
            <t-button @click="handleSetupContract" :style="{ marginLeft: '8px' }"> 新增规格 </t-button>
          </t-col>
        </t-row>
      </t-form>
      <div class="table-container">
        <t-table
          :columns="columns"
          :data="data"
          :rowKey="rowKey"
          :verticalAlign="verticalAlign"
          :hover="hover"
          :pagination="pagination"
          :loading="dataLoading"
          :headerAffixedTop="true"
          :headerAffixProps="{ offsetTop: offsetTop }"
        >
          <template #fvSpecs="{ row }">
            {{ formater(row) }}
          </template>
          <template #varietyUnit="{ row }">
            <t-tag theme="success" variant="light"
              >{{ UNIT_LIST.find((v) => v.value == row.varietyUnit).label }}
            </t-tag>
          </template>
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
    </t-card>
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
        <t-form-item label="规格" name="fvSpecsMax">
          <t-row :gutter="1">
            <t-space :size="14">
              <t-col :span="5.5">
                <t-input-number
                  v-model="form.fvSpecsMin"
                  theme="normal"
                  :max='999999'
                  :allowInputOverLimit='false'
                  :decimal-places="2"
                  :min="0"
                  :suffix="specsType[tab.value]"
                ></t-input-number>
              </t-col>
              <t-col :span="1"> - </t-col>
              <t-col :span="5.5">
                <t-input-number
                  v-model="form.fvSpecsMax"
                  theme="normal"
                  :decimal-places="2"      
                  :max='999999'
                  :allowInputOverLimit='false'
                  :min="form.fvSpecsMin"
                  :suffix="specsType[tab.value]"
                ></t-input-number>
              </t-col>
            </t-space>
          </t-row>
        </t-form-item>
        <t-form-item label="单位" name="varietyUnit">
          <t-select
            clearable
            v-model="form.varietyUnit"
            class="form-item-content`"
            :options="UNIT_LIST"
            placeholder="请选择单位"
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
export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
  },
  props: {
    tab: {
      type: Object,
      default: () => {},
    },
    veggeCategory: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      UNIT_LIST: [],
      prefix,
      dataLoading: false,
      loading: false,
      data: [],
      value: 'first',
      columns: [
        {
          title: '规格',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'fvSpecs',
          fixed: 'left',
        },
        {
          title: '单位',
          width: 200,
          ellipsis: true,
          colKey: 'varietyUnit',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 200,
          colKey: 'op',
          title: '操作',
        },
      ],
      specsType: {
        DIAMETER: 'mm',
        WEIGHT: 'g',
      },
      title: '新增规格',
      FORM_RULES: {
        fvSpecsMax: [
          {
            validator: this.validateSpecs,
          },
        ],
        fvSpecsMin: [{ required: true, message: '请输入规格', type: 'error' }],
        varietyUnit: [{ required: true, message: '请选择单位', type: 'error' }],
      },
      formData: {
        categoryId: '',
        categoryName: '',
        parentId: '',
        saleDate: '',
        varietyId: '',
      },
      form: {
        fvSpecsMax: '',
        fvSpecsMin: '',
        specsId: '',
        specsType: '',
        varietyId: '',
        varietyUnit: '',
      },
      rowKey: 'specsId',
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
    this.getUnitList();
  },

  methods: {
    validateSpecs(val) {
      if (val == '' && this.form.fvSpecsMin == '') {
      return { result: false, message: '请输入规格', type: 'error' };
      } else {
      return { result: true };
      }
    },
    formater(row) {
      let unit = this.tab.value == 'DIAMETER' ? 'mm' : 'g';
      if (row.fvSpecsMin && row.fvSpecsMax) {
        return `${row.fvSpecsMin}${unit}-${row.fvSpecsMax}${unit}`;
      } else if (row.fvSpecsMin) {
        return `${row.fvSpecsMin}${unit}以上`;
      } else if (row.fvSpecsMax) {
        return `${row.fvSpecsMax}${unit}以下`;
      }
    },
    init(node) {
      this.formData = {
        ...this.formData,
        categoryId: '',
        categoryName: '',
        parentId: node.parentId,
        saleDate: '',
        specsType: this.tab.value,
        varietyId: node.varietyId,
      };
      this.onSearch();
    },
    onSearch() {
      this.getList(true);
    },
    getUnitList() {
      this.$request
        .post('/web/dict/queryTypeDicts', {
          condition: { dictType: 'UNIT' },
        })
        .then((res) => {
          if (res.retCode == 200) {
            this.UNIT_LIST =
              res.retData.map((v) => {
                return {
                  value: v.dictCode,
                  label: v.dictValue,
                };
              }) || [];
          }
        });
    },
    onReset() {
      this.$set(this.$data, 'formData', this.$options.data().formData);
      this.onSearch();
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
        .post('/web/specs/pageQueryFruiveggieSpecss', params)
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
        specsType: this.tab.value,
      };
      console.log(this.form);
      this.title = '编辑规格';
    },
    handleSetupContract() {
      this.title = '新增规格';
      this.confirmVisible = true;
      this.form.specsType = this.tab.value;
      this.form.varietyId = this.veggeCategory.varietyId;
    },
    handleClickDelete({ row }) {
      this.loading = true;
      const confirmDialog = this.$dialog.confirm({
        header: '删除规格',
        body: `确定删除${this.formater(row)}规格吗?`,
        confirmBtn: {
          content: '确 定',
          theme: 'primary',
          loading: false,
        },
        theme: 'warning',
        onConfirm: () => {
          let params = {
            condition: {
              primaryKeys: [row.specsId],
            },
          };
          this.$request
            .post('/web/specs/softRemoveFruiveggieSpecs', params)
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
          },
        };
        console.log(params);
        let RequestURL = this.form.specsId ? '/web/specs/editFruiveggieSpecs' : '/web/specs/saveFruiveggieSpecs';
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
      