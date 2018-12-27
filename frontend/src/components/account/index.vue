<template>
  <div class="headline">
    <div>
      <h1>User Profile</h1>
    </div>
    <h2>Basic Information</h2>
    <p v-if="profile">
      <img class="avatar" :src="profile.avatar" />
      <p><strong>Email:</strong> {{profile.email}}
      <p><strong>Username:</strong> {{ profile.username }}
      <p><strong>User ID:</strong> {{ profile.pk }}
    </p>
    <h2>Roles</h2>
    <div>
      <el-tag
        size="medium"
        :disable-transitions="true"
        v-if="profile.is_superuser"
        type="success">
        Super User
      </el-tag>
      <el-tag
        size="medium"
        :disable-transitions="true"
        v-if="profile.is_staff"
        type="warning">
        Staff
      </el-tag>
      <el-tag
        size="medium"
        :disable-transitions="true"
        v-if="profile.is_active"
        type="info">
        Active
      </el-tag>
    </div>
    <h3>About Roles</h3>
    <ul>
      <li><b>Super Users</b> have full permissions</li>
      <li><b>Staff Users</b> can access the admin interfaces and can be granted specific per model permissions</li>
      <li><b>Active Users</b> active users can authenticate, but do not have access to the Django Admin interface</li>
    </ul>
  </div>
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex'

export default {
    name: 'account',
    computed: mapState({profile: state => state.user.profile})
  }
</script>

<style lang="scss" scoped>
  .headline{
    width: 90%;
  }
  .el-tag {
    margin-right: 5px;
  }

  .avatar {
    border-radius: 50%;
    height: 75px;
    background-color: beige;
  }
</style>