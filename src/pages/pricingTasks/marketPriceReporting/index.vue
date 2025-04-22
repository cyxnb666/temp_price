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
            <t-form-item label="审核状态" name="auditStatus">
              <t-select
                clearable
                v-model="formData.auditStatus"
                class="form-item-content"
                :options="auditStatusOptions"
                placeholder="请选择审核状态"
              />
            </t-form-item>
          </t-col>
        </t-row>

        <!-- 按钮区域 -->
        <t-row :gutter="20" style="margin-top: 16px">
          <t-col :span="24">
            <div class="operation-container" style="display: flex; justify-content: flex-end">
              <t-button theme="primary" type="submit">查询</t-button>
              <t-button type="reset" variant="base" theme="default" :style="{ marginLeft: '8px' }">重置</t-button>
              <t-button theme="default" @click="handleExport" :style="{ marginLeft: '8px' }" :loading="exportLoading"
                >导出</t-button
              >
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
          <template #auditResult="{ row }">
            <t-tag v-if="row.auditResult === '0'" theme="warning" variant="light">待审核</t-tag>
            <t-tag v-if="row.auditResult === '1'" theme="success" variant="light">审核通过</t-tag>
            <t-tag v-if="row.auditResult === '2'" theme="danger" variant="light">审核不通过</t-tag>
          </template>
          <template #collectResource="{ row }">
            <p v-if="row.collectResource === '1'" theme="warning" variant="light">大额出售计划</p>
            <p v-if="row.collectResource === '2'" theme="success" variant="light">采价任务下发</p>
            <p v-if="row.collectResource === '3'" theme="danger" variant="light">自主采价上报</p>
          </template>

          <template #op="slotProps">
            <a class="t-button-link" style="color: #0052d9" @click="handleViewDetails(slotProps)">查看</a>
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { prefix } from '@/config/global';

export default Vue.extend({
  name: 'MarketPriceReporting',
  data() {
    return {
      prefix,
      dataLoading: false,
      exportLoading: false,
      loading: false,
      data: [],
      columns: [
        {
          title: '编号',
          align: 'left',
          width: 200,
          ellipsis: true,
          colKey: 'auditTaskId',
          fixed: 'left',
        },
        {
          title: '行政区划',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'divisionName',
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
          title: '采价来源',
          width: 100,
          ellipsis: true,
          colKey: 'collectResource',
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
          title: '采价点',
          width: 120,
          ellipsis: true,
          colKey: 'stallName',
        },
        {
          title: '上报时间',
          width: 120,
          ellipsis: true,
          colKey: 'reportDate',
        },
        {
          title: '上报人员',
          width: 100,
          ellipsis: true,
          colKey: 'collectorName',
        },
        {
          title: '审核结果',
          width: 110,
          ellipsis: true,
          colKey: 'auditResult',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 120,
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
        auditStatus: '',
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
      auditStatusOptions: [
        { label: '全部', value: '' },
        { label: '待审核', value: '0' },
        { label: '审核通过', value: '1' },
        { label: '审核不通过', value: '2' },
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
          auditResult: this.formData.auditStatus,
        },
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize,
      };

      this.$request
        .post('/web/collectAudit/pageQueryCollectAudits', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.data = (res.retData.records || []).map((item) => {
              return {
                id: item.auditId,
                auditTaskId:item.auditTaskId,
                divisionName: item.divisionName || '',
                varietyName: item.varietyName || '',
                categoryName: item.categoryName || '',
                collectResource: item.collectResource || '',
                stallType: item.stallType,
                stallTypeName: item.stallTypeName || '',
                stallVest: item.stallVest,
                stallVestName: item.stallVestName || '',
                stallName: item.stallName || '',
                reportDate: item.reportDate || '',
                collectorName: item.collectorName || '',
                auditResult: item.auditResult || '',
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
    handleViewDetails({ row }) {
      this.$router.push({
        name: 'marketPriceReportingDetail',
        params: {
          id: String(row.id),
        },
      });
    },
    handleExport() {
      this.exportLoading = true;

      const params = {
        condition: {
          areaCode: this.formData.areaCode,
          stallType: this.formData.stallType,
          stallVest: this.formData.stallVest,
          stallId: this.formData.stallId ? [this.formData.stallId] : [],
          varietyId: this.formData.varietyId,
          collectorId: this.formData.collectorId,
          auditResult: this.formData.auditStatus,
        },
      };

      this.$request
        .post('/web/collectAudit/exportCollectTask', params, {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Accept: 'application/vnd.ms-excel',
          },
        })
        .then((response) => {
          // 处理文件名
          let filename = '采价任务审核列表.xlsx';

          // 从headers中获取文件名
          const disposition = response.headers['content-disposition'];
          if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
            }
          }
          const blob = new Blob([response.data], {
            type: 'application/vnd.ms-excel;charset=utf8',
          });
          const link = document.createElement('a');
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          link.setAttribute('download', filename);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();

          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);

          this.$message.success('导出成功');
        })
        .catch((error) => {
          console.error('导出失败:', error);
          this.$message.error('导出失败，请稍后重试');
        })
        .finally(() => {
          this.exportLoading = false;
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
</style>