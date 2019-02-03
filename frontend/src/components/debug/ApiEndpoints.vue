<template>
  <div>
    <h2>API Endpoints</h2>
    <el-table
      border
      :data="endpoints">
      <el-table-column
        label="URL"
        prop="url">
        <template slot-scope="scope">
          <a :href="scope.row.url">
            <el-tag
              class="link-display"
              :disable-transitions="true">
              {{ scope.row['url-display'] }}
            </el-tag>
          </a>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="Description">
      </el-table-column>
      <el-table-column
        prop="name"
        label="Name">
      </el-table-column>
      <el-table-column
        width="100"
        prop="status"
        label="status">
        <template slot-scope="scope">
          <el-tag
            :disable-transitions="true"
            :type="scope.row.type">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        width="100"
        prop="method"
        label="Method">
        <template slot-scope="scope">
          <el-tag
            :disable-transitions="true"
            :type="scope.row.method == 'GET' ? 'info': 'warning'">
            {{ scope.row.method }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import endpoints from './apiEndpoints';

export default {
  data() {
    return {
      endpoints,
    };
  },
};
</script>

<style scoped>
.link-display {
  font-family: Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
</style>
