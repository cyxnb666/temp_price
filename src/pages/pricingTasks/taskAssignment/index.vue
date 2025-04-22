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
            <t-form-item label="任务状态" name="taskStatus">
              <t-select
                clearable
                v-model="formData.taskStatus"
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
              <t-button theme="primary" @click="handleAdd" :style="{ marginLeft: '8px' }">新增</t-button>
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
          <template #collectType="{ row }">
            <p v-if="row.collectType === '1'">区域占比</p>
            <p v-if="row.collectType === '2'">指定采价点</p>
          </template>
          <template #taskStatus="{ row }">
            <t-tag v-if="row.taskStatus === '0'" theme="primary" variant="light">待认领</t-tag>
            <t-tag v-if="row.taskStatus === '2'" theme="warning" variant="light">待采价</t-tag>
            <t-tag v-if="row.taskStatus === '3'" theme="primary" variant="light">采价中</t-tag>
            <t-tag v-if="row.taskStatus === '4'" theme="primary" variant="light">待审核</t-tag>
            <t-tag v-if="row.taskStatus === '5'" theme="success" variant="light">已完成</t-tag>
          </template>

          <template #op="slotProps">
            <t-button
              theme="primary"
              variant="text"
              class="t-button-link"
              @click="handleTransfer(slotProps)"
              v-if="slotProps.row.collectorId && slotProps.row.taskStatus == '2'"
              :loading="transferLoading"
              style="color: #0052d9; padding: 0px 0px 10px 0px"
              >转派</t-button
            >
            <t-button
              theme="primary"
              variant="text"
              class="t-button-link"
              @click="handleAssign(slotProps)"
               v-else-if="!slotProps.row.collectorId"
              :loading="assignLoading"
              style="color: #0052d9; padding: 0"
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

    <!-- 新增/指派任务对话框 -->
    <t-dialog
      :header="dialogTitle"
      :visible.sync="dialogVisible"
      :destroyOnClose="true"
      :onClose="onDialogClose"
      width="50%"
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
                :options="dialogPointTypeOptions"
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
                :options="dialogPointAffiliationOptions"
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

          <t-col :span="6">
            <t-form-item label="采价方式" name="collectType" v-if="dialogMode === 'add'">
              <t-radio-group v-model="dialogForm.collectType">
                <t-radio value="1">区域占比</t-radio>
                <t-radio value="2">指定采价点</t-radio>
              </t-radio-group>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="品种" name="varietyId" v-if="dialogMode === 'add'">
              <t-select
                clearable
                v-model="dialogForm.varietyId"
                class="form-item-content"
                :options="dialogCategoryOptions"
                placeholder="请选择品种"
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <!-- 根据采价方式动态显示不同的输入框 -->
            <template v-if="dialogForm.collectType === '1' && dialogMode === 'add'">
              <t-form-item label="占比 (%)" name="collectRate">
                <t-input-number
                  v-model="dialogForm.collectRate"
                  placeholder="请输入占比"
                  :min="1"
                  :max="100"
                  style="width: 100%"
                />
              </t-form-item>
            </template>
            <template v-else-if="dialogForm.collectType === '2' && dialogMode === 'add'">
              <t-form-item label="采价点" name="stallId">
                <t-select
                  v-model="dialogForm.stallId"
                  multiple
                  :options="dialogPointOptions"
                  placeholder="请选择采价点"
                />
              </t-form-item>
            </template>
          </t-col>

          
          <t-col :span="6">
            <t-form-item label="采价时间" name="pricingTime" v-if="dialogMode === 'add'">
              <t-date-range-picker
                v-model="dialogForm.pricingTime"
                :placeholder="['开始日期', '结束日期']"
                clearable
                format="YYYY-MM-DD"
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
  name: 'TaskAssignment',
  data() {
    return {
      prefix,
      assignLoading: false,
      transferLoading: false,
      dataLoading: false,
      loading: false,
      dialogVisible: false,
      dialogTitle: '新增任务',
      dialogMode: 'add',
      currentRow: null,
      data: [],
      columns: [
        {
          title: '编号',
          align: 'left',
          width: 200,
          ellipsis: true,
          colKey: 'taskId',
          fixed: 'left',
        },
        {
          title: '行政区划',
          align: 'left',
          width: 180,
          ellipsis: true,
          colKey: 'areaname',
        },
        {
          title: '品种',
          width: 100,
          ellipsis: true,
          colKey: 'varietyName',
        },
        {
          title: '采价点类型',
          width: 110,
          ellipsis: true,
          colKey: 'stallTypeName',
        },
        {
          title: '采价点归属',
          width: 110,
          ellipsis: true,
          colKey: 'stallVestName',
        },
        {
          title: '采价方式',
          width: 110,
          ellipsis: true,
          colKey: 'collectType',
        },
        {
          title: '采价点',
          width: 120,
          ellipsis: true,
          colKey: 'pricingPoint',
        },
        {
          title: '采价时间',
          width: 150,
          ellipsis: true,
          colKey: 'pricingTime',
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
          colKey: 'taskStatus',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 150,
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
        taskStatus: '',
      },
      dialogForm: {
        areaCode: '',
        stallType: '',
        stallVest: '',
        varietyId: '',
        collectType: '1', // 1：区域占比 2：指定采价点
        collectRate: 30,
        stallId: '',
        collectorId: '',
        pricingTime: [],
      },
      dialogPointOptions: [], // 弹框中的采价点选项
      dialogPersonnelOptions: [], // 弹框中的采价员选项
      dialogPointTypeOptions: [],
      dialogPointAffiliationOptions: [],
      dialogCategoryOptions: [],
      dialogRules: {
        areaCode: [{ required: true, message: '请选择行政区划', type: 'error' }],
        stallType: [{ required: true, message: '请选择采价点类型', type: 'error' }],
        stallVest: [{ required: true, message: '请选择采价点归属', type: 'error' }],
        varietyId: [{ required: true, message: '请选择品种', type: 'error' }],
        collectType: [{ required: true, message: '请选择采价方式', type: 'error' }],
        collectRate: [{ required: true, message: '请输入占比', type: 'error' }],
        stallId: [{ required: true, message: '请选择采价点', type: 'error' }],
        collectorId: [{ required: true, message: '请选择采价人员', type: 'error' }],
        pricingTime: [{ required: true, message: '请选择采价时间', type: 'error' }],
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
        // { label: '全部', value: '' },
        // { label: '待认领', value: '0' },
        // { label: '待采价', value: '1' },
        // { label: '采价中', value: '2' },
        // { label: '待审核', value: '3' },
        // { label: '已完成', value: '4' },
        { label: '全部', value: '' },
        // { label: '计划暂存', value: '0' },
        // { label: '待认领', value: '1' },
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
    'dialogForm.varietyId': function (newVal) {
      const areacodes = this.dialogForm.areaCode ? [this.dialogForm.areaCode] : [];
      const stallVests = this.dialogForm.stallVest ? [this.dialogForm.stallVest] : [];
      const varietyIds = newVal ? [newVal] : [];

      const stallType = this.dialogForm.stallType || '';
      this.getDialogPointOptions(stallType, stallVests, areacodes,varietyIds);
    },
    'dialogForm.areaCode': function (newVal) {
      const areacodes = newVal ? [newVal] : [];
      const stallVests = this.dialogForm.stallVest ? [this.dialogForm.stallVest] : [];
      this.getDialogPersonnelOptions(areacodes, stallVests);

      const varietyIds = this.dialogForm.varietyId ? [this.dialogForm.varietyId] : []
      const stallType = this.dialogForm.stallType || '';
      this.getDialogPointOptions(stallType, stallVests, areacodes,varietyIds);
    },
    'dialogForm.stallVest': function (newVal) {
      const stallVests = newVal ? [newVal] : [];
      const areacodes = this.dialogForm.areaCode ? [this.dialogForm.areaCode] : [];
      this.getDialogPersonnelOptions(areacodes, stallVests);

      const stallType = this.dialogForm.stallType || '';
      const varietyIds = this.dialogForm.varietyId ? [this.dialogForm.varietyId] : []
      this.getDialogPointOptions(stallType, stallVests, areacodes,varietyIds);
    },
    'dialogForm.stallType': function (newVal) {
      const stallType = newVal || '';
      const stallVests = this.dialogForm.stallVest ? [this.dialogForm.stallVest] : [];
      const areacodes = this.dialogForm.areaCode ? [this.dialogForm.areaCode] : [];
      const varietyIds = this.dialogForm.varietyId ? [this.dialogForm.varietyId] : []
      this.getDialogPointOptions(stallType, stallVests, areacodes,varietyIds);
    },
    'dialogForm.collectType': function (newVal) {
      // 重置相关字段
      if (newVal === '1') {
        this.dialogForm.stallId = '';
      } else if (newVal === '2') {
        this.dialogForm.collectRate = 30;
      }
    },
  },
  computed: {},
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
    getDialogPointOptions(stallType = '', stallVests = [], areacodes = [],varietyIds = []) {
      const params = {
        condition: {
          stallType,
          stallVests,
          areacodes,
          varietyIds
        },
      };

      this.$request
        .post('/web/stall/selectChooseStalls', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.dialogPointOptions = (res.retData || []).map((item) => ({
              label: item.stallName,
              value: item.stallId,
            }));

            if (
              this.dialogForm.stallId &&
              !this.dialogPointOptions.some((option) => option.value === this.dialogForm.stallId)
            ) {
              this.dialogForm.stallId = '';
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
    // 获取对话框专用的采价点类型选项方法
    getDialogPointTypeOptions() {
      const params = {
        condition: {
          dictType: 'STALL_TYPE',
        },
      };

      this.$request
        .post('/web/dict/queryTypeDicts', params)
        .then((res) => {
          if (res.retCode === 200) {
            // 不添加"全部"选项
            if (res.retData && res.retData.length > 0) {
              this.dialogPointTypeOptions = res.retData.map((item) => ({
                label: item.dictValue,
                value: item.dictCode,
              }));
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

    // 获取对话框专用的采价点归属选项方法
    getDialogPointAffiliationOptions() {
      const params = {
        condition: {
          dictType: 'VEST_TYPE',
        },
      };
      this.$request.post('/weixin/collect/selectUserVests').then((res) => {
        if (res.retCode == 200) {
          this.dialogPointAffiliationOptions = [{ ...res.retData, value: res.retData.dictCode, label: res.retData.dictValue }];
          this.dialogForm.stallVest = res.retData.dictCode
        }
      });
      // this.$request
      //   .post('/web/dict/queryTypeDicts', params)
      //   .then((res) => {
      //     if (res.retCode === 200) {
      //       // 不添加"全部"选项
      //       if (res.retData && res.retData.length > 0) {
      //         this.dialogPointAffiliationOptions = res.retData.map((item) => ({
      //           label: item.dictValue,
      //           value: item.dictCode,
      //         }));
      //       }
      //     } else {
      //       this.$message.error(res.retMsg || '获取采价点归属失败');
      //     }
      //   })
      //   .catch((e) => {
      //     console.error(e);
      //     this.$message.error('获取采价点归属失败');
      //   });
    },

    // 获取对话框专用的品种选项方法
    getDialogCategoryOptions() {
      this.$request
        .post('/web/variety/selectButtomVarieties')
        .then((res) => {
          if (res.retCode === 200) {
            // 不添加"全部"选项
            if (res.retData && res.retData.length > 0) {
              this.dialogCategoryOptions = res.retData.map((item) => ({
                label: item.varietyName,
                value: item.varietyId,
              }));
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
          taskStatus: this.formData.taskStatus,
        },
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize,
      };

      this.$request
        .post('/web/collectPriceTask/pageQueryCollectPriceTasks', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.data = (res.retData.records || []).map((item) => {
              return {
                taskId: item.taskId,
                areacode: item.areacode,
                areaname: item.areaname || '',
                varietyName: item.varietyName || '',
                stallType: item.stallType,
                stallTypeName: item.stallTypeName || '',
                stallVest: item.stallVest,
                stallVestName: item.stallVestName || '',
                collectType: item.collectType || '',
                pricingPoint: item.stallName || '',
                pricingTime: `${item.collectBgnDate || ''}-${item.collectEndDate || ''}`,
                collectorName: item.collectorName || '',
                taskStatus: item.taskStatus || '',
                collectorId: item.collectorId,
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
    handleAdd() {
      this.dialogMode = 'add';
      this.dialogTitle = '新增任务';
      this.dialogVisible = true;
      this.dialogForm = {
        areaCode: '',
        stallType: '',
        stallVest: '',
        varietyId: '',
        collectType: '1', // 默认为区域占比
        collectRate: 30,
        stallId: '',
        collectorId: '',
        pricingTime: [],
      };

      // 加载对话框专用的选项数据
      this.getDialogPointTypeOptions();
      this.getDialogPointAffiliationOptions();
      this.getDialogCategoryOptions();
      this.getDialogPersonnelOptions();
      this.getDialogPointOptions();
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

    getDialogPointOptionsAsync(stallType = '', stallVests = [], areacodes = []) {
      return new Promise((resolve, reject) => {
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
              this.dialogPointOptions = (res.retData || []).map((item) => ({
                label: item.stallName,
                value: item.stallId,
              }));

              if (
                this.dialogForm.stallId &&
                !this.dialogPointOptions.some((option) => option.value === this.dialogForm.stallId)
              ) {
                this.dialogForm.stallId = '';
              }
              resolve();
            } else {
              this.$message.error(res.retMsg || '获取采价点数据失败');
              reject(new Error(res.retMsg || '获取采价点数据失败'));
            }
          })
          .catch((e) => {
            console.error(e);
            this.$message.error('获取采价点数据失败');
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
        stallVest: row.stallVest || '',
        varietyId: row.varietyId || '',
        collectType: row.collectType || '1',
        collectRate: row.collectType === '1' ? row.collectRate : 30,
        stallId: row.collectType === '2' ? row.stallId : '',
        collectorId: '',
        pricingTime: [row.collectBgnDate || '', row.collectEndDate || ''],
      };

      this.getDialogPointTypeOptions();
      this.getDialogPointAffiliationOptions();
      this.getDialogCategoryOptions();

      const areacodes = this.dialogForm.areaCode ? [this.dialogForm.areaCode] : [];
      const stallVests = this.dialogForm.stallVest ? [this.dialogForm.stallVest] : [];
      const stallType = this.dialogForm.stallType || '';

      let personnelPromise, pointPromise;

      if (this.dialogForm.areaCode || this.dialogForm.stallVest) {
        personnelPromise = this.getDialogPersonnelOptionsAsync(areacodes, stallVests);
      } else {
        personnelPromise = this.getDialogPersonnelOptionsAsync();
      }

      if (this.dialogForm.areaCode || this.dialogForm.stallVest || this.dialogForm.stallType) {
        pointPromise = this.getDialogPointOptionsAsync(stallType, stallVests, areacodes);
      } else {
        pointPromise = this.getDialogPointOptionsAsync();
      }

      Promise.all([personnelPromise, pointPromise])
        .then(() => {
          this.dialogVisible = true;
        })
        .catch((error) => {
          this.$message.error('获取数据失败，请重试');
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
      // 加载对话框专用的选项数据
      this.getDialogPointTypeOptions();
      this.getDialogPointAffiliationOptions();

      // 初始化表单
      this.dialogForm = {
        areaCode: row.areacode || '',
        stallType: row.stallType || '',
        stallVest: row.stallVest || '',
        varietyId: row.varietyId || '',
        collectType: row.collectType || '1',
        collectRate: row.collectType === '1' ? row.collectRate : 30,
        stallId: row.collectType === '2' ? row.stallId : '',
        collectorId: row.collectorId || '',
        pricingTime: [row.collectBgnDate || '', row.collectEndDate || ''],
      };

      const areacodes = this.dialogForm.areaCode ? [this.dialogForm.areaCode] : [];
      const stallVests = this.dialogForm.stallVest ? [this.dialogForm.stallVest] : [];
      const stallType = this.dialogForm.stallType || '';

      let personnelPromise, pointPromise;

      if (this.dialogForm.areaCode || this.dialogForm.stallVest) {
        personnelPromise = this.getDialogPersonnelOptionsAsync(areacodes, stallVests);
      } else {
        personnelPromise = this.getDialogPersonnelOptionsAsync();
      }

      if (this.dialogForm.areaCode || this.dialogForm.stallVest || this.dialogForm.stallType) {
        pointPromise = this.getDialogPointOptionsAsync(stallType, stallVests, areacodes);
      } else {
        pointPromise = this.getDialogPointOptionsAsync();
      }

      Promise.all([personnelPromise, pointPromise])
        .then(() => {
          this.dialogVisible = true;
        })
        .catch((error) => {
          this.$message.error('获取数据失败，请重试');
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
      // 根据不同的对话框模式，验证不同的字段
      let validateFields = ['areaCode', 'stallType', 'stallVest', 'collectorId'];

      // 只有在添加模式下才验证这些字段
      if (this.dialogMode === 'add') {
        validateFields.push('varietyId', 'collectType', 'pricingTime');

        // 添加动态验证字段
        if (this.dialogForm.collectType === '1') {
          validateFields.push('collectRate');
        } else if (this.dialogForm.collectType === '2') {
          validateFields.push('stallId');
        }
      }

      this.$refs.dialogForm.validate(validateFields).then((validateResult) => {
        if (validateResult === true) {
          let params = {};

          if (this.dialogMode === 'add') {
            params = {
              condition: {
                areaCode: this.dialogForm.areaCode,
                stallType: this.dialogForm.stallType,
                stallVest: this.dialogForm.stallVest,
                varietyId: Number(this.dialogForm.varietyId),
                collectType: this.dialogForm.collectType,
                collectorId: this.dialogForm.collectorId,
                collectBgnDate: this.dialogForm.pricingTime[0] || '',
                collectEndDate: this.dialogForm.pricingTime[1] || '',
              },
            };

            // 根据采价方式添加不同参数
            if (this.dialogForm.collectType === '1') {
              params.condition.collectRate = Number(this.dialogForm.collectRate);
              params.condition.stallId = [];
            } else if (this.dialogForm.collectType === '2') {
              params.condition.stallId = this.dialogForm.stallId ? this.dialogForm.stallId : [];
            }
          } else if (this.dialogMode === 'assign' || this.dialogMode === 'transfer') {
            // 指派/转派模式下只需要这些参数
            params = {
              condition: {
                taskId: this.currentRow.taskId,
                collectorId: this.dialogForm.collectorId,
                areaCode: this.dialogForm.areaCode,
                stallType: this.dialogForm.stallType,
                stallVest: this.dialogForm.stallVest,
              },
            };
          }

          if (this.dialogMode === 'add') {
            this.$request
              .post('/web/collectPriceTask/saveCollectPriceTask', params)
              .then((res) => {
                if (res.retCode === 200) {
                  this.$message.success('添加成功');
                  this.dialogVisible = false;
                  this.getList();
                } else {
                  this.$message.error(res.retMsg || '添加失败');
                }
              })
              .catch((e) => {
                console.error(e);
                this.$message.error('添加失败');
              });
          } else if (this.dialogMode === 'assign' || this.dialogMode === 'transfer') {
            const actionText = this.dialogMode === 'assign' ? '指派' : '转派';
            this.$request
              .post('/web/collectPriceTask/assigned', params)
              .then((res) => {
                if (res.retCode === 200) {
                  this.$message.success(`${actionText}成功`);
                  this.dialogVisible = false;
                  this.getList();
                } else {
                  this.$message.error(res.retMsg || `${actionText}失败`);
                }
              })
              .catch((e) => {
                console.error(e);
                this.$message.error(`${actionText}失败`);
              });
          }
        }
      });
    },
    handleDelete({ row }) {
      const confirmDialog = this.$dialog.confirm({
        header: '删除任务',
        body: `确定删除该采价任务?`,
        confirmBtn: {
          content: '确 定',
          theme: 'primary',
          loading: false,
        },
        theme: 'warning',
        onConfirm: () => {
          const params = {
            condition: {
              primaryKeys: [row.taskId],
            },
          };

          this.$request
            .post('/web/collectPriceTask/softRemoveCollectPriceTask', params)
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

.pagination {
  display: flex;
  justify-content: flex-end;
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