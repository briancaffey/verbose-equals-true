import { TOGGLE_THEME } from '../actions/theme';

const state = {
  dark: true,
};

const getters = {
  getTheme: themeState => themeState.dark,
};

const mutations = {
  [TOGGLE_THEME]: (themeState) => {
    const theme = themeState;
    theme.dark = !themeState.dark;
  },
};

export default {
  state,
  getters,
  mutations,
};
