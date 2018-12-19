<template>
  <div>

    <h1>Development Links</h1>
    <external-link
      v-for="(link, i) in devLinks"
      :key='"devlink"+i'
      :d="link">
    </external-link>

    <h2>Monitoring</h2>
    <external-link
      class="external-link"
      v-for="(link, i) in monitors"
      :key='"monitor"+i'
      :d="link">
    </external-link>

    <h2>API Endpoints</h2>
    <router-link to="/debug/endpoints">
      <el-button>
        View Endpoints
      </el-button>
    </router-link>

  </div>
</template>

<script>
/* eslint-disable */
import links from './links.js';
import ExternalLink from '@/components/common/ExternalLink.vue';
const devLinks = links['Development'];
const monitors = links['Monitoring'];
const commands = links['Django Commands'];
const endpoints = links['API Endpoints'];

export default {
  components: {
    ExternalLink,
  },
  data() {
    return {
      devLinks,
      monitors,
      commands,
      endpoints,
    };
  },
}
</script>

<style scoped>
* {
  text-align: center;
}
a {
  margin: 10px;
}
.external-link {
  margin-bottom: 5px;
}
</style>
