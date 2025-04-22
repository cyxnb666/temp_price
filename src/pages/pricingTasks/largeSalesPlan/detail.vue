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
                  <label>行政区划</label>
                  <t-input v-model="basicInfo.adminRegion" readonly placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>采价点</label>
                  <t-input v-model="basicInfo.pointName" readonly placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>上报地点</label>
                  <t-input v-model="basicInfo.reportLocation" readonly placeholder="" />
                </div>
              </t-col>
            </t-row>

            <t-row :gutter="[16, 16]">
              <t-col :span="4">
                <div class="field-item">
                  <label>品种大类</label>
                  <t-input v-model="basicInfo.minorCategory" readonly placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>品种小类</label>
                  <t-input v-model="basicInfo.majorCategory" readonly placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>计划出售时间</label>
                  <t-input v-model="basicInfo.planSaleTime" readonly placeholder="" />
                </div>
              </t-col>
            </t-row>

            <t-row :gutter="[16, 16]">
              <t-col :span="4">
                <div class="field-item">
                  <label>预估重量 (kg)</label>
                  <t-input v-model="basicInfo.estimatedVolume" readonly placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>采价点类型</label>
                  <t-input v-model="basicInfo.pointType" readonly placeholder="" />
                </div>
              </t-col>
              <t-col :span="4">
                <div class="field-item">
                  <label>联系人</label>
                  <t-input v-model="basicInfo.contactPerson" readonly placeholder="" />
                </div>
              </t-col>
            </t-row>

            <t-row :gutter="[16, 16]">
              <t-col :span="4">
                <div class="field-item">
                  <label>联系人手机号</label>
                  <t-input v-model="basicInfo.contactPhone" readonly placeholder="" />
                </div>
              </t-col>
            </t-row>
          </div>

          <div class="sub-section">
            <div class="sub-section-title">订单凭据</div>
            <div class="credentials-container">
              <t-image-viewer
                v-for="(file, index) in orderImageFiles"
                :key="file.fileId"
                :default-index="index"
                :images="orderImageUrls"
              >
                <template #trigger="{ open }">
                  <div class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                    <img :alt="file.fileName" :src="file.fileUrl" class="tdesign-demo-image-viewer__ui-image--img" />
                    <div class="tdesign-demo-image-viewer__ui-image--hover" @click="open">
                      <span><browse-icon size="1.4em" /> 预览</span>
                    </div>
                  </div>
                </template>
              </t-image-viewer>

              <!-- 视频文件 -->
              <div v-for="file in orderVideoFiles" :key="file.fileId" class="credential-item">
                <div class="image-container">
                  <div class="video-placeholder">
                    <icon-font
                      name="cloud-download"
                      class="downVideo"
                      @click="downloadFile(file.fileId, file.fileName)"
                    />
                    <video :src="file.fileUrl" autoplay></video>
                  </div>
                </div>
              </div>

              <!-- 其他类型文件 -->
              <div v-for="file in orderOtherFiles" :key="file.fileId" class="credential-item">
                <!-- <vue-office-docx src="https://webxtx-test-sz.oss-cn-shenzhen.aliyuncs.com/price_saas/1912037056993955840.docx" style="height: 100vh" @rendered="renderedHandler" @error="errorHandler" /> -->
                <div class="file-container" @click="handleFileClick(file)">
                  <div class="file-icon">
                    <i class="file-type">{{ file.fileSuffix.toUpperCase() }}</i>
                  </div>
                  <div class="file-name">{{ file.fileName }}</div>
                </div>
              </div>

              <!-- 如果没有文件，显示占位符 -->
              <div v-if="!orderFiles || orderFiles.length === 0" class="credential-item">
                <div class="image-placeholder">
                  <div class="placeholder-x"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <span class="section-title-marker"></span>
            <span>关联采价信息</span>
          </div>

          <t-tabs v-model="activeTab">
            <t-tab-panel value="personnel" label="采价员采价数据">
              <div class="sub-section">
                <div class="sub-section-title">基础信息</div>

                <t-row :gutter="[16, 16]">
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价员</label>
                      <t-input v-model="pricingInfo.personnel.pricingPersonnel" readonly placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>上报时间</label>
                      <t-input v-model="pricingInfo.personnel.reportTime" readonly placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>上报地点</label>
                      <t-input v-model="pricingInfo.personnel.reportLocation" readonly placeholder="" />
                    </div>
                  </t-col>
                </t-row>

                <t-row :gutter="[16, 16]">
                  <t-col :span="4">
                    <div class="field-item">
                      <label>审核状态</label>
                      <t-input v-model="pricingInfo.personnel.auditStatus" readonly placeholder="" />
                    </div>
                  </t-col>
                </t-row>
              </div>

              <div class="price-points-section">
                <!-- 左侧导航栏 -->
                <div class="sidebar-navigation">
                  <div class="navigation-header">采价点列表</div>
                  <div class="navigation-list">
                    <div
                      v-for="(point, index) in currentPoints"
                      :key="index"
                      :class="['navigation-item', currentPointIndex === index ? 'active' : '']"
                      @click="currentPointIndex = index"
                    >
                      {{ point.name }}
                    </div>
                  </div>
                </div>

                <!-- 右侧内容区域 -->
                <div class="point-content">
                  <div class="price-point-header">{{ currentPoint.name }}</div>

                  <div class="price-point-details">
                    <t-row :gutter="[16, 16]">
                      <t-col :span="4">
                        <div class="field-item">
                          <label>行政区划</label>
                          <t-input v-model="currentPoint.adminRegion" readonly placeholder="" />
                        </div>
                      </t-col>
                      <t-col :span="4">
                        <div class="field-item">
                          <label>详细地址</label>
                          <t-input v-model="currentPoint.address" readonly placeholder="" />
                        </div>
                      </t-col>
                      <t-col :span="4">
                        <div class="field-item">
                          <label>采价点类型</label>
                          <t-input v-model="currentPoint.pointType" readonly placeholder="" />
                        </div>
                      </t-col>
                    </t-row>

                    <t-row :gutter="[16, 16]">
                      <t-col :span="4">
                        <div class="field-item">
                          <label>采价点归属</label>
                          <t-input v-model="currentPoint.pointAffiliation" readonly placeholder="" />
                        </div>
                      </t-col>
                      <t-col :span="4">
                        <div class="field-item">
                          <label>采价点联系人</label>
                          <t-input v-model="currentPoint.contactPerson" readonly placeholder="" />
                        </div>
                      </t-col>
                      <t-col :span="4">
                        <div class="field-item">
                          <label>采价点联系电话</label>
                          <t-input v-model="currentPoint.contactPhone" readonly placeholder="" />
                        </div>
                      </t-col>
                    </t-row>

                    <div class="price-info">
                      <div class="price-info-title">价格信息</div>

                      <t-row :gutter="[16, 16]">
                        <t-col :span="4">
                          <div class="field-item">
                            <label>品种大类</label>
                            <t-input v-model="currentPoint.majorCategory" readonly placeholder="" />
                          </div>
                        </t-col>
                        <t-col :span="4">
                          <div class="field-item">
                            <label>品种小类</label>
                            <t-input v-model="currentPoint.minorCategory" readonly placeholder="" />
                          </div>
                        </t-col>
                        <t-col :span="4">
                          <div class="field-item">
                            <label>价格日期</label>
                            <t-input v-model="currentPoint.priceDate" readonly placeholder="" />
                          </div>
                        </t-col>
                      </t-row>

                      <t-table :data="currentPoint.priceData" :columns="priceColumns" rowKey="id" bordered />

                      <div class="evidence-section">
                        <div class="evidence-title">价格佐证凭据</div>
                        <div class="credentials-container">
                          <!-- 图片文件使用 t-image-viewer -->
                          <t-image-viewer
                            v-for="(file, index) in getPointImageFiles(currentPoint, 'price')"
                            :key="file.fileId"
                            :default-index="index"
                            :images="getPointImageUrls(currentPoint, 'price')"
                          >
                            <template #trigger="{ open }">
                              <div class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                                <img
                                  :alt="file.fileName"
                                  :src="file.fileUrl"
                                  class="tdesign-demo-image-viewer__ui-image--img"
                                />
                                <div class="tdesign-demo-image-viewer__ui-image--hover" @click="open">
                                  <span><browse-icon size="1.4em" /> 预览</span>
                                </div>
                              </div>
                            </template>
                          </t-image-viewer>

                          <!-- 视频文件 -->
                          <div
                            v-for="file in getPointVideoFiles(currentPoint, 'price')"
                            :key="file.fileId"
                            class="credential-item"
                          >
                            <div class="image-container" @click="viewFile(file.fileUrl)">
                              <div class="video-placeholder">
                                <!-- <i class="video-icon">▶</i>
                                <div class="file-name">{{ file.fileName }}</div> -->
                                <icon-font
                                  name="cloud-download"
                                  class="downVideo"
                                  @click="downloadFile(file.fileId, file.fileName)"
                                />
                                <video :src="file.fileUrl" autoplay></video>
                              </div>
                            </div>
                          </div>

                          <!-- 其他类型文件 -->
                          <div
                            v-for="file in getPointOtherFiles(currentPoint, 'price')"
                            :key="file.fileId"
                            class="credential-item"
                          >
                            <div class="file-container" @click="handleFileClick(file)">
                              <div class="file-icon">
                                <i class="file-type">{{ file.fileSuffix.toUpperCase() }}</i>
                              </div>
                              <div class="file-name">{{ file.fileName }}</div>
                            </div>
                          </div>

                          <!-- 如果没有文件，显示占位符 -->
                          <div
                            v-if="!currentPoint.priceFiles || currentPoint.priceFiles.length === 0"
                            class="credential-item"
                          >
                            <div class="image-placeholder">
                              <div class="placeholder-x"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="pricing-images-section">
                        <div class="section-subtitle">采价信息</div>
                        <div class="credentials-container">
                          <t-image-viewer
                            v-for="(file, index) in getPointImageFiles(currentPoint, 'collect')"
                            :key="file.fileId"
                            :default-index="index"
                            :images="getPointImageUrls(currentPoint, 'collect')"
                          >
                            <template #trigger="{ open }">
                              <div class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                                <img
                                  :alt="file.fileName"
                                  :src="file.fileUrl"
                                  class="tdesign-demo-image-viewer__ui-image--img"
                                />
                                <div class="tdesign-demo-image-viewer__ui-image--hover" @click="open">
                                  <span><browse-icon size="1.4em" /> 预览</span>
                                </div>
                              </div>
                            </template>
                          </t-image-viewer>

                          <!-- 视频文件 -->
                          <div
                            v-for="file in getPointVideoFiles(currentPoint, 'collect')"
                            :key="file.fileId"
                            class="credential-item"
                          >
                            <div class="image-container" @click="viewFile(file.fileUrl)">
                              <div class="video-placeholder">
                                <icon-font
                                  name="cloud-download"
                                  class="downVideo"
                                  @click="downloadFile(file.fileId, file.fileName)"
                                />
                                <video :src="file.fileUrl" autoplay></video>
                              </div>
                            </div>
                          </div>

                          <!-- 其他类型文件 -->
                          <div
                            v-for="file in getPointOtherFiles(currentPoint, 'collect')"
                            :key="file.fileId"
                            class="credential-item"
                          >
                            <div class="file-container" @click="handleFileClick(file)">
                              <div class="file-icon">
                                <i class="file-type">{{ file.fileSuffix.toUpperCase() }}</i>
                              </div>
                              <div class="file-name">{{ file.fileName }}</div>
                            </div>
                          </div>

                          <!-- 如果没有文件，显示占位符 -->
                          <div
                            v-if="!currentPoint.collectFiles || currentPoint.collectFiles.length === 0"
                            class="credential-item"
                          >
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
            </t-tab-panel>

            <t-tab-panel value="selfReported" label="采价点自行采价数据">
              <div class="sub-section">
                <div class="sub-section-title">基础信息</div>

                <t-row :gutter="[16, 16]">
                  <t-col :span="4">
                    <div class="field-item">
                      <label>采价员</label>
                      <t-input v-model="pricingInfo.selfReported.pricingPersonnel" readonly placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>上报时间</label>
                      <t-input v-model="pricingInfo.selfReported.reportTime" readonly placeholder="" />
                    </div>
                  </t-col>
                  <t-col :span="4">
                    <div class="field-item">
                      <label>上报地点</label>
                      <t-input v-model="pricingInfo.selfReported.reportLocation" readonly placeholder="" />
                    </div>
                  </t-col>
                </t-row>

                <t-row :gutter="[16, 16]">
                  <t-col :span="4">
                    <div class="field-item">
                      <label>审核状态</label>
                      <t-input v-model="pricingInfo.selfReported.auditStatus" readonly placeholder="" />
                    </div>
                  </t-col>
                </t-row>
              </div>

              <div class="price-points-section">
                <!-- 左侧导航栏 -->
                <div class="sidebar-navigation">
                  <div class="navigation-header">采价点列表</div>
                  <div class="navigation-list">
                    <div
                      v-for="(point, index) in pricingInfo.selfReported.points"
                      :key="index"
                      :class="['navigation-item', selectedSelfReportedPointIndex === index ? 'active' : '']"
                      @click="selectedSelfReportedPointIndex = index"
                    >
                      {{ point.name }}
                    </div>
                  </div>
                </div>

                <!-- 右侧内容区域 -->
                <div class="point-content">
                  <div class="price-point-header">{{ currentSelfReportedPoint.name }}</div>

                  <div class="price-point-details">
                    <t-row :gutter="[16, 16]">
                      <t-col :span="4">
                        <div class="field-item">
                          <label>行政区划</label>
                          <t-input v-model="currentSelfReportedPoint.adminRegion" readonly placeholder="" />
                        </div>
                      </t-col>
                      <t-col :span="4">
                        <div class="field-item">
                          <label>详细地址</label>
                          <t-input v-model="currentSelfReportedPoint.address" readonly placeholder="" />
                        </div>
                      </t-col>
                      <t-col :span="4">
                        <div class="field-item">
                          <label>采价点类型</label>
                          <t-input v-model="currentSelfReportedPoint.pointType" readonly placeholder="" />
                        </div>
                      </t-col>
                    </t-row>

                    <t-row :gutter="[16, 16]">
                      <t-col :span="4">
                        <div class="field-item">
                          <label>采价点归属</label>
                          <t-input v-model="currentSelfReportedPoint.pointAffiliation" readonly placeholder="" />
                        </div>
                      </t-col>
                      <t-col :span="4">
                        <div class="field-item">
                          <label>采价点联系人</label>
                          <t-input v-model="currentSelfReportedPoint.contactPerson" readonly placeholder="" />
                        </div>
                      </t-col>
                      <t-col :span="4">
                        <div class="field-item">
                          <label>采价点联系电话</label>
                          <t-input v-model="currentSelfReportedPoint.contactPhone" readonly placeholder="" />
                        </div>
                      </t-col>
                    </t-row>

                    <div class="price-info">
                      <div class="price-info-title">价格信息</div>

                      <t-row :gutter="[16, 16]">
                        <t-col :span="4">
                          <div class="field-item">
                            <label>品种大类</label>
                            <t-input v-model="currentSelfReportedPoint.majorCategory" readonly placeholder="" />
                          </div>
                        </t-col>
                        <t-col :span="4">
                          <div class="field-item">
                            <label>品种小类</label>
                            <t-input v-model="currentSelfReportedPoint.minorCategory" readonly placeholder="" />
                          </div>
                        </t-col>
                        <t-col :span="4">
                          <div class="field-item">
                            <label>价格日期</label>
                            <t-input v-model="currentSelfReportedPoint.priceDate" readonly placeholder="" />
                          </div>
                        </t-col>
                      </t-row>

                      <t-table
                        bordered
                        :data="currentSelfReportedPoint.priceData"
                        :columns="priceColumns"
                        rowKey="id"
                      />

                      <div class="evidence-section">
                        <div class="evidence-title">价格佐证凭据</div>
                        <div class="credentials-container">
                          <t-image-viewer
                            v-for="(file, index) in getPointImageFiles(currentSelfReportedPoint, 'price')"
                            :key="file.fileId"
                            :default-index="index"
                            :images="getPointImageUrls(currentSelfReportedPoint, 'price')"
                          >
                            <template #trigger="{ open }">
                              <div class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                                <img
                                  :alt="file.fileName"
                                  :src="file.fileUrl"
                                  class="tdesign-demo-image-viewer__ui-image--img"
                                />
                                <div class="tdesign-demo-image-viewer__ui-image--hover" @click="open">
                                  <span><browse-icon size="1.4em" /> 预览</span>
                                </div>
                              </div>
                            </template>
                          </t-image-viewer>

                          <!-- 视频文件 -->
                          <div
                            v-for="file in getPointVideoFiles(currentSelfReportedPoint, 'price')"
                            :key="file.fileId"
                            class="credential-item"
                          >
                            <div class="image-container" @click="viewFile(file.fileUrl)">
                              <div class="video-placeholder">
                                <icon-font
                                  name="cloud-download"
                                  class="downVideo"
                                  @click="downloadFile(file.fileId, file.fileName)"
                                />
                                <video :src="file.fileUrl" autoplay></video>
                              </div>
                            </div>
                          </div>

                          <!-- 其他类型文件 -->
                          <div
                            v-for="file in getPointOtherFiles(currentSelfReportedPoint, 'price')"
                            :key="file.fileId"
                            class="credential-item"
                          >
                            <div class="file-container" @click="handleFileClick(file)">
                              <div class="file-icon">
                                <i class="file-type">{{ file.fileSuffix.toUpperCase() }}</i>
                              </div>
                              <div class="file-name">{{ file.fileName }}</div>
                            </div>
                          </div>

                          <!-- 如果没有文件，显示占位符 -->
                          <div
                            v-if="
                              !currentSelfReportedPoint.priceFiles || currentSelfReportedPoint.priceFiles.length === 0
                            "
                            class="credential-item"
                          >
                            <div class="image-placeholder">
                              <div class="placeholder-x"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="pricing-images-section">
                        <div class="section-subtitle">采价信息</div>
                        <div class="credentials-container">
                          <t-image-viewer
                            v-for="(file, index) in getPointImageFiles(currentSelfReportedPoint, 'collect')"
                            :key="file.fileId"
                            :default-index="index"
                            :images="getPointImageUrls(currentSelfReportedPoint, 'collect')"
                          >
                            <template #trigger="{ open }">
                              <div class="tdesign-demo-image-viewer__ui-image tdesign-demo-image-viewer__base">
                                <img
                                  :alt="file.fileName"
                                  :src="file.fileUrl"
                                  class="tdesign-demo-image-viewer__ui-image--img"
                                />
                                <div class="tdesign-demo-image-viewer__ui-image--hover" @click="open">
                                  <span><browse-icon size="1.4em" /> 预览</span>
                                </div>
                              </div>
                            </template>
                          </t-image-viewer>

                          <!-- 视频文件 -->
                          <div
                            v-for="file in getPointVideoFiles(currentSelfReportedPoint, 'collect')"
                            :key="file.fileId"
                            class="credential-item"
                          >
                            <div class="image-container" @click="viewFile(file.fileUrl)">
                              <div class="video-placeholder">
                                <icon-font
                                  name="cloud-download"
                                  class="downVideo"
                                  @click="downloadFile(file.fileId, file.fileName)"
                                />
                                <video :src="file.fileUrl" autoplay></video>
                              </div>
                            </div>
                          </div>

                          <!-- 其他类型文件 -->
                          <div
                            v-for="file in getPointOtherFiles(currentSelfReportedPoint, 'collect')"
                            :key="file.fileId"
                            class="credential-item"
                          >
                            <div class="file-container" @click="handleFileClick(file)">
                              <div class="file-icon">
                                <i class="file-type">{{ file.fileSuffix.toUpperCase() }}</i>
                              </div>
                              <div class="file-name">{{ file.fileName }}</div>
                            </div>
                          </div>

                          <!-- 如果没有文件，显示占位符 -->
                          <div
                            v-if="
                              !currentSelfReportedPoint.collectFiles ||
                              currentSelfReportedPoint.collectFiles.length === 0
                            "
                            class="credential-item"
                          >
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
            </t-tab-panel>
          </t-tabs>
        </div>

        <div class="back-button-container">
          <t-button theme="default" @click="goBack">返回</t-button>
        </div>
      </div>
    </t-card>
  </t-loading>
</template>

<script lang="ts">
import VueOfficeDocx from '@vue-office/docx';
import VueOfficeExcel from '@vue-office/excel';
import VueOfficePdf from '@vue-office/pdf';
import '@vue-office/docx/lib/index.css';
import '@vue-office/excel/lib/index.css';
import env from '@/config/host';
import Vue from 'vue';
import { BrowseIcon } from 'tdesign-icons-vue';
import { IconFont } from 'tdesign-icons-vue';
export default Vue.extend({
  name: 'LargeSalesPlanDetail',
  components: {
    BrowseIcon,
    VueOfficeDocx,
    VueOfficeExcel,
    VueOfficePdf,
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
      activeTab: 'personnel',
      loading: false,
      taskStatus: {
        '0': '待提交',
        '1': '待认领',
        '2': '待采价',
        '3': '采价中',
        '4': '待审核',
      },
      basicInfo: {
        adminRegion: '',
        pointName: '',
        reportLocation: '',
        majorCategory: '',
        minorCategory: '',
        planSaleTime: '',
        estimatedVolume: '',
        pointType: '',
        contactPerson: '',
        contactPhone: '',
      },
      BaseUrl: env[import.meta.env.MODE].imageUrl,
      options: {
        xls: false, //预览xlsx文件设为false；预览xls文件设为true
        minColLength: 0, // excel最少渲染多少列，如果想实现xlsx文件内容有几列，就渲染几列，可以将此值设置为0.
        minRowLength: 0, // excel最少渲染多少行，如果想实现根据xlsx实际函数渲染，可以将此值设置为0.
        widthOffset: 10, //如果渲染出来的结果感觉单元格宽度不够，可以在默认渲染的列表宽度上再加 Npx宽
        heightOffset: 10, //在默认渲染的列表高度上再加 Npx高
        beforeTransformData: (workbookData) => {
          return workbookData;
        }, //底层通过exceljs获取excel文件内容，通过该钩子函数，可以对获取的excel文件内容进行修改，比如某个单元格的数据显示不正确，可以在此自行修改每个单元格的value值。
        transformData: (workbookData) => {
          return workbookData;
        }, //将获取到的excel数据进行处理之后且渲染到页面之前，可通过transformData对即将渲染的数据及样式进行修改，此时每个单元格的text值就是即将渲染到页面上的内容
      },
      // 订单凭据
      orderFiles: [],
      // 采价信息
      pricingInfo: {
        personnel: {
          pricingPersonnel: '',
          reportTime: '',
          reportLocation: '',
          auditStatus: '',
          points: [],
        },
        selfReported: {
          pricingPersonnel: '',
          reportTime: '',
          reportLocation: '',
          auditStatus: '',
          points: [],
        },
      },
      priceColumns: [
        { title: '渠道', colKey: 'channel' },
        { title: '计价方式', colKey: 'specification' },
        { title: '规格', colKey: 'calculationMethod' },
        { title: '出售价格', colKey: 'price' },
      ],
      selectedPersonnelPointIndex: 0,
      selectedSelfReportedPointIndex: 0,
    };
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    currentPersonnelPoint() {
      return this.pricingInfo.personnel.points[this.selectedPersonnelPointIndex] || {};
    },
    currentSelfReportedPoint() {
      return this.pricingInfo.selfReported.points[this.selectedSelfReportedPointIndex] || {};
    },
    currentPoint() {
      return this.activeTab === 'personnel' ? this.currentPersonnelPoint : this.currentSelfReportedPoint;
    },
    currentPointIndex: {
      get() {
        return this.activeTab === 'personnel' ? this.selectedPersonnelPointIndex : this.selectedSelfReportedPointIndex;
      },
      set(value) {
        if (this.activeTab === 'personnel') {
          this.selectedPersonnelPointIndex = value;
        } else {
          this.selectedSelfReportedPointIndex = value;
        }
      },
    },
    currentPoints() {
      return this.activeTab === 'personnel' ? this.pricingInfo.personnel.points : this.pricingInfo.selfReported.points;
    },
    // 订单凭据中的图片文件
    orderImageFiles() {
      if (!this.orderFiles) return [];
      return this.orderFiles.filter((file) => this.isImageFile(file.fileSuffix));
    },
    // 订单凭据中的图片URL
    orderImageUrls() {
      return this.orderImageFiles.map((file) => file.fileUrl);
    },
    // 订单凭据中的视频文件
    orderVideoFiles() {
      if (!this.orderFiles) return [];
      return this.orderFiles.filter((file) => this.isVideoFile(file.fileSuffix));
    },
    // 订单凭据中的其他文件
    orderOtherFiles() {
      if (!this.orderFiles) return [];
      return this.orderFiles.filter((file) => !this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix));
    },
  },
  methods: {
    renderedHandler() {
      console.log('渲染完成');
    },
    errorHandler() {
      console.log('渲染失败');
    },
    // 获取特定点的图片文件
    getPointImageFiles(point, type) {
      const files = type === 'price' ? point.priceFiles : point.collectFiles;
      if (!files) return [];
      return files.filter((file) => this.isImageFile(file.fileSuffix));
    },
    // 获取特定点的图片URL
    getPointImageUrls(point, type) {
      const files = this.getPointImageFiles(point, type);
      return files.map((file) => file.fileUrl);
    },
    // 获取特定点的视频文件
    getPointVideoFiles(point, type) {
      const files = type === 'price' ? point.priceFiles : point.collectFiles;
      if (!files) return [];
      return files.filter((file) => this.isVideoFile(file.fileSuffix));
    },
    // 获取特定点的其他文件
    getPointOtherFiles(point, type) {
      const files = type === 'price' ? point.priceFiles : point.collectFiles;
      if (!files) return [];
      return files.filter((file) => !this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix));
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

        return objectUrl;
      } catch (error) {
        console.error('Error fetching file URL:', error);
        return null;
      }
    },

    async processAllFiles() {
      if (this.orderFiles && this.orderFiles.length) {
        for (const file of this.orderFiles) {
          if (!file.fileUrl && file.fileId) {
            if (!this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix)) {
              file.fileUrl = file.fileId;
            } else {
              file.fileUrl = await this.fetchFileUrl(file.fileId);
            }
          }
        }
      }

      if (this.pricingInfo.personnel.points && this.pricingInfo.personnel.points.length) {
        for (const point of this.pricingInfo.personnel.points) {
          if (point.priceFiles && point.priceFiles.length) {
            for (const file of point.priceFiles) {
              if (!file.fileUrl && file.fileId) {
                if (!this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix)) {
                  file.fileUrl = file.fileId;
                } else {
                  file.fileUrl = await this.fetchFileUrl(file.fileId);
                }
              }
            }
          }
          if (point.collectFiles && point.collectFiles.length) {
            for (const file of point.collectFiles) {
              if (!file.fileUrl && file.fileId) {
                if (!this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix)) {
                  file.fileUrl = file.fileId;
                } else {
                  file.fileUrl = await this.fetchFileUrl(file.fileId);
                }
              }
            }
          }
        }
      }

      if (this.pricingInfo.selfReported.points && this.pricingInfo.selfReported.points.length) {
        for (const point of this.pricingInfo.selfReported.points) {
          if (point.priceFiles && point.priceFiles.length) {
            for (const file of point.priceFiles) {
              if (!file.fileUrl && file.fileId) {
                if (!this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix)) {
                  file.fileUrl = file.fileId;
                } else {
                  file.fileUrl = await this.fetchFileUrl(file.fileId);
                }
              }
            }
          }
          if (point.collectFiles && point.collectFiles.length) {
            for (const file of point.collectFiles) {
              if (!file.fileUrl && file.fileId) {
                if (!this.isImageFile(file.fileSuffix) && !this.isVideoFile(file.fileSuffix)) {
                  file.fileUrl = file.fileId;
                } else {
                  file.fileUrl = await this.fetchFileUrl(file.fileId);
                }
              }
            }
          }
        }
      }
    },
    fetchData() {
      this.loading = true;

      this.$request
        .get(`/web/large/getLargeDetails/${this.id}`)
        .then(async (res) => {
          this.loading = false;
          if (res.retCode === 200) {
            const data = res.retData;

            // 设置基本信息
            this.basicInfo = {
              adminRegion: data.areaName || '',
              pointName: data.stallName || '',
              reportLocation: data.registAddress || '',
              majorCategory: data.categoryName || '',
              minorCategory: data.varietyName || '',
              planSaleTime: data.planSaleDate || '',
              estimatedVolume: data.planSaleWeight ? data.planSaleWeight.toString() : '',
              pointType: data.stallTypeName || '',
              contactPerson: data.linkerName || '',
              contactPhone: data.linkerMobile || '',
            };

            // 订单凭据
            this.orderFiles = data.orderFiles || [];

            // 采价员采价数据
            if (data.collectorPrice) {
              this.pricingInfo.personnel = {
                pricingPersonnel: data.collectorPrice.collectorName || '',
                reportTime: data.collectorPrice.collectDate || '',
                reportLocation: data.collectorPrice.collectAddress || '',
                auditStatus: this.mapPriceStatus(data.collectorPrice.priceStatus) || '',
                points: this.mapPointsData(data.collectorPrice.points || []),
              };
            }

            // 采价点自行采价数据
            if (data.ownPrice) {
              this.pricingInfo.selfReported = {
                pricingPersonnel: data.ownPrice.collectorName || '',
                reportTime: data.ownPrice.collectDate || '',
                reportLocation: data.ownPrice.collectAddress || '',
                auditStatus: this.mapPriceStatus(data.ownPrice.priceStatus) || '',
                points: this.mapPointsData(data.ownPrice.points || []),
              };
            }

            await this.processAllFiles();
          } else {
            this.$message.error(res.retMsg || '获取详情数据失败');
          }
        })
        .catch((e) => {
          this.loading = false;
          console.error(e);
          this.$message.error('获取详情数据失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 映射状态码到文本
    mapPriceStatus(status) {
      const statusMap = {
        '0': '待提交',
        '1': '待认领',
        '2': '待采价',
        '3': '采价中',
        '4': '待审核',
        '5': '已完成',
      };
      return statusMap[status] || status;
    },

    // 映射采价点数据
    mapPointsData(points) {
      return points.map((point) => {
        const priceData = this.mapSpecsToTableData(point.specsVoList || []);

        return {
          name: point.stallName || '',
          adminRegion: point.areaName || '',
          address: point.collectAddress || '',
          pointType: point.stallTypeName || '',
          pointAffiliation: point.stallVestName || '',
          contactPerson: point.linkerName || '',
          contactPhone: point.linkerMobile || '',
          majorCategory: point.varietyName || '',
          minorCategory: point.categoryName || '',
          priceDate: point.collectDate || '',
          priceFiles: point.priceFiles || [],
          collectFiles: point.collectFiles || [],
          priceData: priceData,
        };
      });
    },

    // 将specsVoList转换为表格所需的数据格式
    mapSpecsToTableData(specsVoList) {
      if (!specsVoList || specsVoList.length === 0) {
        return [];
      }

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

    // 判断文件是否为图片
    isImageFile(fileSuffix) {
      if (!fileSuffix) return false;
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      return imageExtensions.includes(fileSuffix.toLowerCase());
    },

    // 判断文件是否为视频
    isVideoFile(fileSuffix) {
      if (!fileSuffix) return false;
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
      return videoExtensions.includes(fileSuffix.toLowerCase());
    },

    isDocumentFile(fileSuffix) {
      if (!fileSuffix) return false;
      const docExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
      return docExtensions.includes(fileSuffix.toLowerCase());
    },
    errorHandler(err) {
      console.log(err);
    },
    // 处理文件点击事件
    handleFileClick(file) {
      console.log(file, env[import.meta.env.MODE].imageUrl);
      if (file.fileSuffix && file.fileSuffix.toLowerCase() === 'pdf') {
        this.downloadFile(file.fileUrl, file.fileName);
      } else if (this.isDocumentFile(file.fileSuffix)) {
        // 对于文档类型，直接下载
        this.downloadFile(file.fileUrl, file.fileName);
      } else {
        // 其他类型文件
        this.viewFile(file.fileUrl);
      }
    },

    // 查看文件（在新标签页打开）
    viewFile(url) {
      if (url) {
        window.open(url, '_blank');
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

    goBack() {
      this.$router.back();
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

.sub-section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 14px;
  font-weight: bold;
  margin: 24px 0 16px 0;
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

.credentials-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.credential-item {
  width: 120px;
  height: 120px;
  position: relative;
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
  cursor: pointer;
}

.credential-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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
  cursor: pointer;
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

.video-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  .downVideo {
    height: 20px;
    position: absolute;
    right: 0;
    top: 0px;
    color: red;
    font-size: 20px;
    z-index: 999;
  }
}

.video-icon {
  font-size: 30px;
  margin-bottom: 10px;
  color: #666;
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

.pricing-images-section {
  margin-top: 24px;
}

.back-button-container {
  display: flex;
  justify-content: center;
  position: sticky;
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