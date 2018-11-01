<template>
  <div>
    <el-menu
      :router="true"
      class="el-menu-demo"
      mode="horizontal"
      :default-active="activeIndex"
    >
      <el-menu-item
        route="/"
        index="home"
      >
      Home
      </el-menu-item>
      <el-menu-item
        v-if="isAuthenticated"
        index="account"
        route="/account"
      >
      Account
      </el-menu-item>
      <el-menu-item
        v-if="isAuthenticated"
        index="posts"
        route="/posts"
      >
      Posts
      </el-menu-item>
      <el-submenu
        index="4"
        v-if="isAuthenticated">
        <template slot="title">Mock</template>
        <el-menu-item
          v-if="isAuthenticated"
          index="4-1"
          route="/mock/price-comparison">
          Price Comparison
        </el-menu-item>
        <el-menu-item
          v-if="isAuthenticated"
          index="4-2"
          route="/mock/file-upload">
          File Upload
        </el-menu-item>
      </el-submenu>
      <el-menu-item
        route="/"
        index="logout"
        @click="logout"
        style="float:right;"
        v-if="isAuthenticated"
      >
      Logout
      </el-menu-item>
      <el-menu-item
        index="login"
        route="/login"
        style="float: right;"
        v-if="!isAuthenticated && !authLoading"
      >
      Login
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>

</style>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { AUTH_LOGOUT } from '@/store/actions/auth'

  export default {
    name: 'navigation',
    data() {
      return {
        activeIndex: "home"
      }
    },
    methods: {
      logout: function () {
        this.$store.dispatch(AUTH_LOGOUT).then(() => this.$router.push('/'));
        this.activeIndex = "home"
      }
    },
    computed: {
      ...mapGetters(['getProfile', 'isAuthenticated', 'isProfileLoaded']),
      ...mapState({
        authLoading: state => state.auth.status === 'loading',
      })
    },
  }
</script>
