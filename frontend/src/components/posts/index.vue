<template>
  <div class="home">
    <h3>Posts</h3>
    <el-table
      border
      fit
      max-height="500"
      stripe
      v-loading="loading"
      :data="posts"
      style="width: 100%">
      <el-table-column
        class="selection-col"
        fixed="left"
        type="selection">
      </el-table-column>
      <el-table-column
        fixed="left"
        label="ID"
        prop="id"
        sortable
        width="100">
          <template slot-scope="scope">
            <el-button>
              {{ scope.row.id }}
            </el-button>
          </template>
      </el-table-column>
      <el-table-column
        label="Title"
        prop="title"
        max-width="400"
        min-width="100"
        sortable>
      </el-table-column>
      <el-table-column
        fit
        label="Content"
        prop="content"
        sortable>
      </el-table-column>
      <el-table-column
        fit
        label="Create On"
        prop="created_at"
        sortable>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="Actions"
        prop="id"
        width="180">
        <template slot-scope="scope">
          <div class="actions">
            <el-button
              @click="handleEdit(scope.row.id)"
              icon="el-icon-edit"
              type="primary">
            </el-button>
            <el-button
              @click="handleDelete(scope.row.id)"
              icon="el-icon-delete"
              type="danger">
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      class="pagination"
      @current-change="change_page"
      :current-page.sync="listQuery.page"
      layout="prev, pager, next"
      :total="count">
    </el-pagination>
  </div>
</template>

<script>
/* eslint-disable */
import apiCall from '@/utils/api';

export default {
  name: 'home',
  data() {
    return {
      loading: true,
      posts: [],
      count: 0,
      listQuery: {
        page: 1,
      }
    };
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
    handleEdit(id){
      this.$message(`Edit post ${id}`);
      this.fetchPosts();
    },
    change_page(){
      this.fetchPosts();
    },
    fetchPosts() {
      this.loading = true;
      apiCall.get(
        '/api/posts', {
          params: {
            offset: (this.listQuery.page - 1) * 10,
          }
        }
      ).then(
        resp => {
          this.posts = resp.data.results;
          this.count = resp.data.count;
          this.loading = false;
        }
      ).catch(err => {
        console.log(err);
        console.log('Handle bad credentials here');
    });
    },
  },
};
</script>

<style>
.actions{
  text-align: center;
}

.home {
  width: 90%
}

.pagination {
  margin-top:20px
}

.selection-col {
  text-align: center;
}
</style>

