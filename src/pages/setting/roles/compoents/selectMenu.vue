<template>
  <t-tabs v-model="tab">
    <t-tab-panel value="web" label="后台系统">
      <t-tree
        ref="tree"
        v-model="webChecked"
        :data="items"
        :keys="treeKeys"
        :checkable="checkable"
        :check-strictly="checkStrictly"
        :value-mode="valueMode"
        hover
        expand-all
        :onChange="onChange"
        @change="selectNode"
      />
    </t-tab-panel>
    <!-- <t-tab-panel value="mini" label="小程序"> </t-tab-panel> -->
  </t-tabs>
</template>
<script>
export default {
  data() {
    return {
      tab: 'web',
      miniChecked: [],
      items: [],
      webChecked:[],
      treeKeys: {
        value: 'menuId',
        label: 'menuName',
        children: 'children',
      },
      valueMode: 'all',
      checkable: true,
      checkStrictly: false,
    };
  },
  created() {
    this.getMenus();
  },
  props:{
    value:{
      type:Array,
      default:()=>[]
    }
  },
  model: {
    prop: 'value',
    event: 'updateValue'
  },
  watch:{
    value(newVal){
      console.log(newVal)
      this.webChecked = this.value
    }
  },
  methods: {
    clearTree(){
        this.webChecked = []
    },
    getMenus() {
      this.$request.get('/web/menu/getMenuList').then((res) => {
        if (res.retCode === 200) {
          this.items = res.retData;
        }
      });
    },
    onChange(value,context){
    },
    selectNode(value,context) {
        this.$emit('updateValue',value)
    },
  },
};
</script>