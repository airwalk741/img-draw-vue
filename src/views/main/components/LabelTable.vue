<template>
  <div class="container">
    <div class="btn-container">
      <a-button
        style="margin-right: 10px; font-weight: bolder"
        type="primary"
        @click="showModal"
        :disabled="!isFile"
        >Input Label</a-button
      >
      <a-button
        type="primary"
        style="margin-right: 10px; font-weight: bolder"
        @click="ALlHandleCopy"
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
        <th></th>
        <th>Start X</th>
        <th>Start Y</th>
        <th>End X</th>
        <th>End Y</th>
        <th>Color</th>
        <th>Action</th>
        <tr
          v-for="(item, index) in rectList"
          :key="index"
          @click="selectBox(item)"
        >
          <!-- <td>{{ index + 1 }}.</td> -->
          <td>
            <a-checkbox
              v-model:checked="item.checked"
              @change="(e) => changeChecker(item, e.target.checked)"
            ></a-checkbox>
          </td>
          <td v-if="isPixel">
            {{ Math.round(item.S_X / imgCanvasSizeCount) }}
          </td>
          <td v-else>{{ (item.S_X / canvasWidth).toFixed(5) }}</td>

          <td v-if="isPixel">
            {{ Math.round(item.S_Y / imgCanvasSizeCount) }}
          </td>
          <td v-else>{{ (item.S_Y / canvasHeight).toFixed(5) }}</td>

          <td v-if="isPixel">
            {{ Math.round(item.E_X / imgCanvasSizeCount) }}
          </td>
          <td v-else>{{ (item.E_X / canvasWidth).toFixed(5) }}</td>

          <td v-if="isPixel">
            {{ Math.round(item.E_Y / imgCanvasSizeCount) }}
          </td>
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
    imgCanvasSizeCount: {
      type: Number,
    },
    isFile: {
      type: Boolean,
    },
  },
  emits: [
    "removeRect",
    "selectBox",
    "changeColor",
    "changeChecker",
    "showModal",
  ],

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

    const selectBox = (item) => {
      if (!item.checked) return;
      emit("selectBox", item.id);
    };

    const changeColor = (id, event) => {
      emit("changeColor", id, event.currentTarget.value);
    };

    const handleCopy = (item) => {
      let { S_X, S_Y, E_X, E_Y } = item;
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      if (isPixel.value) {
        S_X /= props.imgCanvasSizeCount;
        S_Y /= props.imgCanvasSizeCount;
        E_X /= props.imgCanvasSizeCount;
        E_Y /= props.imgCanvasSizeCount;
      }

      if (isPixel.value) {
        textarea.value = `[(${Math.round(S_X)}, ${Math.round(
          S_Y
        )}), (${Math.round(E_X)}, ${Math.round(E_Y)})]`;
      } else {
        textarea.value = `[(${S_X / canvasWidth.value}, ${
          S_Y / canvasHeight.value
        }), (${E_X / canvasWidth.value}, ${E_Y / canvasHeight.value})]`;
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
        let { S_X, S_Y, E_X, E_Y } = item;

        if (isPixel.value) {
          S_X /= props.imgCanvasSizeCount;
          S_Y /= props.imgCanvasSizeCount;
          E_X /= props.imgCanvasSizeCount;
          E_Y /= props.imgCanvasSizeCount;
        }

        if (isPixel.value) {
          textarea.value += `[(${Math.round(S_X)}, ${Math.round(
            S_Y
          )}), (${Math.round(E_X)}, ${Math.round(E_Y)})]`;
        } else {
          textarea.value += `[(${S_X / canvasWidth.value}, ${
            S_Y / canvasHeight.value
          }), (${E_X / canvasWidth.value}, ${E_Y / canvasHeight.value})]`;
        }

        if (i !== rectList.value.length - 1) {
          textarea.value += "\n";
        }
      }

      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    };

    const changeChecker = (item, checked) => {
      emit("changeChecker", item, checked);
    };

    const showModal = () => {
      emit("showModal");
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
      changeChecker,
      showModal,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/label_table.scss";
</style>
