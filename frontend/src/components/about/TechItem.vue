<template>
<span>
<el-dialog
  :visible.sync="dialogFormVisible"

  width="90%"
  custom-class="modal">
  <span slot="title" class="dialog-footer">
    <span style="font-size:3em;"><b>{{ value.name }}</b></span><br />
    <span class="tech-desc" style="font-size:2em;">{{ value.desc }}</span>
  </span>
  <img :class="value.class + ' modal-img'" :src="image"/>
  <span slot="footer" class="dialog-footer">
    <a :href="value.link" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">
        <a class="link" :href="value.link">{{ value.link }}</a>
      </el-button>
    </a>
  </span>
</el-dialog>
  <a @click="dialogFormVisible = true" class="tech-item">
    <img :class="value.class + ' main'" :src="image"/>
  </a>
</span>
</template>

<script>
/* eslint-disable */
export default {
  data() {
    return {
      dialogFormVisible: false,
    }
  },
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

.modal-img {
  max-width: 200px;
  min-width: 199px;
  margin: 0px;
}

.tech-item {
  display: inline;
  cursor: pointer;
}
.wide {
  max-width: 300px;
  min-width: 299px;
}
.modal {
  width: 90%;
  color: red;
  max-width: 600px;
}

span.tech-desc {
  margin-top: 7px;
}

.link {
  text-decoration: none;
  color: #2e426b
}
.dialog-footer {
  text-align: center;
}

.el-dialog__footer {
  background-color: red;
  text-align: center !important;
}
</style>