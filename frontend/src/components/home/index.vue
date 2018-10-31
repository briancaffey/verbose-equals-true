<template>
  <div>
    <div v-if="isAuthenticated">
      <h2>You are now logged in.</h2>
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
  import { mapGetters } from 'vuex';
  import Login from '@/components/login/index.vue';

  export default {
    components: {
      Login,
    },
    name: 'home',
    computed: {
      ...mapGetters(['isAuthenticated', 'authStatus']),
      loading: function () {
        return this.authStatus === 'loading' && !this.isAuthenticated
      }
    },
  }
</script>
