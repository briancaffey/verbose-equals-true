<template>
  <div class="navigation">
    <div class="mini-nav-bar">
      <div class="logo-wrapper">
        <div
          :class="getIconMenuClass">
          <i
            class="el-icon-menu"
            @click="clickMenuIcon">
          </i>
        </div>
        <tt
          :class="{ dark : !$store.getters.getTheme }"
          @click="showMiniNav = !showMiniNav"
          >verbose = true
        </tt>
      </div>
      <br/>
      <el-menu
        @select="miniNavClicked"
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
        <li
          class="theme-switch-mini"
          style="width: 100%;">
          <el-tooltip content="Toggle Theme" placement="bottom">
            <el-switch
              v-model="dark"
              @change="toggleTheme"
              active-color="#2e426b"
              inactive-color="#2e426b"
              active-value="100"
              inactive-value="0">
            </el-switch>
          </el-tooltip>
        </li>
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
          route="/posts"
          index="/posts">
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
          route="/login"
          index="/login"
          style="float: right;"
          v-if="!isAuthenticated && !authLoading">
          Login
        </el-menu-item>
        <el-menu-item
          style="float: right;"
          index="/docs"
          route="/docs">
          Docs
        </el-menu-item>
        <el-menu-item
          style="float: right;"
          v-if="isAuthenticated"
          index="/account"
          route="/account">
          Account
        </el-menu-item>
        <li
          class="theme-switch"
          style="float: right;">
          <el-tooltip content="Toggle Theme" placement="bottom">
            <el-switch
              v-model="dark"
              @change="toggleTheme"
              active-color="#2e426b"
              inactive-color="#2e426b"
              active-value="100"
              inactive-value="0">
            </el-switch>
          </el-tooltip>
        </li>
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
        dark: true,
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
      miniNavClicked(i){
        console.log(i.index);
        this.showMiniNav = false;
      },
      toggleTheme(){
        this.$store.commit('TOGGLE_THEME');
      },
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
      ...mapGetters(['getProfile', 'isAuthenticated', 'isProfileLoaded', 'getTheme']),
      ...mapState({
        authLoading: state => state.auth.status === 'loading',
      }),
      getIconMenuClass(){
        return this.showMiniNav ? 'menu-open' : 'menu-closed';
      },
    },
  }
</script>

<style lang="scss" scoped>

@import '@/assets/theme-overrides.scss';

.navigation {
  width: 100%;
}

* {
  text-align: center;

}
@media screen and (max-width: 812px) {
  .nav-bar {
    display:none;
  }
}

@media screen and (min-width: 813px) {
  .mini-nav-bar {
    margin: 10px;
    display:none;
    text-align: center;
    width: 50%;
    margin-top: 20px;
  }
}

.mini-nav-bar {
  border-bottom: 1px solid rgba(128, 128, 128, 0.219);
  box-sizing: border-box;
  padding-top: 20px;
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

.dark {
  color: #2e426b;
  background-color: white;
}

.menu-open {
  font-size: 2em;
  left: 15px;
  position: absolute;
  transform: rotate(45deg);
}

.menu-closed {
  font-size: 2em;
  left: 15px;
  position: absolute;
}

.theme-switch {
    position: relative;
    top: 50%;
    transform: translateY(100%);
    margin-right: 10px;
}

.theme-switch-mini {
    position: relative;
    top: 50%;
    margin-top: 15px;
    margin-bottom: 15px;
    margin-right: 10px;
}
</style>