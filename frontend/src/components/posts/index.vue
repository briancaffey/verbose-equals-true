<template>
  <div class="home">
    <h3>Posts</h3>
    <el-table
      border
      fit
      stripe
      v-loading="loading"
      :data="posts"
      @sort-change="sortChange"
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
        sortable="custom"
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
        sortable="cusom">
      </el-table-column>
      <el-table-column
        fit
        label="Content"
        prop="content"
        sortable="custom">
      </el-table-column>
      <el-table-column
        fit
        label="Created On"
        prop="created_at"
        sortable>
        <template slot-scope="scope">
          {{ scope.row.created_at | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        fit
        label="Updated On"
        prop="updated_at"
        sortable>
        <template slot-scope="scope">
          {{ scope.row.updated_at | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        label="Actions"
        prop="id"
        width="180">
        <template slot-scope="scope">
          <div class="actions">
            <el-button
              @click="handleEdit(scope.row)"
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
    <el-dialog title="Edit Post" :visible.sync="dialogFormVisible">
      <el-form v-loading="post_form_loading" :model="form">
        <el-form-item label="Title" :label-width="formLabelWidth">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Content" :label-width="formLabelWidth">
          <el-input
            v-model="form.content"
            placeholder="Please select a zone"
            type="textarea">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="updatePost">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import apiCall from '@/utils/api';

export default {
  name: 'home',
  data() {
    return {
      post_form_loading: false,
      form: {},
      loading: true,
      posts: [],
      count: 0,
      listQuery: {
        page: 1,
      },
      ordering: [],
      dialogTableVisible: false,
      dialogFormVisible: false,
      form: {
        id: null,
        title: '',
        content: '',
      },
      formLabelWidth: '120px'
    };
  },
  mounted() {
    this.fetchPosts();
  },
  computed: {
    params: function () {
      return {
        offset: (this.listQuery.page - 1) * 10,
        ordering: this.ordering.join(','),
      };
    }
  },
  filters: {
    formatDate(d){
      const today = new Date(d);
      const time = today.toTimeString('en-US').split(' ')[0];
      const date = today.toLocaleDateString('en-US').split(' ')[0];
      return date + ' ' + time;
    }
  },
  methods: {
    updatePost(){
      apiCall.patch(`api/posts/${this.form.id}/`, {
          'title':this.form.title,
          'content':this.form.content,
        })
        .then(_ => {
          this.dialogFormVisible = false;
          this.$message(`Post ${this.form.id} updated!`)
          this.fetchPosts();
        }
      ).catch((err) => {
        console.log(err);
      })
    },
    sortChange(c){
      this.ordering = [];
      const order = c.order == 'ascending' ? '' : '-';
      const prop = c.prop;
      const newOrder = order + prop;
      this.ordering.push(newOrder);
      this.fetchPosts();
    },
    handleEdit(post){
      this.dialogFormVisible = true;
      this.form.id = post.id;
      this.form.title = post.title;
      this.form.content = post.content;
    },
    handleDelete(id){
      this.$confirm(`Delete post ${id}?`)
        .then(_ => {
          apiCall.delete(`api/posts/${id}/`)
            .then(_ => {
              this.$message(`Post ${id} deleted.`);
              this.fetchPosts();
              }
            ).catch(
              this.$message(`Post ${id} not deleted.`)
            )
          }
        )
        .catch(_ => {
          this.$message(`Post ${id} not deleted.`);
        });
      this.fetchPosts();
    },
    change_page(){
      this.fetchPosts();
    },
    fetchPosts() {
      this.loading = true;
      apiCall.get(
        '/api/posts', {
          params: this.params,
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
.el-table, .cell {
  word-break:normal !important;
}
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
