<template>
  <div>
    <h1>
      Technologies used in this project
    </h1>
    <tech-list :data="technologies"></tech-list>
  </div>
</template>

<script>
import TechList from './TechList.vue';
import technologies from './technologies';

export default {
  data() {
    return {
      technologies,
    };
  },
  components: {
    TechList,
  },
};
</script>

<style scoped>
h1 {
  text-align: center;
}
</style>
