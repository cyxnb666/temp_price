<template>
  <div style="width: 100%">
    <div class="search_box">
      <!-- 搜索： -->
      <!-- <t-select
        v-model="keywords"
        filterable
        placeholder="请输入关键词"
        :onSearch="remoteMethod"
        :loading="loading"
        :clearable="true"
        valueType="object"
        :keys="selectKeys"
        :options="options"
        @change="currentSelect"
        style="width: 100%"
      >
        <template #valueDisplay="{ value }">{{ value }}</template>
      </t-select> -->
      <transition name="el-zoom-in-top">
        <div id="panel" v-if="searchData.length > 0">
          <div class="item_word" v-for="(item, index) in searchData" :key="index" @click="handlemapkeywordbtn(item)">
            {{ item.name }}
          </div>
        </div>
      </transition>
    </div>
    <div ref="gaode_Map" id="gaode_Map"></div>
  </div>
</template>
<script>
import AMapLoader from '@amap/amap-jsapi-loader'; //引入AMapLoader
const env = import.meta.env.MODE || 'development';
import proxy from '@/config/host';

window._AMapSecurityConfig = {
  // 设置安全密钥
  securityJsCode: proxy[env].SecurityJsCode,
};
export default {
  components: {},
  props: [],
  data() {
    return {
      keywords: '',
      options: [],
      loading: false,
      visible: false,
      searchData: [],
      isDetail: false,
      dataForm: {
        kqName: undefined,
        kqLocation: undefined,
        kqLongitude: undefined,
        kqLatitude: undefined,
        kqWorkUnit: undefined,
        cronkqAccredit: [],
        kqValidCardRange: undefined,
      },
      rules: {},
      input: '',
      map: null,
      auto: null,
      placeSearch: null,
      AutoComplete: null,
      lnglat: [],
      markers: [],
      position: {},
      address: {},
      selectKeys: {
        value: 'location',
        label: 'name',
      },
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    // this.initMap();
  },
  methods: {
    // 地图初始化
    initMap(lng, lat) {
      let that = this;
      let centerLen = [116.397428, 39.90923];
      AMapLoader.load({
        key: proxy[env].AMAPKEY, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Geocoder', 'AMap.Geolocation'],
      })
        .then((AMap) => {
          this.map = new AMap.Map('gaode_Map', {
            // 设置地图容器id
            viewMode: '3D', //  是否为3D地图模式
            zoom: 18, // 初始化地图级别
            // center: Center, //中心点坐标
            resizeEnable: true,
          });
          var geolocation = new AMap.Geolocation({
            //使用web浏览器进行精准定位，并返回定位结果；
            //注：下面的配置信息，可以去除谷歌定位默认的定位小圆圈；
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 10000, //超过10秒后停止定位，默认：无穷大
            maximumAge: 0, //定位结果缓存0毫秒，默认：0
            convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: true, //显示定位按钮，默认：true
            buttonPosition: 'LB', //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: false, //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: false, //定位成功后用圆圈表示定位精度范围，默认：true  （去掉圆形区域）
            panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy: false, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          });
          this.map.addControl(geolocation);
          if (lng && lat) {
            console.log(new AMap.LngLat(lng, lat).toArray());
            let centerLen = new AMap.LngLat(lng, lat).toArray();
            that.map.setCenter(centerLen);
            that.setMarker(centerLen);
          } else {
            geolocation.getCurrentPosition(function (status, result) {
              if (status == 'complete') {
                that.map.setCenter(new AMap.LngLat(result.position.lng, result.position.lat));
                that.setMarker(new AMap.LngLat(result.position.lng, result.position.lat));
              } else {
                that.map.setCenter(new AMap.LngLat(result.position.lng, result.position.lat));
              }
            });
          }
          // geolocation.getCurrentPosition(function (status, result) {
          //   if (status == 'complete') {
          //     that.map.setCenter(new AMap.LngLat(result.position.lng, result.position.lat));
          //   } else {
          //     that.map.setCenter(new AMap.LngLat(result.position.lng, result.position.lat));
          //   }
          // });
          //可代替上方getCurrentPosition
          //geolocation.getCurrentPosition();
          //AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
          //AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
          // 关键字查询
          this.searchMap();
          // 监听鼠标点击事件
          this.map.on('click', this.clickMapHandler);
          // 搜索提示插件
          this.AutoComplete = new AMap.AutoComplete({ city: '全国' });
        })
        .catch((e) => {});
    },
    // 搜索地址
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.AutoComplete.search(query, (status, result) => {
            console.log(result);
            this.$emit('setLocationOprions',result.tips)
            this.options = result.tips;
          });
        }, 200);
      } else {
        this.options = [];
      }
    },
    // 选中提示
    currentSelect(val) {
      console.log(val, 'val');
      // 清空时不执行后面代码
      if (!val) {
        return;
      }
      // 自动适应显示想显示的范围区域
      this.map.setFitView();
      //清除marker
      if (this.searchMarker) {
        this.map.remove(this.searchMarker);
      }
      //设置marker
      this.searchMarker = new AMap.Marker({
        map: this.map,
        position: [val.location.lng, val.location.lat],
      });

      this.keywords = val.name;
      //定位
      this.lnglat = [val.location.lng, val.location.lat];
      this.map.setCenter(this.lnglat);
      this.setMarker(this.lnglat);
      this.position = {
        longitude: val.location.lng,
        latitude: val.location.lat,
        address: val.name,
      };
      this.$emit('updateValue', this.position);
    },
    // 关键字查询
    searchMap() {
      // 搜索框自动完成类
      this.auto = new AMap.AutoComplete({
        input: 'tipinput', // 使用联想输入的input的id
      });
      //构造地点查询类
      this.placeSearch = new AMap.PlaceSearch({
        map: this.map,
      });
      this.placeSearch.search(this.map, (status, result) => {
        console.log(status, result);
      });
      // 当选中某条搜索记录时触发
      this.auto.on('select', this.selectSite);
    },
    //选中查询出的记录
    selectSite(e) {
      if (e.poi.location) {
        // this.lnglat = [e.poi.location.lng, e.poi.location.lat];
        this.placeSearch.setCity(e.poi.adcode);
        this.placeSearch.search(e.poi.name); //关键字查询
        let geocoder = new AMap.Geocoder({});
        let that = this;
        geocoder.getAddress(this.lnglat, function (status, result) {
          if (status === 'complete' && result.regeocode) {
            that.province = result.regeocode.addressComponent.province;
            that.city = result.regeocode.addressComponent.city;
            //自己想要赋的值，根据自己的做修改
            that.$set(that.form, 'province', that.province);
            that.$set(that.form, 'city', that.city);
            that.$set(that.form, 'address', e.poi.name);
            that.$set(that.form, 'coordinate', e.poi.location.lng + ',' + e.poi.location.lat); //纬度，经度
          } else {
          }
        });
      } else {
        this.$message.error('查询地址失败，请重新输入地址');
      }
    },
    // 点击地图事件获取经纬度，并添加标记
    clickMapHandler(e) {
      this.dataForm.kqLongitude = e.lnglat.getLng();
      this.dataForm.kqLatitude = e.lnglat.getLat();
      this.lnglat = [e.lnglat.getLng(), e.lnglat.getLat()];
      this.setMarker(this.lnglat);
      // 点击地图上的位置，根据经纬度转换成详细地址
      let geocoder = new AMap.Geocoder({});
      let that = this;
      geocoder.getAddress(this.lnglat, function (status, result) {
        console.log(result);
        if (status === 'complete' && result.regeocode) {
          that.address = result.regeocode.formattedAddress;
          that.position = {
            longitude: e.lnglat.getLng(),
            latitude: e.lnglat.getLat(),
            address: that.address,
          };
        } else {
          that.position = {
            longitude: e.lnglat.getLng(),
            latitude: e.lnglat.getLat(),
            address: that.address,
          };
        }
        that.$emit('updateValue', that.position);
        that.input = that.address; //把查询到的地址赋值到输入框
      });
    },
    //  添加标记
    setMarker(lnglat) {
      this.removeMarker();
      let marker = new AMap.Marker({
        position: lnglat,
      });
      marker.setMap(this.map);
      this.markers.push(marker);
    },
    // 删除之前后的标记点
    removeMarker() {
      if (this.markers) {
        this.map.remove(this.markers);
      }
    },
  },
};
</script>
<style lang="less" scoped>
#gaode_Map {
  overflow: hidden;
  width: 100%;
  height: 500px;
  margin: 0;
}
</style>