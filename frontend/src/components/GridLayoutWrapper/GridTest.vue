<template>
  <div class="wrapper">
    <el-button
      @click="addItem">
      Add Item
    </el-button>
    <el-button
      @click="isEditing = !isEditing">
      Toggle Edit
    </el-button>
    <grid-layout
            :layout.sync="layout"
            :col-num="12"
            :row-height="30"
            :is-draggable="true"
            :is-resizable="true"
            :is-mirrored="false"
            :vertical-compact="false"
            :margin="[10, 10]"
            :use-css-transforms="true"
    >
        <grid-item v-for="(item, i) in layout"
                  :x="item.x"
                  :y="item.y"
                  :w="item.w"
                  :h="item.h"
                  :i="item.i"
                  :key="i"
                  @resize="resizeItem"
                  @resized="resizeItem"
                  @move="resizeItem"
                  @moved="resizeItem">
          <div class="options" v-if="isEditing">

            <i 
              class="el-icon-check"
              @click="notify(item.i)">
            </i>
            <i
              class="el-icon-delete"
              @click="handleDelete(i, item.i)">
            </i>
            <i
              class="el-icon-setting"
              @click="handleConfigure(item.i)">
            </i>{{ item.i }}
            
          </div>
          <high-chart
            class="high-chart">
          </high-chart>
        </grid-item>
    </grid-layout>
  </div>
</template>

<script>
/* eslint-disable */
  import HighChart from '@/components/Charts';
  export default {
    components: {
      HighChart,
    },
    data() {
      return {
        isEditing: true,
        type:"none",
        count:1,
        layout: [
          {"x":0,"y":0,"w":2,"h":2,"i":1},
        ],
      }
    },
    methods: {
      resizeItem(){
        window.dispatchEvent(new Event('resize'));
      },
      handleDelete(i,j){
        this.layout.splice(i,1);
      },
      notify(i){
        alert("Hi " + i)
      },
      addItem(){
        this.count++;
        this.layout.push({x:0,y:0,w:2,h:2,i:this.count})
      }
    }
  }
</script>

<style scoped>



* {
  overflow: hidden;
}

.options {
  text-align: center;
  margin-top:10px;
}


.wrapper {
  width: "1000px";
}
.item {
  /* background-color: green;  */
  border: 1px black solid;
}

.el-icon-delete:hover,.el-icon-setting {
  cursor:pointer;
}
</style>