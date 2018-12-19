<template>
  <div
    id="app"
    :class="{ dark: !getTheme ? true : false }">
    <navigation/>
    <div class="main-container">
      <center-container>
        <transition
          name="fade"
          mode="out-in">
          <router-view :key="$route.path"/>
        </transition>
      </center-container>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { mapGetters } from 'vuex';
import Navigation from '@/components/navigation'
import { USER_REQUEST } from '@/store/actions/user'

export default {
  components: {
    Navigation },
  name: 'app',
  computed: {
    ...mapGetters(['getTheme'])
  },
  created: function () {
    if (this.$store.getters.isAuthenticated) {
      this.$store.dispatch(USER_REQUEST)
    }
  }
}
</script>

<style lang="scss">
  .main-container {
    min-height: calc(100vh);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition-duration: 0.15s;
    transition-property: opacity;
    transition-timing-function: ease;
  }

  .fade-enter,
  .fade-leave-active {
    opacity: 0
  }

  @import './assets/theme-overrides.scss';

  .dark {
    color: $--color-font-dark;
    background-color: $--color-background-dark;

    html {
      background-color:  $--color-background-dark;
    }

    h1 {
      color: white;
    }

    .tech-title {
      color: $--color-background-dark;
    }
  }

  body {
    margin: 0;
    font-family: 'Roboto', sans-serif;
    color: $--color-font;
    background-color: $--color-background;
  }

</style>
