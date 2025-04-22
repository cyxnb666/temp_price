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
          <t-col :span="9">
            <t-row :gutter="[16, 24]">
              <t-col :flex="1">
                <t-form-item label="姓名" name="userName">
                  <t-input
                    v-model="formData.userName"
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
                <t-form-item label="用户类型" name="userType">
                  <t-select
                    clearable
                    v-model="formData.userType"
                    class="form-item-content`"
                    :options="SEARCH_USER_TYPE"
                    placeholder="请选择用户类型"
                  />
                </t-form-item>
              </t-col>
            </t-row>
          </t-col>
          <t-col :span="2" :push="1" :xs="3" class="operation-container">
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
          height="calc(100vh - 300px)"
          :hover="hover"
          :pagination="pagination"
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
            <a class="t-button-link" @click="resetPassword(slotProps)">重置密码</a>
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
      :onClose="onCancel"
      :cancelBtn="null"
      :confirmBtn="null"
      :visible.sync="confirmVisible"
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
        <t-form-item label="姓名" name="userName">
          <t-input v-model="form.userName" maxlength="20" placeholder="请输入姓名" />
        </t-form-item>
        <t-form-item label="用户类型" name="userType">
          <div v-for="(check, i) in USER_TYPE" :key="i + 'check'" style="margin-right: 10px">
            <t-checkbox
              :key="check.value"
              :checked="form.userType == check.value"
              :label="check.label"
              @change="(checked) => checkChange(checked, check.value)"
            ></t-checkbox>
          </div>
        </t-form-item>
        <t-form-item label="用户角色" name="roleId">
          <t-select
            clearable
            v-model="form.roleId"
            class="form-item-content`"
            :options="roleList"
            placeholder="请选择用户类型"
          />
        </t-form-item>
        <t-form-item label="行政区划" name="areaCodes">
          <t-tree-select
            multiple
            :min-collapsed-num="minCollapsedNum"
            clearable
            v-model="form.areaCodes"
            :treeProps="treeProps"
            :data="areaList"
            placeholder="请选择"
          />
        </t-form-item>
        <!-- <t-form-item label="启用状态" name="enabled">
          <t-switch v-model="form.enabled" size="large"></t-switch>
        </t-form-item> -->
        <t-form-item label="手机号" name="userMobile">
          <t-input v-model="form.userMobile" maxlength="11" placeholder="请输入手机号" />
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
import store from '@/store';
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
      columns: [
        {
          title: '姓名',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'userName',
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
          colKey: 'userType',
        },
        {
          title: '用户角色',
          width: 150,
          ellipsis: true,
          colKey: 'roleName',
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
      title: '新增用户',
      FORM_RULES: {
        userName: [{ required: true, message: '请输入姓名', type: 'error' }],
        userType: [{ required: true, message: '请选择用户类型', type: 'error' }],
        roleId: [{ required: true, message: '请选择用户类型角色', type: 'error' }],
        enabled: [{ required: true, message: '请选择', type: 'error' }],
        areaCodes: [
          { required: true, message: '请选择菜单权限' },
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
        userMobile: '',
        userName: '',
        userType: '',
      },
      form: {
        areaCodes: [],
        enabled: true,
        roleId: '',
        roleName: '',
        userCipher: '',
        userId: '',
        userMobile: '',
        userName: '',
        userType: '',
      },
      rowKey: 'userId',
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
        valueMode: 'all',
      },
      searchValue: '',
      confirmVisible: false,
      roleList: [],
    };
  },
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.getList();
    this.getAreaList();
    this.getRoleList()
  },

  methods: {
    getRoleList() {
      let params = {
        condition: {
          remark: '',
          roleId: '',
          roleName: '',
        },
        pageNo: 1,
        pageSize: 10000,
      };
      this.$request.post('/web/role/pageQueryRoles', params).then((res) => {
        this.dataLoading = false;
        const { records = [], total } = res.retData;
        console.log(res)
        this.roleList = records.filter(v=>v.enabled == '1').map((v) => {
          return {
            value: v.roleId,
            label: v.roleName,
            enabled: v.enabled,
          };
        });
      });
    },
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
        .post('/web/user/pageQuerySysUsers', params)
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
    checkChange(checked, value) {
      if (checked) {
        this.form.userType = value;
      } else {
        this.form.userType = '';
      }
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
        enabled: row.enabled == '1',
        userType: this.USER_TYPE.find((v) => v.label == row.userType)?.value,
      };
      this.title = '编辑用户';
    },
    handleSetupContract() {
      this.title = '新增用户';
      this.confirmVisible = true;
    },
    handleClickDelete({ row }) {
      this.loading = true;
      const confirmDialog = this.$dialog.confirm({
        header: '删除用户',
        body: `确定删除${row.userName}角色吗?`,
        confirmBtn: {
          content: '确 定',
          theme: 'primary',
          loading: false,
        },
        theme: 'warning',
        onConfirm: () => {
          let params = {
            condition: {
              primaryKeys: [row.userId],
            },
          };
          this.$request
            .post('/web/user/softRemoveSysUser', params)
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

    onChange(row) {
      this.$request
        .post('/web/user/enable', {
          condition: { primaryKey: row.userId },
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
    resetPassword({ row }) {
      this.loading = true;
      const confirmDialog = this.$dialog.confirm({
        header: '重置密码',
        body: `请确认是否重置${row.userName}的密码！`,
        confirmBtn: {
          content: '确 定',
          theme: 'primary',
          loading: false,
        },
        theme: 'warning',
        onConfirm: () => {
          let params = {
            condition: {
              ...row,
            },
          };
          this.$request
            .post('/web/user/resetPwd', params)
            .then((res) => {
              this.$notify.success({ title: '重置成功', content: '重置后密码为' + res.retData });

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
    onConfirmDelete({ validateResult }) {
      console.log(this.form);
      console.log(validateResult, 'validateResult');
      if (validateResult === true) {
        this.loading = true;
        let params = {
          condition: {
            ...this.form,
            enabled: this.form.enabled ? '1' : '0',
          },
        };
        let RequestURL = this.form.userId ? '/web/user/editSysUser' : '/web/user/saveSysUser';
        this.$request
          .post(RequestURL, params)
          .then((res) => {
            this.loading = false;
            if (res.retCode === 200) {
              this.confirmVisible = false;
              if (!this.form.userId) {
                this.$notify.success({ title: '新增成功', content: '用户默认密码为' + res.retData });
              } else {
                this.$message.success(res.retMsg);
              }
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
  