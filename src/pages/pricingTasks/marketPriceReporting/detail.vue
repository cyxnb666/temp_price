<template>
  <t-loading :loading="loading" text="加载中...">
    <t-card :bordered="false" class="list-card-container">
      <div class="detail-container">
        <div class="section">
          <div class="section-title">
            <span class="section-title-marker"></span>
            <span>基础信息</span>
          </div>

          <div>
            <t-row :gutter="[16, 16]">
              <t-col :span="4">
                <div class="field-item">
                  <label>采价员</label>
                  <t-input v-model="basicInfo.pricingPersonnel" disabled placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>上报时间</label>
                  <t-input v-model="basicInfo.reportDate" disabled placeholder="" />
                </div>
              </t-col>
              <t-col :span="4" v-show="collectResource == '3'">
                <div class="field-item">
                  <label>上报地点</label>
                  <t-input v-model="basicInfo.reportLocation" disabled placeholder="" />
                </div>
              </t-col>

              <t-col :span="4">
                <div class="field-item">
                  <label>采价来源</label>
                  <t-input v-model="basicInfo.pricingSource" disabled placeholder="" />
                </div>
              </t-col>
              <!-- <t-col :span="4" v-show="['1', '2'].includes(collectResource)">
                <div class="field-item">
                  <label>采价方式</label>
                  <t-input v-model="basicInfo.collectTypeStr" disabled placeholder="" />
                </div>
              </t-col>
              <t-col :span="4" v-show="['1', '2'].includes(collectResource)">
                <div class="field-item">
                  <label>占比 (%)</label>
                  <t-input v-model="basicInfo.collectRate" disabled placeholder="" />
                </div>
              </t-col>

              <t-col :span="4" v-show="['1', '2'].includes(collectResource)">
                <div class="field-item">
                  <label>实际采价占比</label>
                  <t-input v-model="basicInfo.actualCollectRate" disabled placeholder="" />
                </div>
              </t-col> -->
              <t-col :span="4">
                <div class="field-item">
                  <label>审核状态</label>
                  <t-input v-model="basicInfo.auditStatus" disabled placeholder="" />
                </div>
              </t-col>
            </t-row>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <span class="section-title-marker"></span>
            <span>采价信息</span>
          </div>

          <div class="price-points-section">
            <!-- 左侧导航栏 -->
            <div class="sidebar-navigation">
              <div class="navigation-header">采价点列表</div>
              <div class="navigation-list">
                <div v-for="(point, index) in pricingPoints" :key="index"
                  :class="['navigation-item', currentPointIndex === index ? 'active' : '']"
                  @click="currentPointCLick(point, index)">
                  {{ point.name }}
                </div>
              </div>
            </div>

            <!-- 右侧内容区域 -->
            <div class="point-content">
              <div class="price-point-header">{{ currentPoint.stallName }}</div>

              <div class="price-point-details">
                <t-row :gutter="[16, 16]">
                  <t-col :span="4">
                    <div class="field-item">
                      <label>行政区划</label>
                      <t-input v-model="currentPoint.areaname" disabled placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>详细地址</label>
                      <t-input v-model="currentPoint.collectAddress" disabled placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价点类型</label>
                      <t-input v-model="currentPoint.stallTypeName" disabled placeholder="" />
                    </div>
                  </t-col>
                </t-row>

                <t-row :gutter="[16, 16]">
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价点归属</label>
                      <t-input v-model="currentPoint.stallVestName" disabled placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价点联系人</label>
                      <t-input v-model="currentPoint.linkerName" disabled placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价点联系电话</label>
                      <t-input v-model="currentPoint.linkerMobile" disabled placeholder="" />
                    </div>
                  </t-col>
                </t-row>

                <div class="price-info">
                  <div class="price-info-title">价格信息</div>

                  <t-row :gutter="[16, 16]">
                    <t-col :span="4">
                      <div class="field-item">
                        <label>品种大类</label>
                        <t-input v-model="currentPoint.varietyName" disabled placeholder="" />
                      </div>
                    </t-col>
                    <t-col :span="4">
                      <div class="field-item">
                        <label>品种小类</label>
                        <t-input v-model="currentPoint.categoryName" disabled placeholder="" />
                      </div>
                    </t-col>
                    <t-col :span="4">
                      <div class="field-item">
                        <label>价格日期</label>
                        <t-input v-model="currentPoint.collectDate" disabled placeholder="" />
                      </div>
                    </t-col>
                  </t-row>
                  <t-table :data="currentPoint.specss" :columns="priceColumns" rowKey="id" bordered>
                    <template #fvSpecsUnit="{ row }">
                      <span>{{ fvSpecsUnit[row.fvSpecsUnit] }}</span>
                    </template>
                    <template #specification="{ row }">
                      <span>{{ formater(row, row.fvSpecsUnit) }}</span>
                    </template>
                    <template #unitPriceStr="{ row }">
                      <span>{{ row.unitPrice }}元/{{ row.varietyUnitCnm }}</span>
                    </template>
                  </t-table>

                  <div class="evidence-section">
                    <div class="evidence-title">价格佐证凭据</div>
                    <div class="credentials-container">
                      <t-image-viewer v-for="(file, index) in priceImageFiles" :key="file.fileId" :default-index="index"
                        :images="priceImageUrls">
                        <template #trigger="{ open }">
                          <div class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                            <img :alt="file.fileName" :src="file.fileUrl"
                              class="tdesign-demo-image-viewer__ui-image--img" />
                            <div class="tdesign-demo-image-viewer__ui-image--hover" @click="open">
                              <span><browse-icon size="1.4em" /> 预览</span>
                            </div>
                          </div>
                        </template>
                      </t-image-viewer>

                      <!-- 视频文件 -->
                      <div v-for="file in priceVideoFiles" :key="file.fileId" class="credential-item">
                        <div class="image-container">
                          <icon-font name="cloud-download" class="downVideo"
                            @click="downloadFile(file.fileId, file.fileName)" />
                          <video :src="file.fileUrl" autoplay></video>
                        </div>
                      </div>

                      <!-- 其他类型文件 -->
                      <div v-for="file in priceOtherFiles" :key="file.fileId" class="credential-item">
                        <div class="file-container" @click="handleFileClick(file)">
                          <div class="file-icon">
                            <i class="file-type">{{ file.fileSuffix }}</i>
                          </div>
                          <div class="file-name">{{ file.fileName }}</div>
                        </div>
                      </div>

                      <!-- 如果没有文件，显示占位符 -->
                      <div v-if="!priceOtherFiles.length && !priceVideoFiles.length && !priceImageFiles.length"
                        class="credential-item">
                        <div class="image-placeholder">
                          <div class="placeholder-x"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="pricing-images-section">
                    <div class="section-subtitle">采价信息</div>
                    <div class="credentials-container">
                      <t-image-viewer v-for="(file, index) in collectImageFiles" :key="file.fileId"
                        :default-index="index" :images="collectImageUrls">
                        <template #trigger="{ open }">
                          <div class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                            <img :alt="file.fileName" :src="file.fileUrl"
                              class="tdesign-demo-image-viewer__ui-image--img" />
                            <div class="tdesign-demo-image-viewer__ui-image--hover" @click="open">
                              <span><browse-icon size="1.4em" /> 预览</span>
                            </div>
                          </div>
                        </template>
                      </t-image-viewer>

                      <!-- 视频文件 -->
                      <div v-for="file in collectVideoFiles" :key="file.fileId" class="credential-item">
                        <div class="image-container">
                          <icon-font name="cloud-download" class="downVideo"
                            @click="downloadFile(file.fileId, file.fileName)" />
                          <video :src="file.fileUrl" autoplay controls></video>
                        </div>
                      </div>

                      <!-- 其他类型文件 -->
                      <div v-for="file in collectOtherFiles" :key="file.fileId" class="credential-item">
                        <div class="file-container" @click="handleFileClick(file)">
                          <div class="file-icon">
                            <i class="file-type">{{ file.fileSuffix }}</i>
                          </div>
                          <div class="file-name">{{ file.fileName }}</div>
                        </div>
                      </div>

                      <!-- 如果没有文件，显示占位符 -->
                      <div v-if="!collectOtherFiles.length && !collectVideoFiles.length && !collectImageFiles.length"
                        class="credential-item">
                        <div class="image-placeholder">
                          <div class="placeholder-x"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <span class="section-title-marker"></span>
            <span>审核意见</span>
          </div>
          <div class="audit-opinion">
            <t-textarea v-model="auditOpinion" placeholder="请输入审核意见..." :autosize="{ minRows: 2 }"
              :disabled="isAuditOpinionReadonly" />
          </div>
        </div>

        <div class="action-buttons">
          <t-button theme="default" @click="goBack">返回</t-button>
          <t-button theme="success" @click="handleApprove" v-if="basicInfo.auditStatus === '待审核'">审核通过</t-button>
          <t-button theme="danger" @click="handleReject" v-if="basicInfo.auditStatus === '待审核'">审核不通过</t-button>
        </div>
      </div>
    </t-card>
    <t-dialog :visible.sync="confirmDialogVisible" :header="confirmDialogTitle" :onConfirm="onConfirmAudit"
      :onCancel="onCancelAudit" width="420px">
      <p>{{ confirmDialogContent }}</p>
    </t-dialog>
  </t-loading>
</template>

<script lang="ts">
import Vue from 'vue';
import { BrowseIcon } from 'tdesign-icons-vue';
import env from '@/config/host';
import { IconFont } from 'tdesign-icons-vue';
export default Vue.extend({
  name: 'MarketPriceReportingDetail',
  components: {
    BrowseIcon,
    IconFont,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      confirmDialogVisible: false,
      confirmDialogTitle: '',
      confirmDialogContent: '',
      pendingAuditResult: '', // 暂存待提交的审核结果
      collectResource: '',
      fvSpecsUnit: {
        mm: '按果径',
        g: '按重量',
      },
      BaseUrl: env[import.meta.env.MODE].imageUrl,
      loading: false,
      currentPointIndex: 0,
      currentPoint: {},
      auditOpinion: '',
      basicInfo: {
        pricingPersonnel: '',
        reportTime: '',
        reportLocation: '',
        pricingSource: '',
        comparisonMethod: '',
        percentage: '',
        actualPercentage: '',
        auditStatus: '',
      },
      pricingPoints: [],
      priceColumns: [
        { title: '渠道', colKey: 'saleChannelCnm' },
        { title: '计价方式', colKey: 'fvSpecsUnit' },
        { title: '规格', colKey: 'specification' },
        { title: '出售价格', colKey: 'unitPriceStr' },
      ],
    };
  },
  computed: {
    // currentPoint() {
    //     return this.pricingPoints.length > 0 ? this.pricingPoints[this.currentPointIndex] : {};
    // },
    // 价格佐证凭据中的图片文件
    priceImageFiles() {
      if (!this.currentPoint.priceFileIds) return [];
      return this.currentPoint.priceFileIds.filter((file) => this.isImageFile(file.fileSuffix));
    },
    // 价格佐证凭据中的图片URL
    priceImageUrls() {
      return this.priceImageFiles.map((file) => file.fileUrl);
    },
    // 价格佐证凭据中的视频文件
    priceVideoFiles() {
      if (!this.currentPoint.priceFileIds) return [];
      return this.currentPoint.priceFileIds.filter((file) => this.isVideoFile(file.fileSuffix));
    },
    // 价格佐证凭据中的其他文件
    priceOtherFiles() {
      if (!this.currentPoint.priceFileIds) return [];
      return this.currentPoint.priceFileIds.filter(
        (file) => !this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix),
      );
    },
    // 采价信息中的图片文件
    collectImageFiles() {
      if (!this.currentPoint.collectFileIds) return [];
      return this.currentPoint.collectFileIds.filter((file) => this.isImageFile(file.fileSuffix));
    },
    // 采价信息中的图片URL
    collectImageUrls() {
      return this.collectImageFiles.map((file) => file.fileUrl);
    },
    // 采价信息中的视频文件
    collectVideoFiles() {
      if (!this.currentPoint.collectFileIds) return [];
      return this.currentPoint.collectFileIds.filter((file) => this.isVideoFile(file.fileSuffix));
    },
    // 采价信息中的其他文件
    collectOtherFiles() {
      if (!this.currentPoint.collectFileIds) return [];
      return this.currentPoint.collectFileIds.filter(
        (file) => !this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix),
      );
    },
    // 控制审核意见是否为只读
    isAuditOpinionReadonly() {
      return this.basicInfo.auditStatus !== '待审核';
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    currentPointCLick(point, index) {
      this.currentPointIndex = index;
      this.getPointDetil(point.collectResource, point);
      this.collectResource = point.collectResource;
    },
    formater(row, unit) {
      if (row.fvSpecsMin && row.fvSpecsMax) {
        return `${row.fvSpecsMin}${unit}-${row.fvSpecsMax}${unit}`;
      } else if (row.fvSpecsMin) {
        return `${row.fvSpecsMin}${unit}以上`;
      } else if (row.fvSpecsMax) {
        return `${row.fvSpecsMax}${unit}以下`;
      }
    },
    getPointDetil(collectResource, point) {
      this.loading = true;
      let RequestURL = {
        '1': 'large/getLargeCollectPrice',
        '2': 'collect/getCollectPrice',
        '3': 'owner/getWxCollecpriceTask',
      };
      let params = {
        condition: {
          primaryKey: point.collectPriceId,
        },
      };
      this.$request
        .post(`/web/${RequestURL[collectResource]}`, params)
        .then(async (res) => {
          this.loading = false;
          console.log(res);
          if (res.retCode === 200) {
            const data = res.retData;
            this.currentPoint = data;
            if (collectResource == '3') {
              this.currentPoint.collectFileIds = data.collectFileIds;
              this.currentPoint.collectFileIds.forEach(async (v) => {
                if (!this.isImageFile(v.fileSuffix) && !this.isVideoFile(v.fileSuffix)) {
                  v.fileUrl = v.fileId;
                } else {
                  v.fileUrl = await this.fetchFileUrl(v.fileId);
                }
                return v;
              });
              this.currentPoint.priceFileIds = data.priceFileIds;
              this.currentPoint.priceFileIds.forEach(async (v) => {
                if (!this.isImageFile(v.fileSuffix) && !this.isVideoFile(v.fileSuffix)) {
                  v.fileUrl = v.fileId;
                } else {
                  v.fileUrl = await this.fetchFileUrl(v.fileId);
                }
                return v;
              });
            } else {
              this.currentPoint.areaname = data.areaName;
              this.currentPoint.collectFileIds = data.collectFiles;
              this.currentPoint.collectFileIds.forEach(async (v) => {
                if (!this.isImageFile(v.fileSuffix) && !this.isVideoFile(v.fileSuffix)) {
                  v.fileUrl = v.fileId;
                } else {
                  v.fileUrl = await this.fetchFileUrl(v.fileId);
                }
                return v;
              });
              this.currentPoint.priceFileIds = data.priceFiles;
              this.currentPoint.priceFileIds.forEach(async (v) => {
                if (!this.isImageFile(v.fileSuffix) && !this.isVideoFile(v.fileSuffix)) {
                  v.fileUrl = v.fileId;
                } else {
                  v.fileUrl = await this.fetchFileUrl(v.fileId);
                }
                return v;
              });
              if (data.specsVoList && data.specsVoList.length) {
                this.currentPoint.specss = data.specsVoList.map((v) => {
                  v.saleChannelCnm = v.saleChannelName;
                  return v;
                });
              }
            }
            if (collectResource == '2') {
              this.currentPoint.specss = data.specss.map((v) => {
                v.saleChannelCnm = v.saleChannelName;
                return v;
              });
            }
            console.log(this.currentPoint, 'this.currentPoint');
          } else {
            this.$message.error(res.retMsg || '获取详情数据失败');
          }
        })
        .catch((e) => {
          this.loading = false;
          console.error('API error:', e);
          // this.$message.error('获取详情数据失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 判断文件是否为图片
    isImageFile(fileSuffix) {
      if (!fileSuffix) return false;
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
      return imageExtensions.includes(fileSuffix.toLowerCase());
    },
    // 判断文件是否为视频
    isVideoFile(fileSuffix) {
      if (!fileSuffix) return false;
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
      return videoExtensions.includes(fileSuffix.toLowerCase());
    },
    handleFileClick(file) {
      if (!file.fileUrl) return;

      if (file.fileSuffix && file.fileSuffix.toLowerCase() === 'pdf') {
        this.courseDownload(file.fileUrl, file.fileName);
      } else if (this.isDocumentFile(file.fileSuffix)) {
        this.courseDownload(file.fileUrl, file.fileName);
      } else {
        this.viewFile(file.fileUrl);
      }
    },
    isDocumentFile(fileSuffix) {
      if (!fileSuffix) return false;
      const docExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
      return docExtensions.includes(fileSuffix.toLowerCase());
    },

    // 查看文件（视频）
    viewFile(url) {
      if (url) {
        window.open(url, '_blank');
      }
    },

    // 下载
    // @param  {String} url 目标文件地址
    // @param  {String} filename 想要保存的文件名称
    courseDownload(url, filename) {
      let that = this;
      this.getBlob(this.BaseUrl + url, function (blob) {
        that.saveAs(blob, filename);
      });
    },
    getBlob(url, cb) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (xhr.status === 200) {
          cb(xhr.response);
        }
      };
      xhr.send();
    },
    // 保存
    // @param  {Blob} blob
    // @param  {String} filename 想要保存的文件名称
    saveAs(blob, filename) {
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        var link = document.createElement('a');
        var body = document.querySelector('body');

        link.href = window.URL.createObjectURL(blob);
        link.download = filename;

        // fix Firefox
        link.style.display = 'none';
        body.appendChild(link);

        link.click();
        body.removeChild(link);

        window.URL.revokeObjectURL(link.href);
      }
    },
    // 下载文件
    downloadFile(url, fileName) {
      console.log(url, 'url');
      if (url) {
        fetch(this.BaseUrl + url)
          .then((res) => res.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            let link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
      }
    },
    async fetchFileUrl(fileId) {
      if (!fileId) return null;

      try {
        const params = {
          condition: {
            primaryKey: fileId,
          },
        };

        const response = await this.$request.post('/file/preview', params, {
          responseType: 'arraybuffer',
        });

        const blob = new Blob([response.data]);
        const objectUrl = URL.createObjectURL(blob);
        console.log(objectUrl);
        return objectUrl;
      } catch (error) {
        console.error('Error fetching file URL:', error);
        return null;
      }
    },

    async processAllFiles() {
      if (this.pricingPoints && this.pricingPoints.length) {
        for (const point of this.pricingPoints) {
          if (point.priceFiles && point.priceFiles.length) {
            for (const file of point.priceFiles) {
              if (!file.fileUrl && file.fileId) {
                file.fileUrl = await this.fetchFileUrl(file.fileId);
              }
            }
          }

          if (point.collectFiles && point.collectFiles.length) {
            for (const file of point.collectFiles) {
              if (!file.fileUrl && file.fileId) {
                file.fileUrl = await this.fetchFileUrl(file.fileId);
              }
            }
          }
        }
      }
    },

    fetchData() {
      this.loading = true;

      const params = {
        condition: {
          primaryKey: this.id,
        },
      };

      this.$request
        .post('/web/collectAudit/getCollectAudit', params)
        .then(async (res) => {
          if (res.retCode === 200) {
            const data = res.retData;

            // 设置基础信息
            this.basicInfo = {
              ...data,
              pricingPersonnel: data.collectorName || '',
              reportTime: data.reportDate || '',
              reportLocation: data.reportLocation || '',
              pricingSource: data.collectResourceName || '',
              comparisonMethod: data.collectTypeStr || '',
              percentage: data.collectRate || '',
              actualPercentage: data.actualCollectRate || '',
              auditStatus: this.getAuditStatusText(data.auditResult),
            };

            // 如果已审核，回显审核意见
            if (data.auditResult === '1' || data.auditResult === '2') {
              this.auditOpinion = data.auditOpinion || '';
            }

            // 处理采价点信息
            this.processPricingPoints(data.stallPrices || []);
            this.loading = false;
            if (data.stallPrices.length) {
              const { collectResource } = data.stallPrices[0];
              this.collectResource = collectResource;

              this.getPointDetil(collectResource, data.stallPrices[0]);
            }
            await this.processAllFiles();
          } else {
            this.$message.error(res.retMsg || '获取详情数据失败');
          }
        })
        .catch((e) => {
          console.error('API error:', e);
          // this.$message.error('获取详情数据失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    processPricingPoints(priceVoList) {
      if (!priceVoList || priceVoList.length === 0) {
        this.pricingPoints = [];
        return;
      }

      this.pricingPoints = priceVoList.map((item) => {
        return {
          name: item.stallName || '',
          collectPriceId: item.collectPriceId,
          collectResource: item.collectResource,
          adminRegion: item.areaName || '',
          address: item.collectAddress || '',
          pointType: item.stallTypeName || '',
          pointAffiliation: item.stallVestName || '',
          contactPerson: item.linkerName || '',
          contactPhone: item.linkerMobile || '',
          majorCategory: item.varietyName || '',
          minorCategory: item.categoryName || '',
          priceDate: item.collectDate || '',
          priceFiles: item.priceFiles || [],
          collectFiles: item.collectFiles || [],
          priceData: this.processPriceData(item.specsVoList || []),
        };
      });
    },
    // 规格价格数据
    processPriceData(specsVoList) {
      return specsVoList.map((spec, index) => {
        return {
          id: spec.collectSpecsId || index.toString(),
          channel: spec.saleChannelName || '',
          calculationMethod: spec.fvSpecs || '',
          specification: spec.specsTypeName || '',
          price: spec.unitPriceStr || '',
        };
      });
    },
    // 获取审核状态文本
    getAuditStatusText(auditResult) {
      const statusMap = {
        '0': '待审核',
        '1': '审核通过',
        '2': '审核不通过',
      };
      return statusMap[auditResult] || '未知状态';
    },
    goBack() {
      this.$router.back();
    },
    handleApprove() {
      this.confirmDialogTitle = '确认审核通过';
      this.confirmDialogContent = '确定要审核通过吗？';
      this.pendingAuditResult = '1';
      this.confirmDialogVisible = true;
    },
    handleReject() {
      if (!this.auditOpinion.trim()) {
        this.$message.warning('请填写审核意见');
        return;
      }

      this.confirmDialogTitle = '确认审核不通过';
      this.confirmDialogContent = '确定要审核不通过吗？';
      this.pendingAuditResult = '2';
      this.confirmDialogVisible = true;
    },
    // 添加确认审核方法
    onConfirmAudit() {
      this.confirmDialogVisible = false;
      this.submitAuditResult(this.pendingAuditResult);
    },

    // 添加取消审核方法
    onCancelAudit() {
      this.confirmDialogVisible = false;
      this.pendingAuditResult = '';
    },
    submitAuditResult(auditResult) {
      this.loading = true;

      const params = {
        auditId: this.id,
        auditOpinion: this.auditOpinion,
        auditResult: auditResult,
      };

      this.$request
        .post('/web/collectAudit/auditCollectTask', params)
        .then((res) => {
          if (res.retCode === 200) {
            this.basicInfo.auditStatus = auditResult === '1' ? '审核通过' : '审核不通过';
            this.$message.success(auditResult === '1' ? '审核通过' : '审核不通过');

            this.goBack();
          } else {
            this.$message.error(res.retMsg || '审核操作失败');
          }
        })
        .catch((e) => {
          console.error('API error:', e);
          this.$message.error('审核操作失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
});
</script>

<style lang="less" scoped>
.detail-container {
  // padding: 20px;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;

  .section-title-marker {
    width: 4px;
    height: 16px;
    background-color: var(--td-brand-color);
    margin-right: 8px;
  }
}

.sub-section {
  margin-top: 24px;
  margin-bottom: 24px;
}

.field-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  label {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    margin-bottom: 8px;
  }
}

.price-points-section {
  display: flex;
  border: 1px solid #e5e5e5;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
}

.sidebar-navigation {
  width: 200px;
  border-right: 1px solid #e5e5e5;
}

.navigation-header {
  background-color: #6aaa5a;
  color: white;
  padding: 10px 16px;
  font-weight: bold;
}

.navigation-list {
  height: 100%;
}

.navigation-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #e5e5e5;
}

.navigation-item:hover {
  background-color: #f5f5f5;
}

.navigation-item.active {
  border-right: 3px solid #1890ff;
  font-weight: bold;
}

.point-content {
  flex: 1;
}

.price-point-header {
  background-color: #6aaa5a;
  color: white;
  padding: 10px 16px;
  font-weight: bold;
}

.price-point-details {
  padding: 16px;
}

.price-info {
  margin-top: 20px;
}

.price-info-title {
  font-weight: bold;
  margin-bottom: 16px;
}

.evidence-section {
  margin-top: 24px;
}

.evidence-title {
  font-weight: bold;
  margin-bottom: 16px;
}

.section-subtitle {
  font-weight: bold;
  margin: 24px 0 16px 0;
}

.credentials-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.credential-item {
  width: 120px;
  height: 120px;
  cursor: pointer;
}

video {
  height: 100%;
  width: 100%;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e5e5;
  overflow: hidden;
  position: relative;
}

.credential-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.downVideo {
  height: 20px;
  position: absolute;
  right: 0;
  top: 0px;
  color: red;
  font-size: 20px;
  z-index: 999;
}

.video-icon {
  font-size: 32px;
  color: #1890ff;
}

.file-container {
  width: 100%;
  height: 100%;
  border: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.file-icon {
  width: 60px;
  height: 60px;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.file-type {
  font-style: normal;
  font-size: 12px;
  font-weight: bold;
}

.file-name {
  font-size: 12px;
  text-align: center;
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  position: relative;
}

.placeholder-x {
  position: relative;
  width: 100%;
  height: 100%;

  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80%;
    height: 1px;
    background-color: #ccc;
  }

  &:before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &:after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
}

.pricing-images-section {
  margin-top: 24px;
}

.audit-opinion {
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  // position: sticky;
  bottom: 0;
  margin-top: 40px;
  padding: 16px 0;
  z-index: 10;
}

.detail-container {
  padding-bottom: 20px;
  position: relative;
}

/* 图片查看器样式 */
.tdesign-demo-image-viewer__ui-image {
  width: 100%;
  height: 100%;
  display: inline-flex;
  position: relative;
  justify-content: center;
  align-items: center;
  border-radius: var(--td-radius-small);
  overflow: hidden;
}

.tdesign-demo-image-viewer__ui-image--hover {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: var(--td-text-color-anti);
  line-height: 22px;
  transition: 0.2s;
}

.tdesign-demo-image-viewer__ui-image:hover .tdesign-demo-image-viewer__ui-image--hover {
  opacity: 1;
  cursor: pointer;
}

.tdesign-demo-image-viewer__ui-image--img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  cursor: pointer;
  position: absolute;
}

.tdesign-demo-image-viewer__base {
  width: 120px;
  height: 120px;
  margin: 0;
  border: 1px solid var(--td-bg-color-secondarycontainer);
  border-radius: var(--td-radius-medium);
}
</style>