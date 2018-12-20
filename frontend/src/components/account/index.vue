<template>
  <div class="headline">
    <div>
      <h1>User Profile</h1>
    </div>
    <h2>Basic Information</h2>
    <p v-if="profile">
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
</style>