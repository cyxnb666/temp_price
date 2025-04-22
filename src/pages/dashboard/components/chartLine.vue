<template>
  <t-card title="价格趋势" class="dashboard-chart-card" :bordered="false" :loading="loading">
    <div id="monitorContainer" ref="monitorContainer" :style="{ width: '100%', height: `${resizeTime * 326}px` }"></div>
  </t-card>
</template>
  <script>
  
// import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
// import { PieChart, LineChart } from 'echarts/charts';
// import { CanvasRenderer } from 'echarts/renderers';
import * as echarts from 'echarts/core';
import { mapState } from 'vuex';

import { LAST_7_DAYS } from '@/utils/date';

import { changeChartsTheme, getChartListColor } from '@/utils/color';

// echarts.use([TooltipComponent, LegendComponent, PieChart, GridComponent, LineChart, CanvasRenderer]);

export default {
  name: 'MiddleChart',
  data() {
    return {
      LAST_7_DAYS,
      resizeTime: 1,
      currentMonth: this.getThisMonth(),
      loading: false,
    };
  },
  computed: {
    ...mapState('setting', ['brandTheme', 'mode']), // 这里需要用到主题色和主题模式的全局配置
  },
  props: {
    form: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    brandTheme() {
      changeChartsTheme([this.monitorChart]);
    },
    mode() {
      [this.monitorChart].forEach((item) => {
        item.dispose();
      });
    //   this.renderCharts();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.updateContainer();
    });

    window.addEventListener('resize', this.updateContainer, false);
    this.renderCharts();
  },

  methods: {
    getPriceTrend() {
      this.loading = true;
      let that = this;
      this.$request
        .post('/web/staticis/selectPriceTrend', { condition: { ...this.form } })
        .then((res) => {
          this.loading = false;
          console.log(res, 'res');
          if (res.retCode === 200) {
              // this.$refs.monitorContainer.removeAttribute('_echarts_instance_');
              console.log(that.setLineOptions(res.retData), 'this.monitorChart');
            //   that.monitorChart.clear();
              that.monitorChart.setOption(that.setLineOptions(res.retData), true);
          }
        })
        .catch((e) => {
          this.loading = false;
          console.log(e);
        });
    },
    setLineOptions(data) {
      const { dateTime = [], placeholderColor, borderColor } = this.$store.state.setting.chartColors;
      let setData = data.map((v) => {
        return {
          name: v.varietyName,
          data: [v.unitPrice],
          id: v.varietyId,
          type: 'line',
          smooth: false,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            borderColor,
            borderWidth: 1,
          },
          areaStyle: {
            opacity: 0.1,
          },
        };
      });
      let newArr = setData.reduce((prev, cur) => {
        //prev是新数组，cur是当前元素
        let ids = prev.map((item) => {
          return item.id;
        });
        if (ids.includes(cur.id)) {
          prev = prev.map((item) => {
            if (item.id == cur.id) {
              item.data = item.data.concat(cur.data);
            }
            return item;
          });
        } else {
          prev.push(cur);
        }
        return prev;
      }, []);
      console.log(newArr);
      const dataSet = {
        color: getChartListColor(),
        tooltip: {
          trigger: 'item',
        },
        grid: {
          left: '0',
          right: '20px',
          top: '5px',
          bottom: '36px',
          containLabel: true,
        },
        legend: {
          left: 'center',
          bottom: '0',
          orient: 'horizontal', // legend 横向布局。
          data: Array.from(new Set(data.map((v) => v.varietyName))),
          textStyle: {
            fontSize: 12,
            color: placeholderColor,
          },
        },
        xAxis: {
          type: 'category',
          data: Array.from(new Set(data.map((v) => v.collectDate))),
          boundaryGap: false,
          axisLabel: {
            color: placeholderColor,
          },
          axisLine: {
            lineStyle: {
              width: 1,
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: placeholderColor,
          },
          splitLine: {
            lineStyle: {
              color: borderColor,
            },
          },
        },
        series: newArr,
      };
      return dataSet;
    },
    /** 获取当前选中时间的短时间表达法 */
    getThisMonth(checkedValues = '') {
      let date;
      if (!checkedValues || checkedValues.length === 0) {
        date = new Date();
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      }
      date = new Date(checkedValues[0]);
      const date2 = new Date(checkedValues[1]);
      const startMonth = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
      const endMonth = date2.getMonth() + 1 > 9 ? date2.getMonth() + 1 : `0${date2.getMonth() + 1}`;

      return `${date.getFullYear()}-${startMonth}  至  ${date2.getFullYear()}-${endMonth}`;
    },
    updateContainer() {
      if (document.documentElement.clientWidth >= 1400 && document.documentElement.clientWidth < 1920) {
        this.resizeTime = (document.documentElement.clientWidth / 2080).toFixed(2);
      } else if (document.documentElement.clientWidth < 1080) {
        this.resizeTime = (document.documentElement.clientWidth / 1080).toFixed(2);
      } else {
        this.resizeTime = 1;
      }

      this.monitorChart.resize({
        // 根据父容器的大小设置大小
        width: this.monitorContainer.clientWidth,
        height: `${this.resizeTime * 326}px`,
      });
    },
    renderCharts() {
      // 资金走势
      if (!this.monitorContainer) {
        this.monitorContainer = document.getElementById('monitorContainer');
      }
      this.monitorChart = echarts.init(this.$refs.monitorContainer);
      console.log(this.monitorChart )
    //   this.monitorChart.setOption(
    //     {
    //       color: ['#0052d9', '#f582cf', '#66c9d4', '#f28884', '#4b8eda', '#2dcfd5', '#81ce4b', '#f39a7b'],
    //       tooltip: {
    //         trigger: 'item',
    //       },
    //       grid: {
    //         left: '0',
    //         right: '20px',
    //         top: '5px',
    //         bottom: '36px',
    //         containLabel: true,
    //       },
    //       legend: {
    //         left: 'center',
    //         bottom: '0',
    //         orient: 'horizontal',
    //         data: ['萝卜', '荔枝', '葡萄', '柑橘', '西瓜'],
    //         textStyle: {
    //           fontSize: 12,
    //           color: 'rgba(0, 0, 0, 0.35)',
    //         },
    //       },
    //       xAxis: {
    //         type: 'category',
    //         data: ['2025-04-16', '2025-04-17', '2025-04-19', '2025-04-21', '2025-04-22', '2025-04-23', '2025-05-16'],
    //         boundaryGap: false,
    //         axisLabel: {
    //           color: 'rgba(0, 0, 0, 0.35)',
    //         },
    //         axisLine: {
    //           lineStyle: {
    //             width: 1,
    //           },
    //         },
    //       },
    //       yAxis: {
    //         type: 'value',
    //         axisLabel: {
    //           color: 'rgba(0, 0, 0, 0.35)',
    //         },
    //         splitLine: {
    //           lineStyle: {
    //             color: '#dcdcdc',
    //           },
    //         },
    //       },
    //       series: [
    //         {
    //           name: '萝卜',
    //           data: [5.5, 1.33, 3.17, 3.33],
    //           id: '8',
    //           type: 'line',
    //           smooth: false,
    //           showSymbol: true,
    //           symbol: 'circle',
    //           symbolSize: 8,
    //           itemStyle: {
    //             borderColor: '#dcdcdc',
    //             borderWidth: 1,
    //           },
    //           areaStyle: {
    //             opacity: 0.1,
    //           },
    //         },
    //         {
    //           name: '荔枝',
    //           data: [2.08, 11, 2.5],
    //           id: '10',
    //           type: 'line',
    //           smooth: false,
    //           showSymbol: true,
    //           symbol: 'circle',
    //           symbolSize: 8,
    //           itemStyle: {
    //             borderColor: '#dcdcdc',
    //             borderWidth: 1,
    //           },
    //           areaStyle: {
    //             opacity: 0.1,
    //           },
    //         },
    //         {
    //           name: '葡萄',
    //           data: [16.67],
    //           id: '9',
    //           type: 'line',
    //           smooth: false,
    //           showSymbol: true,
    //           symbol: 'circle',
    //           symbolSize: 8,
    //           itemStyle: {
    //             borderColor: '#dcdcdc',
    //             borderWidth: 1,
    //           },
    //           areaStyle: {
    //             opacity: 0.1,
    //           },
    //         },
    //         {
    //           name: '柑橘',
    //           data: [335, 33.33],
    //           id: '5',
    //           type: 'line',
    //           smooth: false,
    //           showSymbol: true,
    //           symbol: 'circle',
    //           symbolSize: 8,
    //           itemStyle: {
    //             borderColor: '#dcdcdc',
    //             borderWidth: 1,
    //           },
    //           areaStyle: {
    //             opacity: 0.1,
    //           },
    //         },
    //         {
    //           name: '西瓜',
    //           data: [4.25],
    //           id: '7',
    //           type: 'line',
    //           smooth: false,
    //           showSymbol: true,
    //           symbol: 'circle',
    //           symbolSize: 8,
    //           itemStyle: {
    //             borderColor: '#dcdcdc',
    //             borderWidth: 1,
    //           },
    //           areaStyle: {
    //             opacity: 0.1,
    //           },
    //         },
    //       ],
    //     },
    //     true,
    //   );

    setTimeout(() => {
        this.getPriceTrend();
        
    }, 1000*2);
    },
  },
};
</script>
  <style lang="less" scoped>
.dashboard-chart-card {
  padding: 8px;

  ::v-deep .t-card__header {
    padding-bottom: 24px 0;
  }
  ::v-deep .t-t-card__body {
    padding-bottom: 24px 0;
  }
  ::v-deep .t-card__title {
    font-size: 20px;
    font-weight: 500;
  }
}
</style>