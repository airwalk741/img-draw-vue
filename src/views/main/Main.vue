<template>
  <div class="main">
    <div class="img">
      <ImageLoad
        :myList="rectList"
        @addRect="addRect"
        @clearRect="clearRect"
        @removeRect="removeRect"
        @updateRect="updateRect"
        @selectBox="selectBox"
        :box="targetBox"
        @setCanvasSize="setCanvasSize"
        :canvasSize="canvasSize"
      />
    </div>
    <!-- <LabelCardList
      :myList="rectList"
      @removeRect="removeRect"
      @selectBox="selectBox"
      @changeColor="changeColor"
      :canvasSize="canvasSize"
    /> -->
    <div class="table">
      <LabelTable
        :myList="rectList"
        @removeRect="removeRect"
        @selectBox="selectBox"
        @changeColor="changeColor"
        :canvasSize="canvasSize"
      />
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import ImageLoad from "./components/ImageLoad.vue";
import LabelCardList from "./components/LabelCardList.vue";

import _ from "lodash";
import LabelTable from "./components/LabelTable.vue";

// rectList = [
//   startX, startY, 가로길이, 세로길이
// ]

export default {
  components: {
    ImageLoad,
    // LabelCardList,
    LabelTable,
  },

  setup() {
    const rectList = ref([]);
    const targetBox = ref({});
    // watch(targetBox, () => {
    //   targetBox.value = {};
    // });

    const canvasSize = ref({
      width: 0,
      height: 0,
    });

    const setCanvasSize = (data) => {
      canvasSize.value = data;
    };

    const addRect = (data) => {
      rectList.value = [...rectList.value, data];
      targetBox.value = {};
    };

    const clearRect = () => {
      targetBox.value = {};
      rectList.value = [];
    };

    const removeRect = (id) => {
      if (!_.isEmpty(targetBox)) {
        if (targetBox.value.id === id) {
          targetBox.value = {};
        }
      }
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
      if (!_.isEmpty(targetBox)) {
        if (targetBox.value.id === id) {
          targetBox.value = data;
        }
      }
    };

    const selectBox = (id) => {
      targetBox.value = _.find(rectList.value, { id: id });
    };

    const changeColor = (id, color) => {
      rectList.value = rectList.value.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            color,
          };
        } else {
          return item;
        }
      });
      if (!_.isEmpty(targetBox)) {
        if (targetBox.value.id === id) {
          targetBox.value.color = color;
        }
      }
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
      setCanvasSize,
      canvasSize,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/main.scss";
</style>
