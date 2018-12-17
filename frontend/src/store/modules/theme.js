import { TOGGLE_THEME } from '../actions/theme';

const state = {
  dark: true,
}

const getters = {
  getTheme: state => state.dark,
}

const mutations = {
  [TOGGLE_THEME]: (state) => {
    state.dark = !state.dark;
  }
}

export default {
  state,
  getters,
  mutations
}