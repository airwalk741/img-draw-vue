<template>
  <div class="main">
    <ImageLoad
      :myList="rectList"
      @addRect="addRect"
      @clearRect="clearRect"
      @removeRect="removeRect"
      @updateRect="updateRect"
    />
    <LabelCardList :myList="rectList" @removeRect="removeRect" />
  </div>
</template>

<script>
import { ref } from "vue";
import ImageLoad from "./components/ImageLoad.vue";
import LabelCardList from "./components/LabelCardList.vue";

// rectList = [
//   startX, startY, 가로길이, 세로길이
// ]

export default {
  components: {
    ImageLoad,
    LabelCardList,
  },

  setup() {
    let rectList = ref([]);

    const addRect = (data) => {
      rectList.value.unshift(data);
    };

    const clearRect = () => {
      console.log("care");
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

    return {
      rectList,
      addRect,
      clearRect,
      removeRect,
      updateRect,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/main.scss";
</style>
