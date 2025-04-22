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
          <t-col :xxl="10" :xl="9">
            <t-row :gutter="[16, 24]">
              <t-col>
                <t-form-item label="行政区划" name="areacodes">
                  <t-tree-select
                    clearable
                    multiple
                    :minCollapsedNum="minCollapsedNum"
                    style="width: 160px"
                    v-model="formData.areacodes"
                    :treeProps="treeProps"
                    :data="areaList"
                    placeholder="请选择"
                  />
                </t-form-item>
              </t-col>
              <t-col>
                <t-form-item label="采价点">
                  <t-input
                    v-model="formData.stallName"
                    class="form-item-content"
                    placeholder="请输入"
                    style="width: 160px"
                  />
                </t-form-item>
              </t-col>
              <t-col>
                <t-form-item label="采价点类型">
                  <t-select
                    clearable
                    v-model="formData.stallType"
                    style="width: 160px"
                    class="form-item-content`"
                    :options="stallTypeList"
                    placeholder="请选择采价点类型"
                  />
                </t-form-item>
              </t-col>
              <t-col>
                <t-form-item label="采价点归属">
                  <t-select
                    clearable
                    v-model="formData.stallVests"
                    style="width: 160px"
                    multiple
                    :minCollapsedNum="minCollapsedNum"
                    class="form-item-content`"
                    :options="stallVestsList"
                    placeholder="请选择采价点归属"
                  />
                </t-form-item>
              </t-col>
              <t-col>
                <t-form-item label="品种">
                  <t-select
                    clearable
                    v-model="formData.varietyIds"
                    style="width: 160px"
                    multiple
                    :minCollapsedNum="minCollapsedNum"
                    class="form-item-content`"
                    :options="FruiveggieVarietyList"
                    placeholder="请选择用户类型"
                  />
                </t-form-item>
              </t-col>
            </t-row>
          </t-col>
          <t-col :xxl="2" :xl="3" class="operation-container">
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
          <template #linkerName="{ row }">
            {{ row.linkers.map((v) => v.linkerName).join(',') }}
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
      :onClose="onCancel"
      :cancelBtn="null"
      :confirmBtn="null"
      width="45%"
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
        <t-form-item label="采价点名称" name="stallName">
          <t-input
            v-model="form.stallName"
            maxlength="20"
            class="form-item-content"
            placeholder="请输入"
            style="width: 100%"
          />
        </t-form-item>
        <t-form-item label="品种" name="varietyIds">
          <t-select
            clearable
            v-model="form.varietyIds"
            style="width: 100%"
            multiple
            :minCollapsedNum="minCollapsedNum"
            class="form-item-content`"
            :options="FruiveggieVarietyList"
            placeholder="请选择采集品种"
          />
        </t-form-item>
        <t-form-item label="采价点类型" name="stallType">
          <t-select
            clearable
            v-model="form.stallType"
            style="width: 100%"
            class="form-item-content`"
            :options="stallTypeList"
            placeholder="请选择采价点类型"
          />
        </t-form-item>
        <t-form-item label="采价点归属" name="stallVests">
          <t-select
            clearable
            v-model="form.stallVests"
            style="width: 100%"
            multiple
            :minCollapsedNum="minCollapsedNum"
            class="form-item-content`"
            :options="stallVestsList"
            placeholder="请选择采价点归属"
          />
        </t-form-item>
        <t-form-item label="行政区划" name="provinceCode">
          <t-cascader
            valueMode="onlyLeaf"
            valueType="full"
            v-model="PriceLocation"
            :onChange="treeSelectChange"
            :keys="cascaderProps"
            :options="areaList"
            clearable
            placeholder="请选择"
          >
            <template #valueDisplay="{ value, selectedOptions }">
              <div v-if="value">
                {{ selectedOptions.map((v) => v.areaname).join('/') }}
              </div>
            </template>
          </t-cascader>
        </t-form-item>
        <div class="flex" v-for="(item, index) in form.linkers" :key="index + 'i'">
          <div class="flex" style="width: 100%">
            <t-form-item
              :rules="[{ required: true, message: '请输入联系人', type: 'error' }]"
              :name="`linkers[${index}].linkerName`"
              label="联系人"
            >
              <!-- :name="`form.linkers[${index}].linkerName`" -->

              <t-input v-model="item.linkerName" maxlength="20" style="min-width: 100px"></t-input>
            </t-form-item>
            <t-form-item
              label="联系人手机号"
              :label-width="100"
              :name="`linkers[${index}].linkerMobile`"
              :rules="[
                { required: true, message: '请输入手机号', type: 'error' },
                { pattern: /^1[345789]\d{9}$/, message: '请输入正确的手机号', type: 'warning' },
              ]"
            >
              <!-- :name="`form.linkers[${index}].linkerMobile`" -->

              <t-input v-model="item.linkerMobile" maxlength="11" style="min-width: 100px"></t-input>
            </t-form-item>
          </div>

          <t-form-item :key="index + 'add'" style="width: 100px; display: flex; justify-content: flex-end">
            <t-button v-if="index === form.linkers.length - 1" @click="addItem" slot="statusIcon" variant="dashed">
              <icon name="add" />
            </t-button>
            <t-button
              v-if="form.linkers.length > 1"
              @click="removeItem(item, index)"
              slot="statusIcon"
              variant="dashed"
            >
              <icon name="remove" />
            </t-button>
          </t-form-item>
        </div>

        <t-form-item label="详细地址" name="latitude">
          <div style="width: 100%">
            <t-select-input
              v-model="stallAddress"
              :popup-visible="popupVisible"
              :popup-props="{ overlayInnerStyle: { padding: '6px' } }"
              placeholder="请输入任意关键词"
              allow-input
              clearable
              :keys="{
                label:'name',
                value:'location'
              }"
               style="min-width: 100px"
              @input-change="onInputChange"
              @popup-visible-change="onPopupVisibleChange"
            >
              <template #panel>
                <ul class="tdesign-demo__select-input-ul-autocomplete">
                  <li v-for="item in searchLocationoptions" :key="item.id" @click="() => onOptionClick(item)">
                    {{ item.name }}
                  </li>
                </ul>
              </template>
              <template #suffixIcon><search-icon /></template>
            </t-select-input>
            <!-- <t-input v-model="form.stallAddress" style="min-width: 100px"></t-input> -->
            <mapSelect v-if="confirmVisible" @setLocationOprions="setLocationOprions" ref="mapSelect" @updateValue="updateValue"></mapSelect>
          </div>
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
import { Icon } from 'tdesign-icons-vue';
import { SearchIcon } from 'tdesign-icons-vue';
import Trend from '@/components/trend/index.vue';
import { prefix } from '@/config/global';
import { STALL_STATE } from '@/constants';
import mapSelect from './components/map.vue';
export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
    Trend,
    mapSelect,
    Icon,
  },
  data() {
    return {
      STALL_STATE,
      prefix,
      dataLoading: false,
      loading: false,
      data: [],
      popupVisible:false,
      searchLocationoptions:[],
      minCollapsedNum: 1,
      FruiveggieVarietyList: [],
      stallVestsList: [],
      PriceLocation: [],
      columns: [
        {
          title: '编号',
          align: 'left',
          width: 200,
          ellipsis: true,
          colKey: 'stallId',
          fixed: 'left',
        },
        {
          title: '采价点名称',
          width: 200,
          ellipsis: true,
          colKey: 'stallName',
        },
        {
          title: '采价品种',
          width: 100,
          ellipsis: true,
          colKey: 'varietyName',
        },
        {
          title: '采价点类型',
          width: 150,
          ellipsis: true,
          colKey: 'stallTypeCnm',
        },
        {
          title: '采价点归属',
          width: 150,
          ellipsis: true,
          colKey: 'stallVestName',
        },
        {
          title: '联系人',
          width: 100,
          ellipsis: true,
          colKey: 'linkerName',
        },
        {
          title: '联系人手机号',
          width: 200,
          ellipsis: true,
          colKey: 'linkerMobile',
        },
        {
          title: '行政区划',
          width: 200,
          ellipsis: true,
          colKey: 'areaname',
        },
        {
          title: '详细地址',
          width: 200,
          ellipsis: true,
          colKey: 'stallAddress',
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
      title: '新增采价点',
      FORM_RULES: {
        stallName: [{ required: true, message: '请输入采价点名称', type: 'error' }],
        stallType: [{ required: true, message: '请选择采价点类型', type: 'error' }],
        provinceCode: [{ required: true, message: '请选择采价点类型', type: 'error' }],
        varietyIds: [
          { required: true, message: '请选择采价品种', type: 'error' },
          {
            validator: (val) => val.length > 0,
            message: '请选择采价品种',
            type: 'warning',
          },
        ],
        stallVests: [
          { required: true, message: '请选择采价点归属', type: 'error' },
          {
            validator: (val) => val.length > 0,
            message: '请选择采价点归属',
            type: 'warning',
          },
        ],
        longitude: [{ required: true, message: '请选择采价点', type: 'error' }],
        latitude: [{ required: true, message: '请选择采价点', type: 'error' }],
        stallAddress: [{ required: true, message: '请选择详细地址', type: 'error' }],
        userMobile: [
          { required: true, message: '请输入手机号', type: 'error' },
          { pattern: /^1[345789]\d{9}$/, message: '请输入正确的手机号', type: 'warning' },
        ],
      },
      formData: {
        areacodes: [],
        stallName: '',
        stallState: '1',
        stallType: '',
        stallVests: [],
        varietyIds: [],
      },
      form: {
        provinceCode: '',
        stallName: '',
        stallState: '1',
        stallType: '',
        cityCode: '',
        townCode: '',
        stallAddress: '',
        linkers: [{ linkerName: '', linkerMobile: '' }],
        stallVests: [],
        latitude: '',
        longitude: '',
        varietyIds: [],
      },
      rowKey: 'stallId',
      tableLayout: 'auto',
      verticalAlign: 'top',
      hover: true,
      areaList: [],
      stallTypeList: [],
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
      },
      cascaderProps: {
        label: 'areaname',
        value: 'areacode',
        children: 'children',
      },
      searchValue: '',
      confirmVisible: false,
    };
  },
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
    stallAddress(){
      return this.form.stallAddress
    }
  },
  mounted() {
    this.getList();
    this.getAreaList();
    this.getstallVestsList();
    this.getstallTypeList();
    this.getFruiveggieVarietyList();
  },

  methods: {
    onOptionClick(val){
      console.log(val,'val')
      this.$refs.mapSelect.currentSelect(val)
      this.popupVisible = false;
    },
    onInputChange(keyword) {
      this.$refs.mapSelect.remoteMethod(keyword)
    },
    setLocationOprions(options){
      this.searchLocationoptions = options
    },
    onPopupVisibleChange(val) {
      this.popupVisible = val;
    },
    getFruiveggieVarietyList() {
      this.$request.post('/web/variety/selectButtomVarieties').then((res) => {
        if (res.retCode == 200) {
          this.FruiveggieVarietyList =
            res.retData.map((v) => {
              return {
                value: v.varietyId,
                label: v.varietyName,
              };
            }) || [];
        }
      });
    },
    updateValue(location) {
      this.form.stallAddress = location.address;
      this.form.latitude = location.latitude;
      this.form.longitude = location.longitude;
    },
    onChange(row) {
      this.$request
        .post('/web/stall/enableCollectStall', {
          condition: { primaryKey: row.stallId },
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
    treeSelectChange(context, node) {
      context[0] && (this.form.provinceCode = context[0]);
      context[1] && (this.form.cityCode = context[1]);
      context[2] && (this.form.townCode = context[2]);
      this.PriceLocation = context;
      console.log(context, node);
    },
    getstallTypeList() {
      this.$request
        .post('/web/dict/queryTypeDicts', {
          condition: { dictType: 'STALL_TYPE' },
        })
        .then((res) => {
          if (res.retCode == 200) {
            this.stallTypeList =
              res.retData.map((v) => {
                return {
                  value: v.dictCode,
                  label: v.dictValue,
                };
              }) || [];
          }
        });
    },
    getstallVestsList() {
      this.$request
        .post('/web/dict/queryTypeDicts', {
          condition: { dictType: 'VEST_TYPE' },
        })
        .then((res) => {
          if (res.retCode == 200) {
            this.stallVestsList =
              res.retData.map((v) => {
                return {
                  value: v.dictCode,
                  label: v.dictValue,
                };
              }) || [];
          }
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
        .post('/web/stall/pageQueryCollectStalls', params)
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
      let data = this._.cloneDeep(row);
      this.form = {
        ...this.form,
        ...data,
      };
      this.PriceLocation = [this.form.provinceCode || '', this.form.cityCode || '', this.form.townCode || ''];
      this.title = '编辑采价点';
      this.$nextTick(() => {
        this.$refs.mapSelect.initMap(this.form.longitude, this.form.latitude);
      });
    },
    handleSetupContract() {
      this.title = '新增采价点';
      this.confirmVisible = true;
      this.$nextTick(() => {
        this.$refs.mapSelect.initMap();
      });
    },
    handleClickDelete({ row }) {
      this.loading = true;
      const confirmDialog = this.$dialog.confirm({
        header: '删除采价点',
        body: `确定删除${row.stallName}采价点吗?`,
        confirmBtn: {
          content: '确 定',
          theme: 'primary',
          loading: false,
        },
        theme: 'warning',
        onConfirm: () => {
          let params = {
            condition: {
              primaryKeys: [row.stallId],
            },
          };
          this.$request
            .post('/web/stall/softRemoveCollectStall', params)
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
    onConfirmDelete({ validateResult }) {
      console.log(this.form);
      console.log(validateResult, 'validateResult');
      if (validateResult === true) {
        this.loading = true;
        let params = {
          condition: {
            ...this.form,
          },
        };
        let RequestURL = this.form.stallId ? '/web/stall/editCollectStall' : '/web/stall/saveCollectStall';
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
      this.PriceLocation = [];
      this.confirmVisible = false;
    },
    addItem() {
      this.form.linkers.push({ linkerName: '', linkerMobile: '' });
    },
    removeItem(item, index) {
      this.form.linkers.splice(index, 1);
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
.flex {
  display: flex;
  justify-content: space-between;
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
    