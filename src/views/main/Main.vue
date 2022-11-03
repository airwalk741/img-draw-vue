<template>
  <div class="main">
    <ImageLoad
      :myList="rectList"
      @addRect="addRect"
      @clearRect="clearRect"
      @removeRect="removeRect"
    />
    <!-- <LabelCardList :myList="rectList" @removeRect="removeRect" /> -->
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
    // LabelCardList
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
      console.log(id);
      rectList.value = rectList.value.filter((item) => item[5] !== id);
    };

    return {
      rectList,
      addRect,
      clearRect,
      removeRect,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/main.scss";
</style>
