<template>
  <t-card title="价格趋势" class="dashboard-chart-card" :bordered="false" :loading="loading">
    <ve-line :data="chartData" :settings="chartSettings"></ve-line>
  </t-card>
</template>
  <script>
import { mapState } from 'vuex';
import * as echarts from 'echarts/core';
import { TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { BarChart, LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { LAST_7_DAYS } from '@/utils/date';

import { changeChartsTheme, getChartListColor } from '@/utils/color';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
]);
export default {
  name: 'MiddleChart',
  data() {
    this.chartSettings = {};
    return {
      LAST_7_DAYS,
      resizeTime: 1,
      currentMonth: this.getThisMonth(),
      loading: false,
      monitorChart: null,
      chartData: {
        columns: [],
        rows: [],
      },
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
    // this.$nextTick(() => {
    //   this.updateContainer();
    // });
    // window.addEventListener('resize', this.updateContainer, false);
     this.getPriceTrend();
  },

  methods: {
    getPriceTrend() {
      this.loading = true;
      let that = this;
      return new Promise((r, j) => {
        this.$request
          .post('/web/staticis/selectPriceTrend', { condition: { ...this.form } })
          .then((res) => {
              this.loading = false;
              if (res.retCode === 200 && res.retData.length > 0) {
              let data = res.retData;
              const { dateTime = [], placeholderColor, borderColor } = this.$store.state.setting.chartColors;
              let setData = data.map((v) => {
                return {
                  name: v.varietyName,
                  data: [v.unitPrice],
                  id: v.varietyId,
                  date: v.collectDate,
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
                  return item.date;
                });
                if (ids.includes(cur.date)) {
                  prev = prev.map((item) => {
                    if (item.date == cur.date) {
                      item = { ...item, ...cur, [item.name]:item.data,[cur.name]:cur.data };
                    }
                    return item;
                  });
                } else {
                  prev.push({...cur,[cur.name]:cur.data});
                }
                return prev;
              }, []);
              console.log(newArr, 'newArr');
              this.chartData = {
                columns: ['日期'].concat(Array.from(new Set(data.map((v) => v.varietyName)))),
                rows: newArr.map((v, i) => {
                  let result = {
                    日期: v.date,
                  };
                  Array.from(new Set(data.map((v) => v.varietyName))).forEach(item=>{
                      result[item] =v[item] || 0
                  })
                  return result;
                }),
              };
              console.log(this.chartData, 'chartData');
              r(that.setLineOptions(res.retData));
            }
          })
          .catch((e) => {
            this.loading = false;
            console.log(e);
          });
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
      console.log(setData, 'setData');
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
    async renderCharts() {
      // 资金走势
      if (!this.monitorContainer) {
        this.monitorContainer = document.getElementById('monitorContainer');
      }
      const { dateTime = [], placeholderColor, borderColor } = this.$store.state.setting.chartColors;
      this.monitorChart = echarts.init(this.$refs.monitorContainer);
      this.monitorChart.setOption({
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
          data: [],
          textStyle: {
            fontSize: 12,
            color: placeholderColor,
          },
        },
        xAxis: {
          type: 'category',
          data: [],
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
        series: [],
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
      });
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