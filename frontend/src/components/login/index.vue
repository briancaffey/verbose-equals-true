<template>
  <div class="login">
    <h1>Sign In</h1>
      <el-alert
        v-if="badLogin"
        title="Incorrect username or password"
        type="error"
        show-icon>
      </el-alert>
    <el-form v-loading="loading">
      <el-input v-model="username"></el-input>
      <el-input type="password" v-model="password"></el-input>
      <el-button
        style="float: right;"
        type="primary"
        @click.native.prevent="login"
        ref="login"
        id="login"
      >
        Login
      </el-button>
    </el-form>
    <demo-users @selectUser="changeDemoUser"></demo-users>
  </div>
</template>

<script>
/* eslint-disable */
  import {AUTH_REQUEST} from '@/store/actions/auth'
  import { mapGetters } from 'vuex';
  import DemoUsers from './DemoUsers.vue';

  export default {
    name: 'login',
    components: {
      DemoUsers,
    },
    data () {
      return {
        username: '',
        password: '',
      }
    },
    methods: {
      changeDemoUser(u){
        console.log('hmm');
        this.username = u.username;
        this.password = process.env.VUE_APP_DEMO_PASSWORD;
        document.getElementById('login').click();
      },
      login: function () {
        const { username, password } = this
        this.$store.dispatch(AUTH_REQUEST, { username, password }).then(() => {
          this.$router.push('/account')
        })
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'authStatus', 'badLogin']),
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

  .el-alert {
    margin-bottom: 5px;
  }
</style>
