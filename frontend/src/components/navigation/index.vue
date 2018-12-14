<template>
  <div>
    <div class="mini-nav-bar">
      <div class="logo-wrapper">
        <i
          class="el-icon-menu"
          @click="clickMenuIcon">
        </i>
        <tt
          @click="showMiniNav = !showMiniNav"
          >verbose = true
        </tt>
      </div>
      <br/>
      <el-menu
        v-show="showMiniNav"
        :router="true"
        mode="vertical"
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
          index="/posts"
          route="/posts">
          Posts
        </el-menu-item>
        <el-menu-item
          index="/login"
          route="/login"
          v-if="!isAuthenticated && !authLoading">
          Login
        </el-menu-item>
        <el-menu-item
          v-if="isAuthenticated"
          index="/account"
          route="/account">
          Account
        </el-menu-item>
        <el-submenu
          v-if="isAuthenticated"
          index="development">
          <template
            slot="title">
            Development
          </template>
          <el-menu-item
            route='/debug/links'
            index='/debug/links'>
            Debug Links
          </el-menu-item>
          <el-menu-item
            route='/debug/endpoints'
            index='/debug/endpoints'>
            API Endpoints
          </el-menu-item>
        </el-submenu>
        <el-menu-item
          route="/"
          index="logout"
          @click="logout"
          v-if="isAuthenticated">
          Logout
        </el-menu-item>
      </el-menu>
    </div>
    <div class="nav-bar">
      <el-menu
        :router="true"
        mode="horizontal"
        :default-active="activeLink">
        <el-menu-item
          route="/"
          index="/">
          <tt style="font-size: 1.2em;"
          >verbose = true
        </tt>
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
          style="float: right;"
          index="/documentation"
          route="/documentation">
          Documentation
        </el-menu-item>
        <el-menu-item
          style="float: right;"
          v-if="isAuthenticated"
          index="/account"
          route="/account">
          Account
        </el-menu-item>
        <el-submenu
          v-if="isAuthenticated"
          index="development">
          <template
            slot="title">
            Dev
          </template>
          <el-menu-item
            route='/debug/links'
            index='/debug/links'>
            Debug Links
          </el-menu-item>
          <el-menu-item
            route='/debug/endpoints'
            index='/debug/endpoints'>
            API Endpoints
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { mapGetters, mapState } from 'vuex'
  import { AUTH_LOGOUT } from '@/store/actions/auth'

  export default {
    name: 'navigation',
    data() {
      return {
        activeLink: null,
        showMiniNav: false,
      }
    },
    watch: {
      $route (to, from) {
        this.activeLink = to.path;
      }
    },
    methods: {
      clickMenuIcon: function(){
        this.showMiniNav = !this.showMiniNav;
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      },
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

<style scoped>
* {
  text-align: center;

}
@media screen and (max-width: 480px) {
  .nav-bar {
    display:none;
  }
}

@media screen and (min-width: 481px) {
  .mini-nav-bar {
    margin: 10px;
    display:none;
    text-align: center;
    width: 50%;
    margin-top: 20px;
  }
}

.mini-nav-bar {
  margin-top: 20px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.219);
  box-sizing: border-box;
}

.mini-nav-bar > ul {
  width: 100%;
}

tt {
  text-align:center;
  font-size: 2em;
  color: white;
  background-color: #2e426b;
  border-radius:3px;
  padding-left: 4px;
  padding-right: 4px;
}

.el-icon-menu {
  font-size: 2em;
  left: 15px;
  position: fixed;
}
</style>