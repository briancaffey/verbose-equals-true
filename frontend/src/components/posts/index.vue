<template>
  <div class="home">
    <h3>Posts</h3>
    <div v-for="(post, i) in posts" :key="i">
      <h4>{{ post.title }}</h4>
      <p>{{ post.content }}</p>
    </div>
  </div>
</template>

<script>

import apiCall from '@/utils/api';

export default {
  name: 'home',
  data() {
    return {
      posts: [],
    };
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
      fetchPosts(){
          apiCall.get(
            '/api/posts',
            ).then(
          resp => {
            this.posts = resp.data
          }
      ).catch(err=>{
          console.log(err)
          console.log("Handle bad credentials here")

      })
    }
  },
};
</script>