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
        @setImgCanvasSizeCount="setImgCanvasSizeCount"
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
        :imgCanvasSizeCount="imgCanvasSizeCount"
        @changeChecker="changeChecker"
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
      rectList.value = [
        ...rectList.value,
        {
          ...data,
          checked: true,
          id: new Date().getTime(),
        },
      ];
      targetBox.value = {};
    };

    const clearRect = () => {
      targetBox.value = {};
      rectList.value = [];
    };

    const removeRect = (target) => {
      if (!_.isEmpty(targetBox.value)) {
        if (targetBox.value.id === target.id) {
          targetBox.value = {};
        }
      }
      rectList.value = rectList.value.filter((item) => item.id !== target.id);
    };

    const updateRect = (id, data) => {
      rectList.value = rectList.value.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...data,
          };
        } else {
          return item;
        }
      });
      if (!_.isEmpty(targetBox.value)) {
        if (targetBox.value.id === id) {
          targetBox.value = data;
        }
      }
    };

    const selectBox = (id) => {
      targetBox.value = _.find(rectList.value, { id: id });
    };

    // 색 변환
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
      if (!_.isEmpty(targetBox.value)) {
        if (targetBox.value.id === id) {
          targetBox.value.color = color;
        }
      }
    };

    // canvas 크기
    const imgCanvasSizeCount = ref(1);
    const setImgCanvasSizeCount = (data) => {
      imgCanvasSizeCount.value = data;
    };

    // 체크박스
    const changeChecker = (data, checked) => {
      rectList.value = rectList.value.map((item) => {
        if (item.id === data.id) {
          return {
            ...item,
            checked,
          };
        }
        return item;
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
      setCanvasSize,
      canvasSize,
      setImgCanvasSizeCount,

      imgCanvasSizeCount,
      changeChecker,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/main.scss";
</style>
