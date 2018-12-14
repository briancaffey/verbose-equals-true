<template>
  <a :href="d.link" target="_blank">
    <el-button :type="d.type" round>{{ d.name }}</el-button>
  </a>
</template>

<script>
/* eslint-disable */
export default {
  name: 'external-link',
  props: {
    d: Object
  },
}
</script>

<style scoped>
a {
  text-decoration: none;
  margin: 10px;
}

.el-button {
  margin-bottom: 5px;
}
</style>