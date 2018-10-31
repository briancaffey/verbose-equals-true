<template>
  <div>
    <div v-if="isAuthenticated">
      <feed-item v-for="(feed, index) in fakeFeed" :key="index" :feed="feed"/>
    </div>
    <div v-if="!isAuthenticated && authStatus !== 'loading'">
      <h1>Welcome</h1>
      <p>Please login</p>
      <login/>
    </div>
  </div>
</template>

<style>
  .home {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
</style>

<script>
  import fakeFeed from './fakeFeed';
  import FeedItem from './feedItem.vue';
  import { mapGetters } from 'vuex';
  import Login from '@/components/login/index.vue';

  export default {
    components: {
      Login,
      FeedItem
    },
    name: 'home',
    computed: {
      ...mapGetters(['isAuthenticated', 'authStatus']),
      loading: function () {
        return this.authStatus === 'loading' && !this.isAuthenticated
      }
    },
    data () {
      return ({ fakeFeed })
    },
  }
</script>
