<template>
  <div class="container">
    <tech-item
      v-for="(tech, i) in data"
      :key="i"
      :value="tech">
    </tech-item>
  </div>
</template>

<script>
/* eslint-disable */
import TechItem from './TechItem.vue';
export default {
  components: {
    TechItem,
  },
  props: {
    'data': Array,
  },
  }
</script>

<style scoped>
* {
  text-align: center;
}
</style>