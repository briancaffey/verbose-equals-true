<template>
  <div>
    <h1>Demo Users</h1>
    <el-card
      :class="{ selected: isSelected(u) }"
      v-for="(u, i) in default_users"
      @click="selectUser(u)"
      :key="i"
      style="cursor: pointer;">
      <img
        class="avatar"
        height="50px;"
        :src="u.avatar"
        :alt="u.username"
        style="display: inline; vertical-align: middle;"/>
      <el-button @click="selectUser(u)" class="login-as">Login as {{ u.username }}</el-button>
    </el-card>
  </div>
</template>

<script>
  import apiCall from '@/utils/api';
  import demo1 from '@/components/login/assets/demo1.png';
  import demo2 from '@/components/login/assets/demo2.png';
  import demo3 from '@/components/login/assets/demo3.png';
  import demo4 from '@/components/login/assets/demo4.png'

  export default {
    data() {
      return {
        selectedUser: '',
        default_users: [
          {
            username: 'andy',
            avatar: demo1,
          },
          {
            username: 'brian',
            avatar: demo2,
          },
          {
            username: 'katie',
            avatar: demo3,
          },
          {
            username: 'nancy',
            avatar: demo4,
          },
        ],
      }
    },
    methods: {
      isSelected(u){
        return u.username == this.selectedUser;
      },
      selectUser(u){
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        this.$emit('selectUser', u);
      },
    },
    computed: {
    }

  }
</script>

<style scoped>
.selected {
  border: 2px solid black;
}

.avatar {
  background-color: beige;
  border-radius: 50%;
}

.el-card {
  margin-bottom: 5px;
}

.login-as {
  float: right;
}
</style>