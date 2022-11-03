<template>
  <div class="label-card-container">
    <a-card v-for="(item, index) in rectList" :key="index">
      <div class="delete">
        <div class="card-color" :style="`background-color: ${item[0]}`"></div>
        <span class="delete-icon" @click="removeRect(item[5])">X</span>
      </div>

      <a-card-grid style="width: 50%; text-align: center" :hoverable="false">
        <p>{{ item[1] }}</p>
        <p>{{ item[2] }}</p>
      </a-card-grid>
      <a-card-grid style="width: 50%; text-align: center" :hoverable="false"
        ><p>{{ item[3] }}</p>
        <p>{{ item[2] }}</p></a-card-grid
      >
      <a-card-grid style="width: 50%; text-align: center" :hoverable="false"
        ><p>{{ item[1] }}</p>
        <p>{{ item[4] }}</p></a-card-grid
      >
      <a-card-grid style="width: 50%; text-align: center" :hoverable="false"
        ><p>{{ item[3] }}</p>
        <p>{{ item[4] }}</p></a-card-grid
      >
    </a-card>
  </div>
</template>

<script>
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
export default {
  props: {
    myList: {
      type: Array,
    },
  },
  emits: ["removeRect"],
  setup(props, { emit }) {
    const store = useStore();
    const colorList = computed(() => store.state.colorList);

    const rectList = computed(() => props.myList);

    const removeRect = (id) => {
      emit("removeRect", id);
    };

    return {
      rectList,
      colorList,
      removeRect,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/label.scss";
</style>
