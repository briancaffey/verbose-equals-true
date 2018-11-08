<template>
  <div class="home">
    <h3>Posts</h3>
    <el-table
      v-loading="loading"
      fit
      stripe
      border
      :data="posts"
      max-height="500"
      style="width: 100%">
      <el-table-column
        class="selection-col"
        fixed="left"
        type="selection">
      </el-table-column>
      <el-table-column
        sortable
        fixed="left"
        prop="id"
        label="ID"
        width="100">
          <template slot-scope="scope">
            <el-button>
              {{ scope.row.id }}
            </el-button>
          </template>
      </el-table-column>
      <el-table-column
        sortable
        prop="title"
        label="Title"
        min-width="100"
        max-width="400"
        >
      </el-table-column>
      <el-table-column
        sortable
        prop="content"
        label="Content"
        fit>
      </el-table-column>
      <el-table-column
        sortable
        prop="created_at"
        label="Create On"
        fit>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="Actions"
        prop="id"
        width="180"
        >
        <template slot-scope="scope">
          <div class="actions">

          <el-button
            icon="el-icon-edit"
            type="primary"
            @click="handleEdit(scope.row.id)">
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-delete">
          </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      background
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
