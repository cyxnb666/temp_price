<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-button @click="handleSetupContract"> 新 增 </t-button>
        </div>
      </t-row>
      <div class="table-container">
        <t-table
          :columns="columns"
          :data="data"
          :rowKey="rowKey"
          :verticalAlign="verticalAlign"
          :hover="hover"
          :pagination="pagination"
          height="calc(100vh - 300px)"
          :loading="dataLoading"
          :headerAffixedTop="true"
          :headerAffixProps="{ offsetTop: offsetTop }"
        >
          <!-- <template #enabled="{ row }">
            <t-tag v-if="row.enabled === '1'" theme="success" variant="light">启用</t-tag>
            <t-tag v-if="row.enabled === '0'" theme="warning" variant="light">禁用</t-tag>
          </template> -->
          <template #enabled="{ row }">
            <t-switch
              size="large"
              v-model="row.enabled"
              :customValue="['1', '0']"
              @change="() => onChange(row)"
            ></t-switch>
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
      :onClose="onCancel"
      :confirmBtn="null"
      :visible.sync="confirmVisible"
      v-loading="loading"
    >
      <t-form
        ref="form"
        @submit="onConfirmDelete"
        :data="formData"
        :rules="FORM_RULES"
        label-align="left"
        :label-width="90"
      >
        <t-form-item label="角色名称" name="roleName">
          <t-input v-model="formData.roleName" maxlength='20' placeholder="请输入内容" />
        </t-form-item>
        <t-form-item label="描述" name="remark">
          <t-textarea v-model="formData.remark"  maxlength='500' placeholder="请输入内容" />
        </t-form-item>
        <!-- <t-form-item label="启用状态" name="enabled">
          <t-switch v-model="formData.enabled" size="large"></t-switch>
        </t-form-item> -->
        <t-form-item label="菜单权限" name="menus">
          <selectMenus ref="menuSelect" v-model="formData.menus"></selectMenus>
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
import selectMenus from './compoents/selectMenu.vue';

export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
    Trend,
    selectMenus,
  },
  data() {
    return {
      prefix,
      dataLoading: false,
      loading: false,
      data: [],
      value: 'first',
      columns: [
        {
          title: '角色名称',
          align: 'left',
          width: 250,
          ellipsis: true,
          colKey: 'roleName',
          fixed: 'left',
        },
        {
          title: '描述',
          width: 200,
          ellipsis: true,
          colKey: 'remark',
        },
        {
          title: '启用状态',
          width: 200,
          ellipsis: true,
          colKey: 'enabled',
        },
        {
          title: '创建时间',
          width: 200,
          ellipsis: true,
          colKey: 'createTime',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 200,
          colKey: 'op',
          title: '操作',
        },
      ],
      title: '新增角色',
      FORM_RULES: {
        roleName: [{ required: true, message: '请输入角色名称', type: 'error' }],
        // remark: [{ required: true, message: '请输入角色描述', type: 'error' }],
        menus: [
          { required: true, message: '请选择菜单权限' },
          {
            validator: (val) => val.length > 0,
            message: '请选择菜单权限',
            type: 'warning',
          },
        ],
      },
      formData: {
        roleName: '',
        remark: '',
        menus: [],
        enabled: true,
      },
      rowKey: 'roleId',
      tableLayout: 'auto',
      verticalAlign: 'top',
      hover: true,
      rowClassName: (rowKey: string) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        pageSize: 10,
        total: 0,
        pageNo: 1,
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
    this.getList();
  },

  methods: {
    getList(type) {
      type && (this.pagination.pageNo = 1);
      this.dataLoading = true;
      let params = {
        condition: {
          remark: '',
          roleId: '',
          roleName: '',
        },
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize,
      };
      this.$store.dispatch('user/getRoleList', params).then((res) => {
        this.dataLoading = false;
        const { records = [], total } = res.retData;
        this.data = records;
        this.pagination = {
          ...this.pagination,
          total,
        };
      });
      // this.$request
      //   .post('/web/role/pageQueryRoles', params)
      //   .then((res) => {

      //   })
      //   .catch((e: Error) => {
      //     console.log(e);
      //   })
      //   .finally(() => {
      //     this.dataLoading = false;
      //   });
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
      this.formData = { ...row, enabled: row.enabled == '1', menus: row.menuList.map((v) => v.menuId) };
      this.title = '编辑角色';
      this.$nextTick(() => {
        this.$refs.menuSelect.webChecked = row.menuList.map((v) => v.menuId);
      });
    },
    handleSetupContract() {
      this.confirmVisible = true;
    },
    
    onChange(row) {
      this.$request
        .post('/web/role/enable', {
          condition: { primaryKey:row.roleId },
        })
        .then((res) => {
            this.getList();
            if (res.retCode === 200) {
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
    handleClickDelete({ row }) {
      this.loading = true;
      const confirmDialog = this.$dialog.confirm({
        header: '删除角色',
        body: `确定删除${row.roleName}角色吗?`,
        confirmBtn: {
          content: '确 定',
          theme: 'primary',
          loading: false,
        },
        theme: 'warning',
        onConfirm: () => {
          let params = {
            condition: {
              primaryKeys: [row.roleId],
            },
          };
          this.$request
            .post('/web/role/softRemoveRole', params)
            .then((res) => {
              this.loading = false;
              if (res.retCode == 200) {
                this.$message.success(res.retMsg || '删除成功');
                this.getList(true);
                confirmDialog.hide();
              }
            })
            .catch(() => {
              this.loading = false;
            });
        },
      });
    },
    onConfirmDelete({ validateResult }) {
      console.log(this.formData);
      console.log(validateResult, 'validateResult');
      if (validateResult === true) {
        this.loading = true;
        let params = {
          condition: {
            menus: this.formData.menus,
            remark: this.formData.remark,
            roleId: this.formData.roleId,
            roleName: this.formData.roleName,
            enabled: this.formData.enabled ? '1' : '0',
          },
        };
        let RequestURL = this.formData.roleId ? '/web/role/editRole' : '/web/role/saveRole';
        this.$request
          .post(RequestURL, params)
          .then((res) => {
            console.log(res);
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
      this.formData = {
        roleName: '',
        remark: '',
        menus: [],
        enabled: true,
      };
      this.$refs.menuSelect.clearTree();
      this.confirmVisible = false;
    },
  },
});
</script>
  
  <style lang="less" scoped>
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
  