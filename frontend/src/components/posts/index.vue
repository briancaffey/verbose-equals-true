<template>
  <div class="home">
    <h3>Posts</h3>
    <el-table
      :data="posts"
      style="width: 100%">
      <el-table-column
        prop="title"
        label="Title"
        width="180">
      </el-table-column>
      <el-table-column
        prop="content"
        label="Content"
        width="180">
      </el-table-column>
      <el-table-column
        prop="created_at"
        label="Content"
        width="180">
      </el-table-column>
    </el-table>
    <el-pagination
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
      posts: [],
      count: 0,
      listQuery: {
        page: 5,
      }
    };
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
    change_page(){
      this.fetchPosts();
    },
    fetchPosts() { apiCall.get(
        '/api/posts', {
          params: {
            offset: (this.listQuery.page - 1) * 10,
          }
        }
      ).then(
        resp => {
          this.posts = resp.data.results
          this.count = resp.data.count
        }
      ).catch(err => {
        console.log(err);
        console.log('Handle bad credentials here');
    });
    },
  },
};
</script>
