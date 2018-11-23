<template>
  <div class="center-container">
    <slot/>
  </div>
</template>

<style scoped>
  .center-container {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
</style>


<script>
/* eslint-disable */
export default {
name: 'center-container',
}
</script>
