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
        <th>Copy</th>
        <tr v-for="(item, index) of rectList" :key="item.color">
          <td>{{ index + 1 }}.</td>
          <td>{{ item.S_X.toFixed(2) }}</td>
          <td>{{ item.S_Y.toFixed(2) }}</td>
          <td>{{ item.E_X.toFixed(2) }}</td>
          <td>{{ item.E_Y.toFixed(2) }}</td>
          <td><input class="card-color" type="color" :value="item.color" /></td>
          <td>{{ item.color }}</td>
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
  setup(props, { emit }) {
    const rectList = computed(() => props.myList);

    const isPixel = ref(false);
    const setIsPixel = (data) => {
      isPixel.value = data;
    };

    const tableRef = ref(null);

    watch(rectList, () => {
      tableRef.value.scrollTop = tableRef.value.scrollHeight;
      console.log(tableRef.value.scrollHeight);
    });

    return {
      isPixel,
      setIsPixel,
      rectList,
      tableRef,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/label_table.scss";
</style>
