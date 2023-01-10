<template>
  <div>
    <a-modal
      class="modal-container"
      :visible="visible"
      title="Basic Modal"
      @cancel="handlecancel"
      @ok="handleOk"
    >
      <span class="">Format</span>
      <a-textarea
        :value="exampleText"
        placeholder="Basic usage"
        :rows="4"
        disabled
      />
      <a-textarea
        id="textarea-input"
        v-model:value="textValue"
        placeholder="input data"
        ref="textRef"
        :rows="4"
      />
    </a-modal>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from "@vue/runtime-core";
import { message } from "ant-design-vue";
import { useStore } from "vuex";

export default {
  props: {
    isModal: {
      type: Boolean,
    },
    imgCanvasSizeCount: {
      type: Number,
    },
  },
  emits: ["handleOk", "handlecancel"],
  setup(props, { emit }) {
    const store = useStore();
    const visible = computed(() => props.isModal);
    const colorList = computed(() => store.state.colorList);
    // const colorList = c

    const exampleText = `[(256, 88), (339, 157)]
[(137, 135), (249, 267)]
[(286, 154), (363, 229)]
[(357, 51), (436, 126)]`;

    const textValue = ref(``);

    // textarea 자동
    const textRef = ref(null);

    watch([textValue, textRef], () => {
      const textarea = document.querySelector("#textarea-input");

      if (textarea) {
        textarea.style.height = "auto";
        let height = textarea.scrollHeight; // 높이
        textarea.style.height = `${height + 10}px`;
      }
    });

    const handleOk = () => {
      const data = textValue.value.split("\n");

      let dataList = [];
      let index = 0;

      for (let item of data) {
        const lineNumbers = item.replace(/\[|\]|\(|\)/g, "").split(",");
        let newData = [];
        for (let num of lineNumbers) {
          const number = Number(num);
          if (isNaN(number)) {
            message.warning("validation failed");
            return;
          }
          newData.push(number);
        }
        dataList.push({
          S_X: newData[0] * props.imgCanvasSizeCount,
          S_Y: newData[1] * props.imgCanvasSizeCount,
          E_X: newData[2] * props.imgCanvasSizeCount,
          E_Y: newData[3] * props.imgCanvasSizeCount,
          checked: true,
          color: colorList.value[index],
          id: new Date().getTime() + index,
        });
        index++;
      }
      emit("handleOk", dataList);
    };

    const handlecancel = () => {
      emit("handlecancel");
    };

    return {
      visible,
      handleOk,
      exampleText,
      textValue,
      textRef,
      handlecancel,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/modal.scss";
</style>

<!-- [(256, 88), (339, 157)]
[(137, 135), (249, 267)]
[(286, 154), (363, 229)]
[(357, 51), (436, 126)] -->
