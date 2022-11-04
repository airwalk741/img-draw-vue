<template>
  <div class="main">
    <ImageLoad
      :myList="rectList"
      @addRect="addRect"
      @clearRect="clearRect"
      @removeRect="removeRect"
      @updateRect="updateRect"
      @selectBox="selectBox"
      :box="targetBox"
    />
    <LabelCardList
      :myList="rectList"
      @removeRect="removeRect"
      @selectBox="selectBox"
      @changeColor="changeColor"
    />
    <input type="color" />
  </div>
</template>

<script>
import { ref, watch } from "vue";
import ImageLoad from "./components/ImageLoad.vue";
import LabelCardList from "./components/LabelCardList.vue";

import _ from "lodash";

// rectList = [
//   startX, startY, 가로길이, 세로길이
// ]

export default {
  components: {
    ImageLoad,
    LabelCardList,
  },

  setup() {
    const rectList = ref([]);
    const targetBox = ref({});
    watch(targetBox, () => {
      targetBox.value = {};
    });

    const addRect = (data) => {
      rectList.value.unshift(data);
    };

    const clearRect = () => {
      rectList.value = [];
    };

    const removeRect = (id) => {
      rectList.value = rectList.value.filter((item) => item.id !== id);
    };

    const updateRect = (id, data) => {
      rectList.value = rectList.value.map((item) => {
        if (item.id === id) {
          return data;
        } else {
          return item;
        }
      });
    };

    const selectBox = (id) => {
      targetBox.value = _.find(rectList.value, { id: id });
    };

    const changeColor = (id, color) => {
      rectList.value = rectList.value.map((item) => {
        if (item.id === id) {
          console.log(color);
          return {
            ...item,
            color,
          };
        } else {
          return item;
        }
      });
    };

    return {
      rectList,
      addRect,
      clearRect,
      removeRect,
      updateRect,
      selectBox,
      targetBox,
      changeColor,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/main.scss";
</style>
