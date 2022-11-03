<template>
  <div>
    <div class="btn-container">
      <a-button
        class="btn"
        type="primary"
        :disabled="!targetFile"
        @click="clearRect"
        style="margin-right: 10px"
        >Clear</a-button
      >
      <a-button
        v-if="!ishandleBtn"
        type="primary"
        :disabled="!targetFile"
        @click="setIsHandleBtn(true)"
        ><i class="far fa-hand-paper"></i
      ></a-button>

      <a-button
        v-else
        type="primary"
        :disabled="!targetFile"
        @click="setIsHandleBtn(false)"
        ><i class="fas fa-pencil-alt"></i
      ></a-button>
    </div>

    <div
      v-if="isover && !targetFile"
      @dragleave="setOver(false)"
      @dragover.prevent
      @drop.prevent="onDrop"
      class="drag-and-drop card-body"
    >
      <h1 className="drag-text">Drag and Drop</h1>
    </div>

    <div
      class="load-container"
      @dragover.prevent
      @dragover="setOver(true)"
      :class="targetFile && 'target'"
    >
      <img v-if="!isover && !targetFile" :src="uploadImg" alt="load" />
      <!-- <input type="file" className="d-none" id="upload-input" /> -->
      <canvas
        width="1920"
        height="1080"
        v-show="targetFile"
        ref="canvas"
        @mousedown="mousedown"
        @mousemove="mousemove"
        @mouseup="mouseup"
        @dragover.prevent
        @drop.prevent="onDrop"
      ></canvas>
    </div>
  </div>
</template>

<script>
import uploadImg from "@/assets/img/upload.png";
import { ref } from "@vue/reactivity";
import { computed, watch } from "@vue/runtime-core";
import { useStore } from "vuex";
import _ from "lodash";

export default {
  props: {
    myList: {
      type: Array,
    },
  },
  emits: ["addRect", "clearRect", "removeRect"],
  setup(props, { emit }) {
    let rectList = computed(() => props.myList);

    const store = useStore();
    const colorList = computed(() => store.state.colorList);

    const isover = ref(false); // file upload 할때 박스안에 오버되는지
    const canvas = ref(null);
    const targetFile = ref(null); // input file
    const imageLoad = ref(""); // 이미지

    const ishandleBtn = ref(false);
    const setIsHandleBtn = (data) => {
      ishandleBtn.value = data;
    };

    // 그릴까?
    const isStartDraw = ref(false);
    // 움직일까?
    const ismove = ref(false);
    // 어떤거 움직일래
    const targetMoveIndex = ref(null);

    const setOver = (data) => {
      isover.value = data;
    };

    const onDrop = (event) => {
      const items = event.dataTransfer.files;
      console.log(items);
      targetFile.value = items[0];
    };

    //
    let colorIndex = 0;
    function ImagePrinting() {
      const context = canvas.value.getContext("2d");
      context.clearRect(0, 0, canvas.value.width, canvas.value.height);
      context.drawImage(
        imageLoad.value,
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );

      rectList.value.forEach((item, index) => {
        const { color, S_X, S_Y, E_X, E_Y } = item;
        context.strokeStyle = color;
        context.strokeRect(
          S_X * canvas.value.width,
          S_Y * canvas.value.height,
          (E_X - S_X) * canvas.value.width,
          (E_Y - S_Y) * canvas.value.height
        );
      });
    }

    // 이미지 업로드
    const loadImageFile = () => {
      const imgSrc = URL.createObjectURL(targetFile.value);
      imageLoad.value = new Image();
      imageLoad.value.src = imgSrc;
      imageLoad.value.onload = () => {
        ImagePrinting();
      };
    };

    watch(targetFile, () => {
      loadImageFile();
    });

    const start_x = ref(0);
    const start_y = ref(0);
    const end_x = ref(0);
    const end_y = ref(0);

    // x 좌표
    const canvasX = (clientX) => {
      const bound = canvas.value.getBoundingClientRect();
      const bw = 0; // 임시
      return (
        (clientX - bound.left - bw) *
        (canvas.value.width / (bound.width - bw * 2))
      );
    };

    // y 좌표
    const canvasY = (clientY) => {
      const bound = canvas.value.getBoundingClientRect();
      const bw = 0; // 임시
      return (
        (clientY - bound.top - bw) *
        (canvas.value.height / (bound.height - bw * 2))
      );
    };

    // 그리기 위해 처음 좌표찍기
    const startDraw = (event) => {
      end_x.value = canvasX(event.clientX);
      end_y.value = canvasY(event.clientY);
      const context = canvas.value.getContext("2d");
      context.lineWidth = 10;
      ImagePrinting();
      context.strokeStyle = colorList.value[colorIndex];
      context.strokeRect(
        start_x.value,
        start_y.value,
        end_x.value - start_x.value,
        end_y.value - start_y.value
      );
    };

    // 이동하고자 하는 박스 찾기
    const findMoveBoxTarget = (x, y) => {
      for (let i = 0; i < rectList.value.length; i++) {
        const item = rectList.value[i];
        const { color, S_X, S_Y, E_X, E_Y, id } = item;

        if (x >= S_X && x <= E_X) {
          if (y >= S_Y && y <= E_Y) {
            return id;
          }
        }
      }
      return null;
    };

    // 움직이자!
    const moveBox = (event) => {
      const end_x = canvasX(event.clientX);
      const end_y = canvasY(event.clientY);

      const target = _.find(rectList.value, { id: targetMoveIndex.value });

      target.S_X += thirdToFixed(end_x - start_x.value, canvas.value.width);

      target.S_Y += thirdToFixed(end_y - start_y.value, canvas.value.height);

      target.E_X += thirdToFixed(end_x - start_x.value, canvas.value.width);

      target.E_Y += thirdToFixed(end_y - start_y.value, canvas.value.height);

      start_x.value = end_x;
      start_y.value = end_y;

      ImagePrinting();
    };

    // 클릭 했을 때 움직이는 박스일까?
    const findMoveBox = (event) => {
      start_x.value = canvasX(event.clientX);
      start_y.value = canvasY(event.clientY);
      const x = start_x.value / canvas.value.width;
      const y = start_y.value / canvas.value.height;
      const targetItemIndex = findMoveBoxTarget(x, y);
      if (targetItemIndex !== null) {
        targetMoveIndex.value = targetItemIndex;
      }
    };

    const mousemove = (event) => {
      if (ishandleBtn.value) {
        if (targetMoveIndex.value !== null) {
          moveBox(event);
        }
      } else {
        if (!isStartDraw.value) return;
        startDraw(event);
      }
    };

    const mousedown = (event) => {
      if (ishandleBtn.value) {
        findMoveBox(event);
      } else {
        start_x.value = canvasX(event.clientX);
        start_y.value = canvasY(event.clientY);
        const x = start_x.value / canvas.value.width;
        const y = start_y.value / canvas.value.height;
        isStartDraw.value = true;
      }
    };

    // 자릿수 변환 (반올림)
    const thirdToFixed = (a, b) => {
      return Number((a / b).toFixed(5));
      // return a / b;
    };

    const mouseup = (event) => {
      if (ishandleBtn.value) {
        targetMoveIndex.value = null;
        ImagePrinting();
      } else {
        isStartDraw.value = false;

        if (
          [start_x.value, start_y.value, end_x.value, end_y.value].includes(-1)
        )
          return;

        const data = {
          color: colorList.value[colorIndex],
          S_X: thirdToFixed(start_x.value, canvas.value.width),
          S_Y: thirdToFixed(start_y.value, canvas.value.height),
          E_X: thirdToFixed(end_x.value, canvas.value.width),
          E_Y: thirdToFixed(end_y.value, canvas.value.height),
          id: colorIndex,
        };
        // const data = [
        //   colorList.value[colorIndex],
        //   start_x.value / canvas.value.width,
        //   start_y.value / canvas.value.height,
        //   (end_x.value - start_x.value) / canvas.value.width,
        //   (end_y.value - start_y.value) / canvas.value.height,
        // ];
        emit("addRect", data);
        colorIndex += 1;
        start_x.value = -1;
        start_y.value = -1;
        end_x.value = -1;
        end_y.value = -1;
      }
    };

    const clearRect = () => {
      emit("clearRect");
    };

    watch(rectList, () => {
      ImagePrinting();
    });

    window.addEventListener("mouseup", () => {
      if (isStartDraw.value && !ishandleBtn.value) {
        mouseup();
      }
    });

    return {
      uploadImg,
      isover,
      setOver,
      onDrop,
      canvas,
      targetFile,
      mousedown,
      mousemove,
      mouseup,
      clearRect,
      ishandleBtn,
      setIsHandleBtn,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/img_load.scss";
</style>
