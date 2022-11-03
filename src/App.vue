<template>
  <router-view />
</template>

<script>
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();

    const makeColor = () => {
      const color = [];
      for (let i = 0; i < 50; i++) {
        while (true) {
          /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
          const r = parseInt(Math.random() * 255);
          const g = parseInt(Math.random() * 255);
          const b = parseInt(Math.random() * 255);
          const candidate = `rgba(${r}, ${g}, ${b})`;
          if (!color.includes(candidate)) {
            color.push(candidate);
            break;
          }
        }
      }

      store.commit("SET_COLORLIST", color);
    };

    makeColor();

    return {};
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
