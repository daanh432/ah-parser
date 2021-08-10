import axios from "axios";

export default {
  namespaced: true,
  state: {
      expires_at: JSON.parse(localStorage.getItem('access_token') || '{}').expires_at || '',
      access_token: JSON.parse(localStorage.getItem('access_token') || '{}').access_token || '',
  },
  mutations: {
    setToken(state, data) {
          state.expires_at = data.expiresAt;
          state.access_token = data.accessToken;

          localStorage.setItem('access_token', JSON.stringify({expires_at: state.expires_at, access_token: state.access_token}));
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.access_token}`;
      }
  },
  actions: {
      logout({commit}) {
          commit('setToken', {expiresAt: '', accessToken: ''});
      }
  },
  getters: {
      loggedIn: state => {
          return state.access_token != '' && state.expires_at != '' && state.expires_at > new Date().getTime() / 1000
      }
  }
}