<template>
  <div class="about">
    <h1>
      About this project
    </h1>
    <p>This is an open-source project that demonstrates
      the use of several popular web technologies and focuses on
      <b>thorough explanations</b>, hence the name
      <tt>verbose equals true</tt>.</p>
    <p>I have been using this website to document and share my
      progress in three areas of software development: frontend
      engineering, backend engineering and DevOps. While there
       are numerous guides on the technologies I use here, there
       are fewer guides for how the technologies can by used
       <i>together</i>.</p>
    <p>For a visual overview of this project, see
      the architecture overview.</p>

    <router-link class="link" to="/about/architecture/">
      <el-button>Architecture Overview</el-button>
    </router-link>
    <p>For an in-depth description of this project, see the documentation:</p>

    <router-link class="link" to="/documentation/">
      <el-button>Project Documentation</el-button>
    </router-link>
  </div>
</template>

<script>
/* eslint-disable max-len */
export default {

};
</script>

<style scoped>
.about {
  width: 100%;
}
tt {
  color: white;
  background-color: #2e426b;
  border-radius:3px;
  padding-left: 4px;
  padding-right: 4px;
}

</style>
