<template>
  <div class="docs">
    <h1>Documentation</h1>
    <div v-if="devMode">
      <p>This project uses VuePress for documentation.</p>
      <a href="http://localhost:8085/docs">
        <el-button
          >View Documentation <i class="el-icon-info"></i>
        </el-button>
      </a>
    </div>
    <div v-else>
      <a href="/docs">
        <el-button
          >View Documentation <i class="el-icon-info"></i>
        </el-button>
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    computed: {
      devMode: function(){
        return process.env.NODE_ENV === 'development';
      }
    },
  }
</script>

<style scoped>
* {
  text-align: center;
}
.docs {
  width: 90%;
}
</style>