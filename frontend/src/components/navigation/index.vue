<template>
  <div>
    <el-menu
      :router="true"
      class="el-menu-demo"
      mode="horizontal"
      :default-active="activeLink">
      <el-menu-item
        route="/"
        index="/">
        Home
      </el-menu-item>
      <el-submenu
        index="1">
        <template
          slot="title">
          About
        </template>
        <el-menu-item
          route='/about'
          index='/about'>
          What is this project?
        </el-menu-item>
        <el-menu-item
          route='/about/technologies'
          index='/about/technologies'>
          Technologies used
        </el-menu-item>
        <el-menu-item
          route='/about/architecture'
          index='/about/architecture'>
          Architecture overview
        </el-menu-item>
      </el-submenu>
      <el-menu-item
        v-if="isAuthenticated"
        index="/account"
        route="/account">
        Account
      </el-menu-item>
      <el-menu-item
        v-if="isAuthenticated"
        index="/posts"
        route="/posts">
        Posts
      </el-menu-item>
      <el-menu-item
        route="/"
        index="logout"
        @click="logout"
        style="float:right;"
        v-if="isAuthenticated">
        Logout
      </el-menu-item>
      <el-menu-item
        index="/login"
        route="/login"
        style="float: right;"
        v-if="!isAuthenticated && !authLoading">
        Login
      </el-menu-item>
      <el-menu-item
        index="/debug"
        route="/debug"
        style="float: right;"
        v-if="isAuthenticated">
        Debug
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>

</style>

<script>
/* eslint-disable */
import { mapGetters, mapState } from 'vuex'
  import { AUTH_LOGOUT } from '@/store/actions/auth'

  export default {
    name: 'navigation',
    data() {
      return {
        activeLink: null,
      }
    },
    watch: {
      $route (to, from) {
        this.activeLink = to.path;
      }
    },
    methods: {
      logout: function () {
        this.$store.dispatch(AUTH_LOGOUT).then(() => this.$router.push('/login'));
        location.reload(true);
      }
    },
    mounted: function(){
      this.activeLink = this.$route.path;
    },
    computed: {
      ...mapGetters(['getProfile', 'isAuthenticated', 'isProfileLoaded']),
      ...mapState({
        authLoading: state => state.auth.status === 'loading',
      })
    },
  }
</script>
