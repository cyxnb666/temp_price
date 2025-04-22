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
          <t-col :span="8">
            <t-row :gutter="[16, 24]">
              <t-col :flex="1">
                <t-form-item label="姓名" name="userName">
                  <t-input
                    v-model="formData.collectorName"
                    class="form-item-content"
                    type="search"
                    placeholder="请输入姓名"
                    :style="{ minWidth: '134px' }"
                  />
                </t-form-item>
              </t-col>
              <t-col :flex="1">
                <t-form-item label="手机号" name="userMobile">
                  <t-input
                    v-model="formData.userMobile"
                    class="form-item-content"
                    placeholder="请输入手机号"
                    :style="{ minWidth: '134px' }"
                  />
                </t-form-item>
              </t-col>
              <t-col :flex="1">
                <t-form-item label="用户类型" name="stallType">
                  <t-select
                    clearable
                    v-model="formData.stallType"
                    class="form-item-content`"
                    :options="SEARCH_USER_TYPE"
                    placeholder="请选择用户类型"
                  />
                </t-form-item>
              </t-col>
            </t-row>
          </t-col>
          <t-col :span="2" :push="1" :xs="4" class="operation-container">
            <t-button type="reset" variant="base" theme="default"> 重置 </t-button>
            <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }"> 查询 </t-button>
            <t-button @click="handleSetupContract" :style="{ marginLeft: '8px' }"> 新 增 </t-button>
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
          height="calc(100vh - 350px)"
          :pagination="pagination"
          :loading="dataLoading"
          :headerAffixedTop="true"
          :headerAffixProps="{ offsetTop: offsetTop }"
        >
          <template #enabled="{ row }">
            <t-switch
              size="large"
              v-model="row.enabled"
              :customValue="['1', '0']"
              @change="() => onChange(row)"
            ></t-switch>
          </template>
          <template #collectorType="{ row }">
            <div>
              {{
                row.collectorType
                  .map((v) => {
                    if (USER_TYPE.find((val) => val.value === v)) {
                      return USER_TYPE.find((val) => val.value === v).label;
                    }
                  })
                  .join(',')
              }}
            </div>
          </template>
          <template #division="{ row }">
            <div>
              {{ row.division }}
            </div>
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
      <t-form
        ref="form"
        @submit="onConfirmDelete"
        :data="form"
        :rules="FORM_RULES"
        label-align="left"
        :label-width="90"
      >
        <t-form-item label="用户名" name="collectorName">
          <t-input v-model="form.collectorName" maxlength="20" placeholder="请输入用户名" />
        </t-form-item>
        <t-form-item label="手机号" name="userMobile">
          <t-input v-model="form.userMobile" maxlength="11" placeholder="请输入手机号" />
        </t-form-item>
        <t-form-item label="用户类型" name="collectorType">
          <t-checkbox-group v-model="form.collectorType" :options="USER_TYPE" name="collectorType"></t-checkbox-group>
        </t-form-item>
        <t-form-item label="行政区划" name="areaCodes">
          <t-tree-select
            multiple
            :min-collapsed-num="minCollapsedNum"
            clearable
            v-model="form.areaCodes"
            :treeProps="treeProps"
            :data="areaList"
            :onChange="treeChange"
            placeholder="请选择"
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
import Trend from '@/components/trend/index.vue';
import { prefix } from '@/config/global';
import { USER_TYPE } from '@/constants';
import { getChartListColor } from '@/utils/color';
export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
    Trend,
  },
  data() {
    return {
      USER_TYPE,
      SEARCH_USER_TYPE: [{ label: '全部', value: '' }, ...USER_TYPE],
      prefix,
      dataLoading: false,
      loading: false,
      minCollapsedNum: 2,
      data: [],
      value: 'first',
      columns: [
        {
          title: '姓名',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'collectorName',
          fixed: 'left',
        },
        {
          title: '手机号',
          width: 200,
          ellipsis: true,
          colKey: 'userMobile',
        },
        {
          title: '行政区划',
          width: 200,
          ellipsis: true,
          colKey: 'division',
        },
        {
          title: '用户类型',
          width: 100,
          ellipsis: true,
          colKey: 'collectorType',
        },
        {
          title: '创建时间',
          width: 200,
          ellipsis: true,
          colKey: 'createTime',
        },
        {
          title: '启用状态',
          width: 100,
          ellipsis: true,
          colKey: 'enabled',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 200,
          colKey: 'op',
          title: '操作',
        },
      ],
      title: '新增采价员',
      FORM_RULES: {
        collectorName: [{ required: true, message: '请输入姓名', type: 'error' }],
        collectorType: [{ required: true, message: '请选择用户类型', type: 'error' }],
        areaCodes: [
          { required: true, message: '请选择行政区划' },
          {
            validator: (val) => val.length > 0,
            message: '请选择行政区划',
            type: 'warning',
          },
        ],
        userMobile: [
          { required: true, message: '请输入手机号', type: 'error' },
          { pattern: /^1[345789]\d{9}$/, message: '请输入正确的手机号', type: 'warning' },
        ],
      },
      formData: {
        areaCodes: [],
        stallType: '',
        collectorId: '',
        collectorName: '',
        collectorType: [],
        enabled: '',
        userMobile: '',
      },
      form: {
        areaCodes: [],
        collectorId: '',
        collectorName: '',
        collectorType: [],
        userMobile: '',
      },
      rowKey: 'collectorId',
      tableLayout: 'auto',
      verticalAlign: 'top',
      hover: true,
      areaList: [],
      rowClassName: (rowKey: string) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        pageSize: 10,
        total: 0,
        pageNo: 1,
      },
      treeProps: {
        keys: {
          label: 'areaname',
          value: 'areacode',
          children: 'children',
        },
        valueMode:'all',
        checkStrictly:false,
      },
      searchValue: '',
      confirmVisible: false,
    };
  },
  computed: {
    roleList() {
      let roleList = this.$store.getters['user/roleList']?.records
        ? this.$store.getters['user/roleList']?.records.map((v) => {
            return {
              value: v.roleId,
              label: v.roleName,
            };
          })
        : [];
      return roleList;
    },
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.getList();
    this.getAreaList();
  },

  methods: {
    getAreaList() {
      this.$request
        .get('/web/area/selectWholeAreaTrees')
        .then((res) => {
          console.log(res, 'res');
          if (res.retCode === 200) {
            this.areaList = res.retData || [];
          }
        })
        .catch((e: Error) => {
          console.log(e);
        });
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
            this.getList();
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
        .post('/web/collector/pageQueryPriceCollectors', params)
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
      this.title = '编辑采价员';
    },
    handleSetupContract() {
      this.title = '新增采价员';
      this.confirmVisible = true;
    },
    handleClickDelete({ row }) {
      this.loading = true;
      const confirmDialog = this.$dialog.confirm({
        header: '删除采价员',
        body: `确定删除${row.collectorName}采价员吗?`,
        confirmBtn: {
          content: '确 定',
          theme: 'primary',
          loading: false,
        },
        theme: 'warning',
        onConfirm: () => {
          let params = {
            condition: {
              primaryKeys: [row.collectorId],
            },
          };
          this.$request
            .post('/web/collector/softRemovePriceCollector', params)
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
    treeChange(val, obj) {
      // this.form.areaCodes = []
      // if(this.form.areaCodes.includes(val.data))\
      // val.forEach((element) => {
      //   if (!this.form.areaCodes.includes(element.value)) {
      //     this.form.areaCodes.push(element.value);
      //     if (!this.form.areaCodes.includes(element.data.parentAreacode)) {
      //       this.form.areaCodes.push(element.data.parentAreacode);
      //     }
      //   }
      // });
      console.log(this.form.areaCodes.map(v=>v.value), obj);
    },
    onConfirmDelete({ validateResult }) {
      if (validateResult === true) {
        this.loading = true;
        let params = {
          condition: {
            ...this.form,
          },
        };
        console.log(params);
        let RequestURL = this.form.collectorId
          ? '/web/collector/editPriceCollector'
          : '/web/collector/savePriceCollector';
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
    