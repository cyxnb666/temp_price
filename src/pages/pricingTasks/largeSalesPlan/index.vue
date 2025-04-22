<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-form ref="form" :data="formData" :label-width="80" colon @reset="onReset" @submit="onSearch">
        <t-row :gutter="[16, 24]" :style="{ marginBottom: '10px' }">
          <t-col :span="3">
            <t-form-item label="行政区划" name="areaCode">
              <t-tree-select
                clearable
                v-model="formData.areaCode"
                :treeProps="treeProps"
                :data="areaList"
                placeholder="请选择行政区划"
              />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="采价点类型" name="stallType">
              <t-select
                clearable
                v-model="formData.stallType"
                class="form-item-content"
                :options="pointTypeOptions"
                placeholder="请选择采价点类型"
              />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="采价点归属" name="stallVest">
              <t-select
                clearable
                v-model="formData.stallVest"
                class="form-item-content"
                :options="pointAffiliationOptions"
                placeholder="请选择采价点归属"
              />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="采价点" name="stallId">
              <t-select
                clearable
                v-model="formData.stallId"
                class="form-item-content"
                :options="pointOptions"
                placeholder="请选择采价点"
              />
            </t-form-item>
          </t-col>
        </t-row>

        <t-row :gutter="[16, 24]">
          <t-col :span="3">
            <t-form-item label="品种" name="varietyId">
              <t-select
                clearable
                v-model="formData.varietyId"
                class="form-item-content"
                :options="categoryOptions"
                placeholder="请选择品种"
              />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="采价员" name="collectorId">
              <t-select
                clearable
                v-model="formData.collectorId"
                class="form-item-content"
                :options="personnelOptions"
                placeholder="请选择采价员"
              />
            </t-form-item>
          </t-col>
          <t-col :span="3">
            <t-form-item label="任务状态" name="planStatus">
              <t-select
                clearable
                v-model="formData.planStatus"
                class="form-item-content"
                :options="taskStatusOptions"
                placeholder="请选择任务状态"
              />
            </t-form-item>
          </t-col>
        </t-row>

        <t-row :gutter="20" style="margin-top: 16px">
          <t-col :span="24">
            <div class="operation-container" style="display: flex; justify-content: flex-end">
              <t-button theme="primary" type="submit">查询</t-button>
              <t-button type="reset" variant="base" theme="default" :style="{ marginLeft: '8px' }">重置</t-button>
            </div>
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
          height="calc(100vh - 420px)"
        >
          <template #status="{ row }">
            <t-tag v-if="row.status === '0'" theme="primary" variant="light">计划暂存</t-tag>
            <t-tag v-if="row.status === '1'" theme="primary" variant="light">待认领</t-tag>
            <t-tag v-if="row.status === '2'" theme="primary" variant="light">待采价</t-tag>
            <t-tag v-if="row.status === '3'" theme="primary" variant="light">采价中</t-tag>
            <t-tag v-if="row.status === '4'" theme="success" variant="light">待审核</t-tag>
            <t-tag v-if="row.status === '5'" theme="success" variant="light">已完成</t-tag>
          </template>

          <template #op="slotProps">
            <t-button
              theme="primary"
              variant="text"
              class="t-button-link"
              style="color: #0052d9; padding: 0px 0px 10px 0px"
              @click="handleViewDetails(slotProps)"
              >详情</t-button
            >
            <t-button
              theme="primary"
              variant="text"
              class="t-button-link"
              @click="handleTransfer(slotProps)"
              v-if="slotProps.row.collectorId && slotProps.row.status == '2'"
              :loading="transferLoading"
              style="color: #0052d9; padding: 0px 0px 10px 0px"
              >转派</t-button
            >
            <t-button
              theme="primary"
              variant="text"
              class="t-button-link"
              @click="handleAssign(slotProps)"
              v-else-if="slotProps.row.status == '1'"
              :loading="assignLoading"
              style="color: #0052d9; padding: 0px 0px 10px 0px"
              >指派</t-button
            >
            <t-button
              theme="primary"
              variant="text"
              class="t-button-link"
              style="color: #e34d59; padding: 0px 0px 10px 0px"
              @click="handleDelete(slotProps)"
              >删除</t-button
            >
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

    <!-- 指派/转派任务对话框 -->
    <t-dialog
      :header="dialogTitle"
      :visible.sync="dialogVisible"
      :destroyOnClose="true"
      :onClose="onDialogClose"
      width="700px"
      class="custom-dialog"
    >
      <t-form ref="dialogForm" :data="dialogForm" :rules="dialogRules" label-align="right" :label-width="100">
        <t-row :gutter="[16, 16]">
          <t-col :span="6">
            <t-form-item label="行政区划" name="areaCode">
              <t-tree-select
                clearable
                v-model="dialogForm.areaCode"
                :treeProps="treeProps"
                :data="areaList"
                placeholder="请选择行政区划"
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="采价点类型" name="stallType">
              <t-select
                clearable
                v-model="dialogForm.stallType"
                class="form-item-content"
                :options="pointTypeOptions"
                placeholder="请选择采价点类型"
              />
            </t-form-item>
          </t-col>

          <t-col :span="6">
            <t-form-item label="采价点归属" name="stallVest">
              <t-select
                clearable
                v-model="dialogForm.stallVest"
                class="form-item-content"
                :options="pointAffiliationOptions"
                placeholder="请选择采价点归属"
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="采价人员" name="collectorId">
              <t-select
                clearable
                v-model="dialogForm.collectorId"
                class="form-item-content"
                :options="dialogPersonnelOptions"
                placeholder="请选择采价人员"
              />
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
      <template #footer>
        <t-button theme="default" @click="onDialogClose">取消</t-button>
        <t-button theme="primary" @click="onDialogConfirm">确认</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { prefix } from '@/config/global';

export default Vue.extend({
  name: 'LargeSalesPlan',
  data() {
    return {
      prefix,
      assignLoading: false,
      transferLoading: false,
      dataLoading: false,
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      dialogMode: '',
      currentRow: null,
      data: [],
      columns: [
        {
          title: '编号',
          align: 'left',
          width: 200,
          ellipsis: true,
          colKey: 'id',
          fixed: 'left',
        },
        {
          title: '行政区划',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'areaName',
        },
        {
          title: '采价点名称',
          width: 150,
          ellipsis: true,
          colKey: 'stallName',
        },
        {
          title: '品种大类',
          width: 100,
          ellipsis: true,
          colKey: 'varietyName',
        },
        {
          title: '品种小类',
          width: 100,
          ellipsis: true,
          colKey: 'categoryName',
        },
        {
          title: '计划出售时间',
          width: 120,
          ellipsis: true,
          colKey: 'planSaleDate',
        },
        {
          title: '预估出售量 (kg)',
          width: 130,
          ellipsis: true,
          colKey: 'planSaleWeight',
        },
        {
          title: '采价点类型',
          width: 110,
          ellipsis: true,
          colKey: 'stallTypeName',
        },
        {
          title: '联系人',
          width: 100,
          ellipsis: true,
          colKey: 'linkerName',
        },
        {
          title: '联系人手机号',
          width: 130,
          ellipsis: true,
          colKey: 'linkerMobile',
        },
        {
          title: '采价员',
          width: 100,
          ellipsis: true,
          colKey: 'collectorName',
        },
        {
          title: '任务状态',
          width: 100,
          ellipsis: true,
          colKey: 'status',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 180,
          colKey: 'op',
          title: '操作',
        },
      ],
      formData: {
        areaCode: '',
        stallType: '',
        stallVest: '',
        stallId: '',
        varietyId: '',
        collectorId: '',
        planStatus: '',
      },
      dialogForm: {
        areaCode: '',
        stallType: '',
        stallVest: '',
        collectorId: '',
      },
      dialogPersonnelOptions: [], // 弹框中的采价员选项
      dialogRules: {
        areaCode: [{ required: true, message: '请选择行政区划', type: 'error' }],
        stallType: [{ required: true, message: '请选择采价点类型', type: 'error' }],
        stallVest: [{ required: true, message: '请选择采价点归属', type: 'error' }],
        collectorId: [{ required: true, message: '请选择采价人员', type: 'error' }],
      },
      rowKey: 'id',
      verticalAlign: 'top',
      hover: true,
      areaList: [],
      pointTypeOptions: [],
      pointAffiliationOptions: [],
      pointOptions: [],
      categoryOptions: [],
      personnelOptions: [],
      taskStatusOptions: [
        { label: '全部', value: '' },
        { label: '暂存', value: '0' },
        { label: '待认领', value: '1' },
        { label: '待采价', value: '2' },
        { label: '采价中', value: '3' },
        { label: '待审核', value: '4' },
        { label: '已完成', value: '5' },
      ],
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
      },
    };
  },
  watch: {
    // 监听行政区划变化
    'formData.areaCode': function (newVal) {
      const areacodes = newVal ? [newVal] : [];
      const stallVests = this.formData.stallVest ? [this.formData.stallVest] : [];
      this.getPersonnelOptions(areacodes, stallVests);

      // 在行政区划变化时也更新采价点数据
      const stallType = this.formData.stallType || '';
      this.getPointOptions(stallType, stallVests, areacodes);
    },
    // 监听采价点归属变化
    'formData.stallVest': function (newVal) {
      const stallVests = newVal ? [newVal] : [];
      const areacodes = this.formData.areaCode ? [this.formData.areaCode] : [];
      this.getPersonnelOptions(areacodes, stallVests);

      const stallType = this.formData.stallType || '';
      this.getPointOptions(stallType, stallVests, areacodes);
    },
    // 监听采价点类型变化
    'formData.stallType': function (newVal) {
      const stallType = newVal || '';
      const stallVests = this.formData.stallVest ? [this.formData.stallVest] : [];
      const areacodes = this.formData.areaCode ? [this.formData.areaCode] : [];
      this.getPointOptions(stallType, stallVests, areacodes);
    },
    'dialogForm.areaCode': function (newVal) {
      const areacodes = newVal ? [newVal] : [];
      const stallVests = this.dialogForm.stallVest ? [this.dialogForm.stallVest] : [];
      this.getDialogPersonnelOptions(areacodes, stallVests);
    },
    'dialogForm.stallVest': function (newVal) {
      const stallVests = newVal ? [newVal] : [];
      const areacodes = this.dialogForm.areaCode ? [this.dialogForm.areaCode] : [];
      this.getDialogPersonnelOptions(areacodes, stallVests);
    },
  },
  mounted() {
    this.getList();
    this.getAreaList();
    this.getPointTypeOptions();
    this.getPointAffiliationOptions();
    this.getPersonnelOptions();
    this.getPointOptions();
    this.getCategoryOptions();
  },
  methods: {
    // 获取对话框中的采价员选项
    getDialogPersonnelOptions(areacodes = [], stallVests = []) {
      const params = {
        condition: {
          areacodes,
          stallVests,
        },
      };

      this.$request
        .post('/web/collector/selectChooseCollectors', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.dialogPersonnelOptions = (res.retData || []).map((item) => ({
              label: item.collectorName,
              value: item.collectorId,
            }));

            if (
              this.dialogForm.collectorId &&
              !this.dialogPersonnelOptions.some((option) => option.value === this.dialogForm.collectorId)
            ) {
              this.dialogForm.collectorId = '';
            }
          } else {
            this.$message.error(res.retMsg || '获取采价员数据失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取采价员数据失败');
        });
    },
    // 获取品种数据
    getCategoryOptions() {
      this.$request
        .post('/web/variety/selectButtomVarieties')
        .then((res) => {
          if (res.retCode === 200) {
            this.categoryOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.varietyName,
                value: item.varietyId,
              }));

              this.categoryOptions = [...this.categoryOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取品种失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取品种失败');
        });
    },
    // 获取采价点选项方法
    getPointOptions(stallType = '', stallVests = [], areacodes = []) {
      const params = {
        condition: {
          stallType,
          stallVests,
          areacodes,
        },
      };

      this.$request
        .post('/web/stall/selectChooseStalls', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.pointOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.stallName,
                value: item.stallId,
              }));

              this.pointOptions = [...this.pointOptions, ...options];
            }

            if (this.formData.stallId && !this.pointOptions.some((option) => option.value === this.formData.stallId)) {
              this.formData.stallId = '';
            }
          } else {
            this.$message.error(res.retMsg || '获取采价点数据失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取采价点数据失败');
        });
    },
    // 获取采价员选项
    getPersonnelOptions(areacodes = [], stallVests = []) {
      const params = {
        condition: {
          areacodes,
          stallVests,
        },
      };

      this.$request
        .post('/web/collector/selectChooseCollectors', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.personnelOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.collectorName,
                value: item.collectorId,
              }));

              this.personnelOptions = [...this.personnelOptions, ...options];
            }

            if (
              this.formData.collectorId &&
              !this.personnelOptions.some((option) => option.value === this.formData.collectorId)
            ) {
              this.formData.collectorId = '';
            }
          } else {
            this.$message.error(res.retMsg || '获取采价员数据失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取采价员数据失败');
        });
    },
    // 获取采价点类型选项
    getPointTypeOptions() {
      const params = {
        condition: {
          dictType: 'STALL_TYPE',
        },
      };

      this.$request
        .post('/web/dict/queryTypeDicts', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.pointTypeOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.dictValue,
                value: item.dictCode,
              }));

              this.pointTypeOptions = [...this.pointTypeOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取采价点类型失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取采价点类型失败');
        });
    },

    // 获取采价点归属选项
    getPointAffiliationOptions() {
      const params = {
        condition: {
          dictType: 'VEST_TYPE',
        },
      };
      // this.$request.post('/weixin/collect/selectUserVests').then((res) => {
      //   if (res.retCode == 200) {
      //     this.pointAffiliationOptions = [{ ...res.retData, value: res.retData.dictCode, label: res.retData.dictValue }];
      //     this.formData.stallVest = res.retData.dictCode
      //   }
      // });

      this.$request
        .post('/web/dict/queryTypeDicts', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.pointAffiliationOptions = [{ label: '全部', value: '' }];

            if (res.retData && res.retData.length > 0) {
              const options = res.retData.map((item) => ({
                label: item.dictValue,
                value: item.dictCode,
              }));

              this.pointAffiliationOptions = [...this.pointAffiliationOptions, ...options];
            }
          } else {
            this.$message.error(res.retMsg || '获取采价点归属失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取采价点归属失败');
        });
    },
    getAreaList() {
      this.$request
        .post('/web/area/selectUserDataAreaTree')
        .then((res) => {
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
      this.getPersonnelOptions();
      this.getPointOptions();
    },
    getList(isSearch = false) {
      if (isSearch) {
        this.pagination.pageNo = 1;
      }

      this.dataLoading = true;

      const params = {
        condition: {
          areaCode: this.formData.areaCode,
          stallType: this.formData.stallType,
          stallVest: this.formData.stallVest,
          stallId: this.formData.stallId ? [this.formData.stallId] : [],
          varietyId: this.formData.varietyId,
          collectorId: this.formData.collectorId,
          planStatus: this.formData.planStatus,
        },
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize,
      };

      this.$request
        .post('/web/large/pageQueryLargeSalePlans', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.data = (res.retData.records || []).map((item) => {
              return {
                id: item.planId,
                areaName: item.areaName || '',
                areacode: item.areaCode || '',
                stallName: item.stallName || '',
                stallId: item.stallId,
                categoryName: item.categoryName || '',
                varietyName: item.varietyName || '',
                planSaleDate: item.planSaleDate || '',
                planSaleWeight: item.planSaleWeight || '',
                stallType: item.stallType,
                stallTypeName: item.stallTypeName || '',
                stallVest: item.stallVest,
                linkerName: item.linkerName || '',
                linkerMobile: item.linkerMobile || '',
                collectorName: item.collectorName || '',
                collectorId: item.collectorId,
                status: item.status || '',
              };
            });
            this.pagination.total = res.retData.total || 0;
          } else {
            this.$message.error(res.retMsg || '获取数据失败');
          }
        })
        .catch((e) => {
          console.error(e);
          this.$message.error('获取数据失败');
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },
    onPageSizeChange(size) {
      this.pagination.pageSize = size;
      this.getList();
    },
    onCurrentChange(current) {
      this.pagination.pageNo = current;
      this.getList();
    },
    handleViewDetails({ row }) {
      this.$router.push({
        name: 'largeSalesPlanDetail',
        params: {
          id: row.id,
        },
      });
    },
    getDialogPersonnelOptionsAsync(areacodes = [], stallVests = []) {
      return new Promise((resolve, reject) => {
        const params = {
          condition: {
            areacodes,
            stallVests,
          },
        };

        this.$request
          .post('/web/collector/selectChooseCollectors', params)
          .then((res) => {
            if (res.retCode === 200) {
              this.dialogPersonnelOptions = (res.retData || []).map((item) => ({
                label: item.collectorName,
                value: item.collectorId,
              }));

              if (
                this.dialogForm.collectorId &&
                !this.dialogPersonnelOptions.some((option) => option.value === this.dialogForm.collectorId)
              ) {
                this.dialogForm.collectorId = '';
              }
              resolve();
            } else {
              this.$message.error(res.retMsg || '获取采价员数据失败');
              reject(new Error(res.retMsg || '获取采价员数据失败'));
            }
          })
          .catch((e) => {
            console.error(e);
            this.$message.error('获取采价员数据失败');
            reject(e);
          });
      });
    },
    handleAssign({ row }) {
      this.assignLoading = true;
      this.dialogMode = 'assign';
      this.dialogTitle = '指派任务';
      this.currentRow = row;

      this.dialogForm = {
        areaCode: row.areacode || '',
        stallType: row.stallType || '',
        stallVest:'',
        collectorId: '',
      };

      const areacodes = this.dialogForm.areaCode ? [this.dialogForm.areaCode] : [];
      const stallVests = this.dialogForm.stallVest ? [this.dialogForm.stallVest] : [];

      let apiPromise;
      if (this.dialogForm.areaCode || this.dialogForm.stallVest) {
        apiPromise = this.getDialogPersonnelOptionsAsync(areacodes, stallVests);
      } else {
        apiPromise = this.getDialogPersonnelOptionsAsync();
      }

      apiPromise
        .then(() => {
          this.dialogVisible = true;
        })
        .catch((error) => {
          this.$message.error('获取采价员数据失败，请重试');
          console.error(error);
        })
        .finally(() => {
          this.assignLoading = false;
        });
    },
    handleTransfer({ row }) {
      this.transferLoading = true;
      this.dialogMode = 'transfer';
      this.dialogTitle = '转派任务';
      this.currentRow = row;

      // 初始化表单
      this.dialogForm = {
        areaCode: row.areacode || '',
        stallType: row.stallType || '',
        stallVest: '',
        collectorId: row.collectorId || '',
      };

      const areacodes = this.dialogForm.areaCode ? [this.dialogForm.areaCode] : [];
      const stallVests = this.dialogForm.stallVest ? [this.dialogForm.stallVest] : [];

      let apiPromise;
      if (this.dialogForm.areaCode || this.dialogForm.stallVest) {
        apiPromise = this.getDialogPersonnelOptionsAsync(areacodes, stallVests);
      } else {
        apiPromise = this.getDialogPersonnelOptionsAsync();
      }

      apiPromise
        .then(() => {
          this.dialogVisible = true;
        })
        .catch((error) => {
          this.$message.error('获取采价员数据失败，请重试');
          console.error(error);
        })
        .finally(() => {
          this.transferLoading = false;
        });
    },
    onDialogClose() {
      this.dialogVisible = false;
    },
    onDialogConfirm() {
      this.$refs.dialogForm.validate().then((validateResult) => {
        if (validateResult === true) {
          const params = {
            planId: this.currentRow.id,
            collectorId: this.dialogForm.collectorId,
            areaCode: this.dialogForm.areaCode,
            stallType: this.dialogForm.stallType,
            stallVest: this.dialogForm.stallVest,
          };

          const actionText = this.dialogMode === 'assign' ? '指派' : '转派';
          this.$request
            .post('/web/large/assigned', params)
            .then((res) => {
              if (res.retCode === 200) {
                this.$message.success(`${actionText}成功`);
                this.dialogVisible = false;
                this.getList();
              } else {
                // this.$message.error(res.retMsg || `${actionText}失败`);
              }
            })
            .catch((e) => {
              console.error(e);
              this.$message.error(`${actionText}失败`);
            });
        }
      });
    },
    handleDelete({ row }) {
      const confirmDialog = this.$dialog.confirm({
        header: '删除任务',
        body: `确定删除${row.stallName}的大额出售计划吗?`,
        confirmBtn: {
          content: '确 定',
          theme: 'primary',
          loading: false,
        },
        theme: 'warning',
        onConfirm: () => {
          const params = {
            condition: {
              primaryKeys: [row.id],
            },
          };

          this.$request
            .post('/web/large/softRemoveLargeSalePlan', params)
            .then((res) => {
              if (res.retCode === 200) {
                this.$message.success('删除成功');
                this.getList(); // 刷新列表
              } else {
                this.$message.error(res.retMsg || '删除失败');
              }
            })
            .catch((e) => {
              console.error(e);
              this.$message.error('删除失败');
            })
            .finally(() => {
              confirmDialog.hide();
            });
        },
      });
    },
  },
});
</script>

<style lang="less" scoped>
.list-card-container {
  // padding: 20px;
}

.operation-container {
  display: flex;
  align-items: flex-end;
  margin-bottom: 16px;
}

.table-container {
  margin-bottom: 20px;
}

.task-info {
  margin: 20px 0;
  color: var(--td-text-color-secondary);

  p {
    margin: 5px 0;
    line-height: 1.5;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.t-button-link {
  margin-right: 8px;
}

.custom-dialog {
  /deep/ .t-dialog__body {
    overflow: visible !important;
  }
}
</style>