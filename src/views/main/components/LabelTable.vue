<template>
  <div class="container">
    <div class="btn-container">
      <a-button
        type="primary"
        style="margin-right: 10px; font-weight: bolder"
        @click="setIsPixel(false)"
        >All Cocy</a-button
      >
      <a-button
        v-if="isPixel"
        type="primary"
        style="margin-right: 10px; font-weight: bolder"
        @click="setIsPixel(false)"
        >Pixel</a-button
      >
      <a-button
        v-else
        type="primary"
        style="font-weight: bolder"
        @click="setIsPixel(true)"
      >
        Relative
      </a-button>
    </div>
    <!-- <a-table :dataSource="dataSource" :columns="columns" /> -->
    <div class="table-container" ref="tableRef">
      <table>
        <th>No.</th>
        <th>Start X</th>
        <th>Start Y</th>
        <th>End X</th>
        <th>End Y</th>
        <th>Color</th>
        <th>Action</th>
        <tr
          v-for="(item, index) in rectList"
          :key="index"
          @click="selectBox(item.id)"
        >
          <td>{{ index + 1 }}.</td>
          <td>{{ item.S_X.toFixed(2) }}</td>
          <td>{{ item.S_Y.toFixed(2) }}</td>
          <td>{{ item.E_X.toFixed(2) }}</td>
          <td>{{ item.E_Y.toFixed(2) }}</td>
          <td>
            <input
              class="card-color"
              type="color"
              :value="item.color"
              @input="(e) => changeColor(item.id, e)"
            />
          </td>
          <td>
            <i class="fas fa-copy"></i>
            <i class="fas fa-trash-alt" @click="removeRect(item)"></i>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { ref } from "@vue/reactivity";
import { computed, watch } from "@vue/runtime-core";
export default {
  props: {
    myList: {
      type: Array,
    },
  },
  emits: ["removeRect", "selectBox", "changeColor"],

  setup(props, { emit }) {
    const rectList = computed(() => props.myList);

    const isPixel = ref(false);
    const setIsPixel = (data) => {
      isPixel.value = data;
    };

    const tableRef = ref(null);

    // watch(rectList, () => {
    //   tableRef.value.scrollTop = tableRef.value.scrollHeight;
    // });

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
      isPixel,
      setIsPixel,
      rectList,
      tableRef,
      removeRect,
      selectBox,
      changeColor,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/label_table.scss";
</style>
