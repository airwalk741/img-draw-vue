<template>
  <div class="label-card-container">
    <a-card
      v-for="(item, index) in rectList"
      :key="index"
      @click="selectBox(item.id)"
    >
      <div class="delete">
        <!-- <div
          
          :style="`background-color: ${item.color}`"
        ></div> -->
        <input
          class="card-color"
          type="color"
          :value="item.color"
          @input="(e) => changeColor(item.id, e)"
        />
        <span class="delete-icon" @click="removeRect(item.id)">X</span>
      </div>

      <a-card-grid style="width: 50%; text-align: center" :hoverable="false">
        <p>{{ item.S_X.toFixed(2) }}</p>
        <p>{{ item.S_Y.toFixed(2) }}</p>
      </a-card-grid>
      <a-card-grid style="width: 50%; text-align: center" :hoverable="false"
        ><p>{{ item.E_X.toFixed(2) }}</p>
        <p>{{ item.S_Y.toFixed(2) }}</p></a-card-grid
      >
      <a-card-grid style="width: 50%; text-align: center" :hoverable="false"
        ><p>{{ item.S_X.toFixed(2) }}</p>
        <p>{{ item.E_Y.toFixed(2) }}</p></a-card-grid
      >
      <a-card-grid style="width: 50%; text-align: center" :hoverable="false"
        ><p>{{ item.E_X.toFixed(2) }}</p>
        <p>{{ item.E_Y.toFixed(2) }}</p></a-card-grid
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
    canvasSize: {
      type: Object,
    },
  },
  emits: ["removeRect", "selectBox", "changeColor"],
  setup(props, { emit }) {
    const store = useStore();
    const colorList = computed(() => store.state.colorList);

    const rectList = computed(
      () => props.myList
      // props.myList.map((item) => {
      //   const { width, height } = props.canvasSize;
      //   const { S_X, S_Y, E_X, E_Y } = item;

      //   return {
      //     ...item,
      //     S_X: S_X * width,
      //     S_Y: S_Y * height,
      //     E_X: E_X * width,
      //     E_Y: E_Y * height,
      //   };
      // })
    );

    const canvas = computed(() => props.canvasSize);

    const removeRect = (id) => {
      emit("removeRect", id);
    };

    const selectBox = (id) => {
      emit("selectBox", id);
    };

    const changeColor = (id, event) => {
      // console.log();
      emit("changeColor", id, event.currentTarget.value);
    };

    return {
      rectList,
      colorList,
      removeRect,
      selectBox,
      changeColor,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/label.scss";
</style>
