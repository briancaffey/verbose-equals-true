<template>
  <div>
    <tech-list :data="technologies"></tech-list>
  </div>
</template>

<script>
import TechList from './TechList.vue';
import technologies from './technologies.js';
  export default {
    data() {
      return {
        technologies: technologies,
      }
    },
    components: {
      TechList
    }
  }
</script>

<style scoped>

</style>