<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <h3>Posts</h3>
    <div v-for="(post, i) in posts" :key="i">
      <h4>{{ post.title }}</h4>
      <p>{{ post.content }}</p>
    </div>
  </div>
</template>

<script>
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
    fetchPosts() {
      fetch('/api/posts/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((json) => {
              this.posts = json;
            });
          }
        });
    },
  },
};
</script>
