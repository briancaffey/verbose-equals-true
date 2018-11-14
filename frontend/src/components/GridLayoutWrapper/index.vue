<template>
  <div class="wrapper">
    <grid-test/>
  </div>
</template>

<script>
  import GridTest from './GridTest.vue'
  export default {
    components: {
      GridTest,
    }
  }
</script>

<style scoped>

.wrapper {
  margin:auto;
  width:90%;
}
</style>