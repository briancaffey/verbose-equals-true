<template>
  <a :href="value.link" class="tech-item">
    <img :class="value.class" :src="image"/>
  </a>
</template>

<script>
/* eslint-disable */
export default {
  props: { value: Object },
  computed: {
    image: function() {
      const img = require(
        `./assets/${this.value.image}`
      )
      return img
    }
  }
}
  
</script>

<style scoped>
img {
  max-width: 200px;
  min-width: 199px;
  vertical-align: middle;
  margin: 20px;
}

.tech-item {
  display: inline;
}
.wide {
  max-width: 300px;
  min-width: 299px;
}
</style>