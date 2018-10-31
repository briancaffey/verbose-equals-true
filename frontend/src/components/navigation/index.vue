<template>
  <div>
    <el-menu
      :router="true"
      class="el-menu-demo"
      mode="horizontal"
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
      <el-menu-item
        route="/logout"
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
    methods: {
      logout: function () {
        this.$store.dispatch(AUTH_LOGOUT).then(() => this.$router.push('/login'));
        location.reload();
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
