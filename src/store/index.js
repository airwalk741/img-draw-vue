import { createStore } from "vuex";

export default createStore({
  state: {
    colorList: [],
  },
  mutations: {
    SET_COLORLIST: (state, payload) => {
      state.colorList = payload;
    },
  },
  actions: {},
  modules: {},
});
