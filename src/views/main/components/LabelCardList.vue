<template>
  <div class="label-card-container">
    <a-card
      v-for="(item, index) in rectList"
      :key="index"
      @click="selectBox(item.id)"
    >
      <div class="delete">
        <div
          class="card-color"
          :style="`background-color: ${item.color}`"
        ></div>
        <span class="delete-icon" @click="removeRect(item.id)">X</span>
      </div>

      <a-card-grid style="width: 50%; text-align: center" :hoverable="false">
        <p>{{ item.S_X }}</p>
        <p>{{ item.S_Y }}</p>
      </a-card-grid>
      <a-card-grid style="width: 50%; text-align: center" :hoverable="false"
        ><p>{{ item.E_X }}</p>
        <p>{{ item.S_Y }}</p></a-card-grid
      >
      <a-card-grid style="width: 50%; text-align: center" :hoverable="false"
        ><p>{{ item.S_X }}</p>
        <p>{{ item.E_Y }}</p></a-card-grid
      >
      <a-card-grid style="width: 50%; text-align: center" :hoverable="false"
        ><p>{{ item.E_X }}</p>
        <p>{{ item.E_Y }}</p></a-card-grid
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
  emits: ["removeRect", "selectBox"],
  setup(props, { emit }) {
    const store = useStore();
    const colorList = computed(() => store.state.colorList);

    const rectList = computed(() => props.myList);

    const removeRect = (id) => {
      emit("removeRect", id);
    };

    const selectBox = (id) => {
      emit("selectBox", id);
    };

    return {
      rectList,
      colorList,
      removeRect,
      selectBox,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/label.scss";
</style>
