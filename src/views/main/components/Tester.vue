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
        @contextMenu="() => console.log('test')"
      ></canvas>
    </div>
  </div>
</template>

<script>
import uploadImg from "@/assets/img/upload.png";
import { ref } from "@vue/reactivity";
import { computed, onMounted, watch } from "@vue/runtime-core";
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
  emits: ["addRect", "clearRect", "removeRect", "updateRect", "selectBox"],
  setup(props, { emit }) {
    let rectList = computed(() => props.myList);

    const store = useStore();
    const colorList = computed(() => store.state.colorList);
    const targetBox = computed(() => props.box);

    const isover = ref(false); // file upload ?????? ???????????? ???????????????
    const canvas = ref(null);
    const targetFile = ref(null); // input file
    const imageLoad = ref(""); // ?????????

    const ishandleBtn = ref(false);
    const setIsHandleBtn = (data) => {
      ishandleBtn.value = data;
    };

    // ??????????
    const isStartDraw = ref(false);
    // ?????????????
    const ismove = ref(false);
    // ????????? ????????????
    const targetMoveIndex = ref(null);

    const setOver = (data) => {
      isover.value = data;
    };

    function onDrop(event) {
      clearRect();
      const items = event.dataTransfer.files;
      targetFile.value = items[0];
    }

    //
    let colorIndex = 0;
    function ImagePrinting() {
      if (!imageLoad.value) return;
      const context = canvas.value.getContext("2d");
      context.clearRect(0, 0, canvas.value.width, canvas.value.height);

      let a_w = canvas.value.width / imageLoad.value.width;
      let a_h = canvas.value.height / imageLoad.value.height;

      const target = a_w > a_h ? a_h : a_w;

      context.drawImage(
        imageLoad.value,
        0,
        0,
        imageLoad.value.width * target,
        imageLoad.value.height * target
      );

      for (let i = 0; i < rectList.value.length; i++) {
        const { color, S_X, S_Y, E_X, E_Y, id } = rectList.value[i];
        if (grabUpdatePoint.value === id) {
          continue;
        }
        context.strokeStyle = color;
        context.strokeRect(
          S_X * canvas.value.width,
          S_Y * canvas.value.height,
          (E_X - S_X) * canvas.value.width,
          (E_Y - S_Y) * canvas.value.height
        );
      }

      if (!_.isEmpty(targetBox.value)) {
        if (grabUpdatePoint.value === null) {
          const { color, S_X, S_Y, E_X, E_Y, id } = targetBox.value;
          context.strokeStyle = color;
          context.strokeRect(
            S_X * canvas.value.width,
            S_Y * canvas.value.height,
            (E_X - S_X) * canvas.value.width,
            (E_Y - S_Y) * canvas.value.height
          );
        }
      }
    }

    // ????????? ?????????
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

    // x ??????
    function canvasX(clientX) {
      const bound = canvas.value.getBoundingClientRect();
      const bw = 0; // ??????
      return (
        (clientX - bound.left - bw) *
        (canvas.value.width / (bound.width - bw * 2))
      );
    }

    // y ??????
    function canvasY(clientY) {
      const bound = canvas.value.getBoundingClientRect();
      const bw = 0; // ??????
      return (
        (clientY - bound.top - bw) *
        (canvas.value.height / (bound.height - bw * 2))
      );
    }

    // ?????????!
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

    // x, y ?????? ?????? ?????? ??????
    // ????????? ?????? ????????? ?????? start_x??? ????????? x?????? ????????? => ????????? ??????????????? ??????
    // ????????? hoverEdgePointer, findMoveBoxTarget??? if?????? ???????????? ??????
    function bigValue(a, b) {
      if (a > b) {
        return [a, b];
      } else {
        return [b, a];
      }
    }

    // ??????????????? ?????? ?????? ??????
    function findMoveBoxTarget(x, y) {
      for (let i = 0; i < rectList.value.length; i++) {
        const item = rectList.value[i];
        let { color, S_X, S_Y, E_X, E_Y, id } = item;

        let [a, b] = bigValue(S_X, E_X);

        S_X = b;
        E_X = a;

        [a, b] = bigValue(S_Y, E_Y);
        S_Y = b;
        E_Y = a;

        if (x >= S_X && x <= E_X) {
          if (y >= S_Y && y <= E_Y) {
            emit("selectBox", id);
            return id;
          }
        }
      }
      return null;
    }

    // ????????????!
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

    // ?????? ?????? ??? ???????????? ?????????????
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

    // ????????? ?????? (?????????)
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
          colorIndex += 1;
        }

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
        target_x - 5 / canvas.value.width <= x &&
        x <= target_x + 5 / canvas.value.height
      ) {
        if (
          target_y - 5 / canvas.value.width <= y &&
          y <= target_y + 5 / canvas.value.height
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
        let { color, S_X, S_Y, E_X, E_Y, id } = item;

        let [a, b] = bigValue(S_X, E_X);

        S_X = b;
        E_X = a;

        [a, b] = bigValue(S_Y, E_Y);
        S_Y = b;
        E_Y = a;

        // ??????
        const leftHeight = pointerGrab(x, y, S_X, S_Y);
        if (leftHeight) {
          isgrabUpdatePoint.value = "pointer";
          return true;
        }

        //??????
        const rightHeight = pointerGrab(x, y, E_X, S_Y);
        if (rightHeight) {
          isgrabUpdatePoint.value = "pointer";
          return true;
        }

        //??????
        const leftDown = pointerGrab(x, y, S_X, E_Y);
        if (leftDown) {
          isgrabUpdatePoint.value = "pointer";
          return true;
        }

        //??????
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

        // ??????
        const leftHeight = pointerGrab(x, y, S_X, S_Y);
        if (leftHeight) {
          start_x.value = E_X * canvas.value.width;
          start_y.value = E_Y * canvas.value.height;
          grabUpdatePoint.value = id;
          targetUpdateColor.value = color;
          return true;
        }

        //??????
        const rightHeight = pointerGrab(x, y, E_X, S_Y);
        if (rightHeight) {
          start_x.value = S_X * canvas.value.width;
          start_y.value = E_Y * canvas.value.height;
          grabUpdatePoint.value = id;
          targetUpdateColor.value = color;
          return true;
        }

        //??????
        const leftDown = pointerGrab(x, y, S_X, E_Y);
        if (leftDown) {
          start_x.value = E_X * canvas.value.width;
          start_y.value = S_Y * canvas.value.height;
          grabUpdatePoint.value = id;
          isgrabUpdatePoint.value = "pointer";
          targetUpdateColor.value = color;
          return true;
        }

        //??????
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

      if (grabUpdatePoint.value !== null) return;

      const { color, S_X, S_Y, E_X, E_Y, id } = targetBox.value;
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
