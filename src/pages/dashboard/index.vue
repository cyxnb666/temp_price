<template>
  <t-card class="dashbord-card-container" :bordered="false">
    <t-form ref="form" :data="formData" :label-width="80" colon @reset="onReset" @submit="onSearch">
      <t-row :gutter="20">
        <t-col :span="10">
          <t-row :gutter="[16, 24]" :style="{ marginBottom: '10px' }">
            <t-col :span="3">
              <t-form-item label="行政区划" name="areaCode">
                <t-tree-select
                  clearable
                  v-model="formData.areacodes"
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
              <t-form-item label="规格" name="specsType">
                <t-select
                  clearable
                  v-model="formData.specsType"
                  class="form-item-content"
                  :options="personnelOptions"
                  placeholder="请选择采价员"
                />
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="统计起止期" name="taskStatus">
                <t-date-range-picker
                  clearable
                  style="width: 100%"
                  v-model="Timerang"
                  :disableDate="disableDate"
                  @change="timeChange"
                  cancel-range-select-limit
                />
              </t-form-item>
            </t-col>
          </t-row>
        </t-col>
        <t-col :span="2">
          <div class="operation-container" style="display: flex; justify-content: flex-end">
            <t-button theme="primary" type="submit">查询</t-button>
            <t-button type="reset" variant="base" theme="default" :style="{ marginLeft: '8px' }">重置</t-button>
          </div>
        </t-col>
      </t-row>
    </t-form>
    <div class="priceTrade">
      <chartLine :form="formData" ref="ChartLine" />
    </div>
    <t-card title="清单明细" :bordered="false" :loading="loading">
      <template #actions>
        <t-button theme="primary" @click="downLoad">下载清单明细</t-button>
      </template>
      <t-table bordered :data="tableData" :columns="Columns" rowKey="id" />
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
  </t-card>
</template>
<script>
import chartLine from './components/chartLine.vue';
export default {
  components: {
    chartLine,
  },
  data() {
    return {
      tableData: [],
      Timerang: [],
      Columns: [
        { title: '省', colKey: 'provinceName' },
        { title: '市', colKey: 'cityName' },
        { title: '区', colKey: 'townName' },
        { title: '采价点归属',width:'110', colKey: 'stallVestName' },
        { title: '采价点类型', width:'110',colKey: 'stallTypeName' },
        { title: '采价点名称',width:'180', colKey: 'stallName' },
        { title: '采价员', colKey: 'collectorName' },
        { title: '品种', colKey: 'varietyName' },
        { title: '品种小类',width:'110', colKey: 'categoryName' },
        { title: '销售渠道', colKey: 'saleChannelCnm' },
        { title: '规格',width:'180', colKey: 'rule' },
        { title: '价格', colKey: 'unitPrice' },
        { title: '单位',width:'110', colKey: 'unit' },
        { title: '价格日期',width:'140', colKey: 'collectDate' },
      ],
      pagination: {
        pageSize: 5,
        total: 0,
        pageNo: 1,
      },
      formData: {
        areacodes: [],
        bgnDate: '',
        endDate: '',
        specsType: '',
        stallId: '',
        stallType: '',
        stallVest: '',
        varietyId: '',
      },
      loading: false,
      treeProps: {
        keys: {
          label: 'areaname',
          value: 'areacode',
          children: 'children',
        },
      },
      areaList: [],
      pointTypeOptions: [],
      pointAffiliationOptions: [],
      pointOptions: [],
      categoryOptions: [],
      personnelOptions: [],
    };
  },
  mounted() {
    this.getAreaList();
    this.getPointTypeOptions();
    this.getPointAffiliationOptions();
    this.getPointOptions();
    this.getCategoryOptions();
    this.getselectPrices(true);
  },
  methods: {

    onSearch() {
      this.$refs.ChartLine.getPriceTrend();
      this.getselectPrices(true);
    },
    onPageSizeChange(size) {
      this.pagination.pageSize = size;
      this.getselectPrices();
    },
    onCurrentChange(current) {
      this.pagination.pageNo = current;
      this.getselectPrices();
    },
    downLoad(){
        this.$request
        .post('/web/staticis/exportPrice', {condition:{...this.formData}}, {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Accept: 'application/vnd.ms-excel',
          },
        })
        .then((response) => {
          // 处理文件名
          let filename = '清单明细.xlsx';

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
    onReset() {
      this.$refs.ChartLine.getPriceTrend();
      this.getselectPrices(true);
    },
    getselectPrices(flag) {
      if (flag) this.pagination.pageNo = 1;
      this.loading = true;
      this.$request
        .post('/web/staticis/selectPrices', {
          condition: { ...this.formData },
          pageNo: this.pagination.pageNo,
          pageSize: this.pagination.pageSize,
        })
        .then((res) => {
          this.loading = false;
          console.log(res, 'res');
          if (res.retCode === 200) {
            this.tableData = res.retData.records || [];
            this.pagination.total = res.retData.total;
          }
        })
        .catch((e) => {
          this.loading = false;
          console.log(e);
        });
    },
    timeChange(val) {
      this.Timerang = val;
    },
    disableDate(date) {
      if (this.Timerang.length > 1) {
        const minDate = this.Timerang[0];
        const maxDate = this.Timerang[1];
        if (minDate && !maxDate) {
          const diff = Math.abs(minDate.valueOf() - date.valueOf());
          if (diff > 1000 * 3600 * 24 * 90) {
            return true;
          }
        }
      }
    },
    getAreaList() {
      this.$request
        .get('/web/area/selectWholeAreaTrees')
        .then((res) => {
          if (res.retCode === 200) {
            this.areaList = res.retData || [];
          }
        })
        .catch((e) => {
          console.log(e);
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
  },
};
</script>
<style lang="less" scoped>
.priceTrade {
}
</style>