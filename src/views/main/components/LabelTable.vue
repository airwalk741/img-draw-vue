<template>
  <div class="container">
    <div class="btn-container">
      <a-button
        type="primary"
        style="margin-right: 10px; font-weight: bolder"
        @click="ALlHandleCopy"
        >All Cocy</a-button
      >
      <a-button
        v-if="!isPixel"
        type="primary"
        style="margin-right: 10px; font-weight: bolder"
        @click="setIsPixel(true)"
        >Pixel</a-button
      >
      <a-button
        v-else
        type="primary"
        style="font-weight: bolder"
        @click="setIsPixel(false)"
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
          <td v-if="isPixel">{{ item.S_X.toFixed(2) }}</td>
          <td v-else>{{ (item.S_X / canvasWidth).toFixed(5) }}</td>

          <td v-if="isPixel">{{ item.S_Y.toFixed(2) }}</td>
          <td v-else>{{ (item.S_Y / canvasHeight).toFixed(5) }}</td>

          <td v-if="isPixel">{{ item.E_X.toFixed(2) }}</td>
          <td v-else>{{ (item.E_X / canvasWidth).toFixed(5) }}</td>

          <td v-if="isPixel">{{ item.E_Y.toFixed(2) }}</td>
          <td v-else>{{ (item.E_Y / canvasHeight).toFixed(5) }}</td>
          <td>
            <input
              class="card-color"
              type="color"
              :value="item.color"
              @input="(e) => changeColor(item.id, e)"
            />
          </td>
          <td>
            <i class="fas fa-copy" @click="handleCopy(item)"></i>
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
    canvasSize: {
      type: Object,
    },
  },
  emits: ["removeRect", "selectBox", "changeColor"],

  setup(props, { emit }) {
    const rectList = computed(() => props.myList);

    const canvasWidth = computed(() => props.canvasSize.canvasWidth);
    const canvasHeight = computed(() => props.canvasSize.canvasHeight);

    const isPixel = ref(true);
    const setIsPixel = (data) => {
      isPixel.value = data;
    };

    const tableRef = ref(null);

    watch(rectList, () => {
      setTimeout(() => {
        tableRef.value.scrollTop = tableRef.value.scrollHeight;
      }, 0);
    });

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

    const handleCopy = (item) => {
      const { S_X, S_Y, E_X, E_Y } = item;
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      if (isPixel.value) {
        textarea.value = `${S_X}, ${S_Y}, ${E_X}, ${E_Y}`;
      } else {
        textarea.value = `${S_X / canvasWidth.value}, ${
          S_Y / canvasHeight.value
        }, ${E_X / canvasWidth.value}, ${E_Y / canvasHeight.value}`;
      }

      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    };

    const ALlHandleCopy = () => {
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.value = "";
      for (let i = 0; i < rectList.value.length; i++) {
        const item = rectList.value[i];
        const { S_X, S_Y, E_X, E_Y } = item;

        if (isPixel.value) {
          textarea.value += `${S_X}, ${S_Y}, ${E_X}, ${E_Y}`;
        } else {
          textarea.value += `${S_X / canvasWidth.value}, ${
            S_Y / canvasHeight.value
          }, ${E_X / canvasWidth.value}, ${E_Y / canvasHeight.value}`;
        }

        if (i !== rectList.value.length - 1) {
          textarea.value += "\n";
        }
      }

      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    };

    return {
      isPixel,
      setIsPixel,
      rectList,
      tableRef,
      removeRect,
      selectBox,
      changeColor,
      handleCopy,
      canvasHeight,
      canvasWidth,
      ALlHandleCopy,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/label_table.scss";
</style>
