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
        :style="`cursor: ${isgrabUpdatePoint}`"
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
    box: {
      type: Object,
    },
  },
  emits: ["addRect", "clearRect", "removeRect", "updateRect"],
  setup(props, { emit }) {
    let rectList = computed(() => props.myList);

    const store = useStore();
    const colorList = computed(() => store.state.colorList);
    const targetBox = computed(() => props.box);

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

    function onDrop(event) {
      const items = event.dataTransfer.files;
      targetFile.value = items[0];
    }

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
        const { color, S_X, S_Y, E_X, E_Y, id } = item;
        if (grabUpdatePoint.value === id) {
          return;
        }
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
    function loadImageFile() {
      const imgSrc = URL.createObjectURL(targetFile.value);
      imageLoad.value = new Image();
      imageLoad.value.src = imgSrc;
      imageLoad.value.onload = () => {
        ImagePrinting();
      };
    }

    watch(targetFile, () => {
      loadImageFile();
    });

    const start_x = ref(0);
    const start_y = ref(0);
    const end_x = ref(0);
    const end_y = ref(0);

    // x 좌표
    function canvasX(clientX) {
      const bound = canvas.value.getBoundingClientRect();
      const bw = 0; // 임시
      return (
        (clientX - bound.left - bw) *
        (canvas.value.width / (bound.width - bw * 2))
      );
    }

    // y 좌표
    function canvasY(clientY) {
      const bound = canvas.value.getBoundingClientRect();
      const bw = 0; // 임시
      return (
        (clientY - bound.top - bw) *
        (canvas.value.height / (bound.height - bw * 2))
      );
    }

    // 그리자!
    function startDraw(event) {
      end_x.value = canvasX(event.clientX);
      end_y.value = canvasY(event.clientY);
      const context = canvas.value.getContext("2d");
      context.lineWidth = 10;
      ImagePrinting();
      if (targetUpdateColor.value) {
        context.strokeStyle = targetUpdateColor.value;
      } else {
        context.strokeStyle = colorList.value[colorIndex];
      }
      context.strokeRect(
        start_x.value,
        start_y.value,
        end_x.value - start_x.value,
        end_y.value - start_y.value
      );
    }

    // 이동하고자 하는 박스 찾기
    function findMoveBoxTarget(x, y) {
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
    }

    // 움직이자!
    function moveBox(event) {
      const end_x = canvasX(event.clientX);
      const end_y = canvasY(event.clientY);

      const target = _.find(rectList.value, { id: targetMoveIndex.value });

      target.S_X += thirdToFixed(end_x - start_x.value, canvas.value.width);

      target.S_Y += thirdToFixed(end_y - start_y.value, canvas.value.height);

      target.E_X += thirdToFixed(end_x - start_x.value, canvas.value.width);

      target.E_Y += thirdToFixed(end_y - start_y.value, canvas.value.height);

      target.S_X = Number(target.S_X.toFixed(5));
      target.S_Y = Number(target.S_Y.toFixed(5));
      target.E_X = Number(target.E_X.toFixed(5));
      target.E_Y = Number(target.E_Y.toFixed(5));

      start_x.value = end_x;
      start_y.value = end_y;

      ImagePrinting();
    }

    // 클릭 했을 때 움직이는 박스일까?
    function findMoveBox(event) {
      start_x.value = canvasX(event.clientX);
      start_y.value = canvasY(event.clientY);
      const x = start_x.value / canvas.value.width;
      const y = start_y.value / canvas.value.height;
      const targetItemIndex = findMoveBoxTarget(x, y);
      console.log(targetItemIndex);
      if (targetItemIndex !== null) {
        targetMoveIndex.value = targetItemIndex;
      }
    }

    watch(ishandleBtn, () => {
      if (ishandleBtn.value) {
        isgrabUpdatePoint.value = false;
      }
    });

    function mousemove(event) {
      if (ishandleBtn.value) {
        if (targetMoveIndex.value !== null) {
          moveBox(event);
        }
      } else {
        hoverEdgePointer(event);

        if (targetUpdateColor.value) {
          startDraw(event);
          return;
        }
        if (!isStartDraw.value) return;
        startDraw(event);
      }
    }

    function mousedown(event) {
      if (ishandleBtn.value) {
        findMoveBox(event);
      } else {
        if (clickUpdateBox(event)) {
          return;
        }
        start_x.value = canvasX(event.clientX);
        start_y.value = canvasY(event.clientY);
        const x = start_x.value / canvas.value.width;
        const y = start_y.value / canvas.value.height;
        isStartDraw.value = true;
      }
    }

    // 자릿수 변환 (반올림)
    function thirdToFixed(a, b) {
      return Number((a / b).toFixed(5));
      // return a / b;
    }

    function mouseup(event) {
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
          color: targetUpdateColor.value
            ? targetUpdateColor.value
            : colorList.value[colorIndex],
          S_X: thirdToFixed(start_x.value, canvas.value.width),
          S_Y: thirdToFixed(start_y.value, canvas.value.height),
          E_X: thirdToFixed(end_x.value, canvas.value.width),
          E_Y: thirdToFixed(end_y.value, canvas.value.height),
          id:
            grabUpdatePoint.value === null ? colorIndex : grabUpdatePoint.value,
        };

        if (targetUpdateColor.value) {
          emit("updateRect", grabUpdatePoint.value, data);
          targetUpdateColor.value = false;
          isgrabUpdatePoint.value = false;
          grabUpdatePoint.value = null;
        } else {
          emit("addRect", data);
        }

        colorIndex += 1;
        start_x.value = -1;
        start_y.value = -1;
        end_x.value = -1;
        end_y.value = -1;
      }
    }

    function clearRect() {
      emit("clearRect");
    }

    watch(rectList, () => {
      ImagePrinting();
    });

    window.addEventListener("mouseup", () => {
      if (isStartDraw.value && !ishandleBtn.value) {
        mouseup();
      }
    });

    function pointerGrab(x, y, target_x, target_y) {
      if (
        target_x - 20 / canvas.value.width <= x &&
        x <= target_x + 20 / canvas.value.height
      ) {
        if (
          target_y - 20 / canvas.value.width <= y &&
          y <= target_y + 20 / canvas.value.height
        ) {
          return true;
        }
      }
      return false;
    }

    const grabUpdatePoint = ref(null);
    const isgrabUpdatePoint = ref(false);
    const targetUpdateColor = ref(false);

    function hoverEdgePointer(event) {
      const x = canvasX(event.clientX) / canvas.value.width;
      const y = canvasY(event.clientY) / canvas.value.height;

      for (let i = 0; i < rectList.value.length; i++) {
        const item = rectList.value[i];
        const { color, S_X, S_Y, E_X, E_Y, id } = item;

        // 좌상
        const leftHeight = pointerGrab(x, y, S_X, S_Y);
        if (leftHeight) {
          isgrabUpdatePoint.value = "pointer";
          return true;
        }

        //우상
        const rightHeight = pointerGrab(x, y, E_X, S_Y);
        if (rightHeight) {
          isgrabUpdatePoint.value = "pointer";
          return true;
        }

        //좌하
        const leftDown = pointerGrab(x, y, S_X, E_Y);
        if (leftDown) {
          isgrabUpdatePoint.value = "pointer";
          return true;
        }

        //우하
        const rightDown = pointerGrab(x, y, E_X, E_Y);
        if (rightDown) {
          isgrabUpdatePoint.value = "pointer";
          return true;
        }
      }
      isgrabUpdatePoint.value = false;
      return false;
    }

    function clickUpdateBox(event) {
      const x = canvasX(event.clientX) / canvas.value.width;
      const y = canvasY(event.clientY) / canvas.value.height;

      for (let i = 0; i < rectList.value.length; i++) {
        const item = rectList.value[i];
        const { color, S_X, S_Y, E_X, E_Y, id } = item;

        // 좌상
        const leftHeight = pointerGrab(x, y, S_X, S_Y);
        if (leftHeight) {
          start_x.value = E_X * canvas.value.width;
          start_y.value = E_Y * canvas.value.height;
          grabUpdatePoint.value = id;
          targetUpdateColor.value = color;
          return true;
        }

        //우상
        const rightHeight = pointerGrab(x, y, E_X, S_Y);
        if (rightHeight) {
          start_x.value = S_X * canvas.value.width;
          start_y.value = E_Y * canvas.value.height;
          grabUpdatePoint.value = id;
          targetUpdateColor.value = color;
          return true;
        }

        //좌하
        const leftDown = pointerGrab(x, y, S_X, E_Y);
        if (leftDown) {
          start_x.value = E_X * canvas.value.width;
          start_y.value = S_Y * canvas.value.height;
          grabUpdatePoint.value = id;
          isgrabUpdatePoint.value = "pointer";
          targetUpdateColor.value = color;
          return true;
        }

        //우하
        const rightDown = pointerGrab(x, y, E_X, E_Y);
        if (rightDown) {
          start_x.value = S_X * canvas.value.width;
          start_y.value = S_Y * canvas.value.height;
          grabUpdatePoint.value = id;
          targetUpdateColor.value = color;
          return true;
        }
      }
      isgrabUpdatePoint.value = false;
      grabUpdatePoint.value = null;
      return false;
    }

    watch(targetBox, () => {
      if (_.isEmpty(targetBox.value)) return;
      const context = canvas.value.getContext("2d");

      const { color, S_X, S_Y, E_X, E_Y, id } = targetBox.value;
      console.log(color, S_X, S_Y, E_X, E_Y);
      context.strokeStyle = color;
      context.strokeRect(
        S_X * canvas.value.width,
        S_Y * canvas.value.height,
        (E_X - S_X) * canvas.value.width,
        (E_Y - S_Y) * canvas.value.height
      );
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

      isgrabUpdatePoint,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/img_load.scss";
</style>
