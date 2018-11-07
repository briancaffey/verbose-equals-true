<template>
  <div class="login">
    <h1>Sign In</h1>
    <el-form v-loading="loading">
      <el-input :value="username"></el-input>
      <el-input type="password" :value="password"></el-input>
      <el-button
        style="float: right;"
        type="primary"
        @click.native.prevent="login"
      >
        Login
      </el-button>
    </el-form>
  </div>
</template>

<script>
/* eslint-disable */
  import {AUTH_REQUEST} from '@/store/actions/auth'
  import { mapGetters } from 'vuex';

  export default {
    name: 'login',
    data () {
      return {
        username: 'admin',
        password: 'password',
      }
    },
    methods: {
      login: function () {
        const { username, password } = this
        this.$store.dispatch(AUTH_REQUEST, { username, password }).then(() => {
          this.$router.push('/')
        })
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'authStatus']),
      loading: function () {
        return this.authStatus === 'loading' && !this.isAuthenticated
      }
    }
  }
</script>

<style>
  .login {
    display: flex;
    flex-direction: column;
    width: 300px;
    padding: 10px;
  }
  .el-input {
    margin-bottom: 5px;
  }
</style>
