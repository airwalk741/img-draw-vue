<template>
  <div>
    <div class="btn-container">
      <div class="img-info">
        <span> {{ targetFile?.name }}</span>
        <span v-if="targetFile !== null"
          >&nbsp;&nbsp; {{ `(${getByteSize(targetFile?.size)})` }}</span
        >
        <span v-if="canvasSize.width"
          >&nbsp;&nbsp; {{ `${imageLoad.width} X ${imageLoad.height}` }}</span
        >
      </div>
      <div>
        <a-input-number
          id="inputNumber"
          v-model:value="lineWidth"
          :min="1"
          :max="15"
          style="margin-right: 20px"
        />
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
    </div>

    <div
      style="width: 935px; height: 550px"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
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
        @dragleave="setOver(false)"
        @drop.prevent="onDrop"
        :style="`width: ${imageLoad.width * imgCanvasSizeCount}px; height: ${
          imageLoad.height * imgCanvasSizeCount
        }px`"
      >
        <div className="upload-img-container" v-if="!targetFile">
          <label htmlFor="upload"></label>
          <img v-if="!isover && !targetFile" :src="uploadImg" alt="load" />
          <input
            type="file"
            className=""
            id="upload"
            accept="image/jpeg, image/png, image/jpg"
            style="display: none"
            @change="handleFile"
          />
        </div>
        <!-- <input type="file" className="d-none" id="upload-input" /> -->
        <canvas
          width="935"
          height="550"
          v-show="targetFile"
          ref="canvas"
          @mousedown="mousedown"
          @mousemove="mousemove"
          @mouseup="mouseup"
          @dragover.prevent
          @drop.prevent="onDrop"
          :style="`cursor: ${
            ishandleBtn
              ? 'pointer'
              : isgrabUpdatePoint
              ? isgrabUpdatePoint
              : 'auto'
          }; `"
        ></canvas>
      </div>
    </div>

    <div class="pointer-container">
      <p>X: {{ Math.round(userPointer.x / imgCanvasSizeCount) }}</p>
      <p>Y: {{ Math.round(userPointer.y / imgCanvasSizeCount) }}</p>
    </div>
  </div>
</template>

<script>
import uploadImg from "@/assets/img/upload.png";
import { ref } from "@vue/reactivity";
import { computed, onMounted, watch } from "@vue/runtime-core";
import { useStore } from "vuex";
import penImg from "@/assets/img/pen.png";
import _ from "lodash";

export default {
  props: {
    myList: {
      type: Array,
    },
    box: {
      type: Object,
    },
    canvasSize: {
      type: Object,
    },
  },
  emits: [
    "addRect",
    "clearRect",
    "removeRect",
    "updateRect",
    "selectBox",
    "setCanvasSize",
    "setImgCanvasSizeCount",
    "setisFile",
  ],
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

    const getByteSize = (size) => {
      const byteUnits = ["KB", "MB", "GB", "TB"];

      for (let i = 0; i < byteUnits.length; i++) {
        size = Math.floor(size / 1024);

        if (size < 1024) return size.toFixed(1) + byteUnits[i];
      }
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

    function handleFile(e) {
      const file = e.target.files[0];
      targetFile.value = file;
      emit("setisFile");
    }

    function onDrop(event) {
      clearRect();
      const items = event.dataTransfer.files;
      targetFile.value = items[0];
      emit("setisFile");
    }

    //
    let colorIndex = 0;
    const imgCanvasSizeCount = ref(1);
    function ImagePrinting() {
      if (!imageLoad.value && !imageLoad.value.width) return;
      const context = canvas.value.getContext("2d");
      context.clearRect(0, 0, canvas.value.width, canvas.value.height);
      context.lineWidth = lineWidth.value;

      const imgWidthCount = canvas.value.width / imageLoad.value.width;
      const imgHeightCount = canvas.value.height / imageLoad.value.height;
      imgCanvasSizeCount.value =
        imgWidthCount < imgHeightCount ? imgWidthCount : imgHeightCount;

      emit("setImgCanvasSizeCount", imgCanvasSizeCount.value);

      // [(163, 425), (173, 445)]
      // [(161, 425), (176, 443)]
      emit("setCanvasSize", {
        width: imageLoad.value.width * imgCanvasSizeCount.value,
        height: imageLoad.value.height * imgCanvasSizeCount.value,
        canvasWidth: canvas.value.width,
        canvasHeight: canvas.value.height,
      });

      context.drawImage(
        imageLoad.value,
        0,
        0,
        imageLoad.value.width * imgCanvasSizeCount.value,
        imageLoad.value.height * imgCanvasSizeCount.value
      );

      for (let i = 0; i < rectList.value.length; i++) {
        if (!rectList.value[i].checked) {
          continue;
        }
        const { color, S_X, S_Y, E_X, E_Y, id } = rectList.value[i];
        if (grabUpdatePoint.value === id) {
          continue;
        }
        context.strokeStyle = color;
        context.strokeRect(S_X, S_Y, E_X - S_X, E_Y - S_Y);
      }

      if (!_.isEmpty(targetBox.value)) {
        if (grabUpdatePoint.value === null && targetBox.value.checked) {
          const { color, S_X, S_Y, E_X, E_Y, id } = targetBox.value;
          context.strokeStyle = color;
          context.strokeRect(S_X, S_Y, E_X - S_X, E_Y - S_Y);
        }
      }
    }

    // 이미지 업로드
    function loadImageFile() {
      const imgSrc = URL.createObjectURL(targetFile.value);
      imageLoad.value = new Image();
      imageLoad.value.src = imgSrc;
      imageLoad.value.onload = () => {
        canvas.value.width = 935;
        canvas.value.height = 550;

        const imgWidthCount = canvas.value.width / imageLoad.value.width;
        const imgHeightCount = canvas.value.height / imageLoad.value.height;
        imgCanvasSizeCount.value =
          imgWidthCount < imgHeightCount ? imgWidthCount : imgHeightCount;

        canvas.value.width = imageLoad.value.width * imgCanvasSizeCount.value;
        canvas.value.height = imageLoad.value.height * imgCanvasSizeCount.value;

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

      const data =
        (clientX - bound.left - bw) *
        (canvas.value.width / (bound.width - bw * 2));

      return data < 0 ? 0 : data;
    }

    // y 좌표
    function canvasY(clientY) {
      const bound = canvas.value.getBoundingClientRect();
      const bw = 0; // 임시

      const data =
        (clientY - bound.top - bw) *
        (canvas.value.height / (bound.height - bw * 2));

      return data < 0 ? 0 : data;
    }

    const lineWidth = ref(2);

    watch(lineWidth, () => {
      ImagePrinting();
    });

    // 그리자!
    function startDraw(event) {
      end_x.value = canvasX(event.clientX);
      end_y.value = canvasY(event.clientY);
      const context = canvas.value.getContext("2d");
      context.lineWidth = lineWidth.value;
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

    // x, y 좌표 큰값 혼동 막기
    // 좌하를 잡고 수정을 하면 start_x의 좌상의 x값이 들어감 => 큰값이 들어간다는 의미
    // 그러면 hoverEdgePointer, findMoveBoxTarget의 if문이 이상하게 바뀜
    function bigValue(a, b) {
      if (a > b) {
        return [a, b];
      } else {
        return [b, a];
      }
    }

    // 이동하고자 하는 박스 찾기
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

    // 움직이자!
    function moveBox(event) {
      const end_x = canvasX(event.clientX);
      const end_y = canvasY(event.clientY);
      const target = _.find(rectList.value, { id: targetMoveIndex.value });

      const newData = _.cloneDeep(target);

      const width = newData.E_X - newData.S_X;
      const height = newData.E_Y - newData.S_Y;

      newData.S_X += thirdToFixed(end_x - start_x.value);

      newData.S_Y += thirdToFixed(end_y - start_y.value);

      newData.E_X += thirdToFixed(end_x - start_x.value);

      newData.E_Y += thirdToFixed(end_y - start_y.value);

      const { S_X, S_Y, E_X, E_Y } = newData;
      // 사진 넘어가지 말자!
      let isZero = false;

      if (S_X < 0) {
        target.S_X = 0;
        target.E_X = width;
        isZero = true;
      }
      if (S_Y < 0) {
        target.S_Y = 0;
        target.E_Y = height;
        isZero = true;
      }
      if (E_X > canvas.value.width) {
        target.E_X = canvas.value.width;
        target.S_X = target.E_X - width;
        isZero = true;
      }
      if (E_Y > canvas.value.height) {
        target.E_Y = canvas.value.height;
        target.S_Y = target.E_Y - height;
        isZero = true;
      }

      if (!isZero) {
        target.S_X = S_X;
        target.S_Y = S_Y;
        target.E_X = width + S_X;
        // target.E_X = E_X;
        // target.E_Y = E_Y;
        target.E_Y = height + S_Y;
      }
      start_x.value = end_x;
      start_y.value = end_y;

      ImagePrinting();
    }

    // 클릭 했을 때 움직이는 박스일까?
    function findMoveBox(event) {
      const x = canvasX(event.clientX);
      const y = canvasY(event.clientY);
      const targetItemIndex = findMoveBoxTarget(x, y);
      console.log(targetItemIndex);
      if (targetItemIndex !== null) {
        start_x.value = canvasX(event.clientX);
        start_y.value = canvasY(event.clientY);
        targetMoveIndex.value = targetItemIndex;
        return true;
      }
      return false;
    }

    watch(ishandleBtn, () => {
      if (ishandleBtn.value) {
        isgrabUpdatePoint.value = `url(${penImg}), auto`;
      }
    });

    const userPointer = ref({
      x: 0,
      y: 0,
    });

    function mousemove(event) {
      userPointer.value.x = canvasX(event.clientX);
      userPointer.value.y = canvasY(event.clientY);

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
        if (!wcode.value) {
          if (findMoveBox(event)) {
            ishandleBtn.value = true;
          }
          return;
        }
        start_x.value = canvasX(event.clientX);
        start_y.value = canvasY(event.clientY);
        isStartDraw.value = true;
      }
    }

    // 자릿수 변환 (반올림)
    function thirdToFixed(a, b) {
      // return Number((a / b).toFixed(5));
      // return a / b;
      return a;
    }

    function mouseup(event) {
      if (ishandleBtn.value) {
        // 이동 완료
        targetMoveIndex.value = null;
        ImagePrinting();
      } else {
        // 그리기 완료
        isStartDraw.value = false;

        if (
          [start_x.value, start_y.value, end_x.value, end_y.value].includes(-1)
        )
          return;

        const data = {
          color: targetUpdateColor.value
            ? targetUpdateColor.value
            : colorList.value[colorIndex],
          S_X: thirdToFixed(start_x.value),
          S_Y: thirdToFixed(start_y.value),
          E_X: thirdToFixed(end_x.value),
          E_Y: thirdToFixed(end_y.value),
          id:
            grabUpdatePoint.value === null ? colorIndex : grabUpdatePoint.value,
        };

        if (data.S_X > data.E_X) {
          const temp = data.E_X;
          data.E_X = data.S_X;
          data.S_X = temp;
        }

        if (data.S_Y > data.E_Y) {
          const temp = data.E_Y;
          data.E_Y = data.S_Y;
          data.S_Y = temp;
        }

        if (targetUpdateColor.value) {
          emit("updateRect", grabUpdatePoint.value, data);
          targetUpdateColor.value = false;
          isgrabUpdatePoint.value = `url(${penImg}), auto`;
          grabUpdatePoint.value = null;
        } else {
          if (wcode.value) {
            emit("addRect", data);
            colorIndex += 1;
            if (colorIndex > 500) {
              colorIndex = 0;
            }
          }
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

    // 모서리 잡기
    function pointerGrab(x, y, target_x, target_y) {
      if (wcode.value) return false;
      // const value = (2 * imageLoad.value.width) / canvas.value.width;
      const value = 5;

      if (target_x - value <= x && x <= target_x + value) {
        if (target_y - value <= y && y <= target_y + value) {
          const context = canvas.value.getContext("2d");
          context.lineWidth = lineWidth.value;
          context.fillStyle = "red";
          context.fillRect(
            target_x - value,
            target_y - value,
            value + value,
            value + value
          );
          return true;
        }
      }
      ImagePrinting();
      return false;
    }

    const grabUpdatePoint = ref(null);
    const isgrabUpdatePoint = ref(`url(${penImg}), auto`);
    const targetUpdateColor = ref(false);

    function hoverEdgePointer(event) {
      const x = canvasX(event.clientX);
      const y = canvasY(event.clientY);

      for (let i = 0; i < rectList.value.length; i++) {
        const item = rectList.value[i];
        let { color, S_X, S_Y, E_X, E_Y, id } = item;

        let [a, b] = bigValue(S_X, E_X);

        S_X = b;
        E_X = a;

        [a, b] = bigValue(S_Y, E_Y);
        S_Y = b;
        E_Y = a;

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
      if (!wcode.value) {
        isgrabUpdatePoint.value = "pointer";
      } else {
        isgrabUpdatePoint.value = `url(${penImg}), auto`;
      }
      return false;
    }

    function clickUpdateBox(event) {
      const x = canvasX(event.clientX);
      const y = canvasY(event.clientY);

      for (let i = 0; i < rectList.value.length; i++) {
        const item = rectList.value[i];
        const { color, S_X, S_Y, E_X, E_Y, id } = item;

        // 좌상
        const leftHeight = pointerGrab(x, y, S_X, S_Y);
        if (leftHeight) {
          start_x.value = E_X;
          start_y.value = E_Y;
          grabUpdatePoint.value = id;
          targetUpdateColor.value = color;
          return true;
        }

        //우상
        const rightHeight = pointerGrab(x, y, E_X, S_Y);
        if (rightHeight) {
          start_x.value = S_X;
          start_y.value = E_Y;
          grabUpdatePoint.value = id;
          targetUpdateColor.value = color;
          return true;
        }

        //좌하
        const leftDown = pointerGrab(x, y, S_X, E_Y);
        if (leftDown) {
          start_x.value = E_X;
          start_y.value = S_Y;
          grabUpdatePoint.value = id;
          isgrabUpdatePoint.value = "pointer";
          targetUpdateColor.value = color;
          return true;
        }

        //우하
        const rightDown = pointerGrab(x, y, E_X, E_Y);
        if (rightDown) {
          start_x.value = S_X;
          start_y.value = S_Y;
          grabUpdatePoint.value = id;
          targetUpdateColor.value = color;
          return true;
        }
      }
      if (!wcode.value) {
        isgrabUpdatePoint.value = "pointer";
      } else {
        isgrabUpdatePoint.value = `url(${penImg}), auto`;
      }
      grabUpdatePoint.value = null;
      return false;
    }

    watch(targetBox, () => {
      if (_.isEmpty(targetBox.value)) return;
      const context = canvas.value.getContext("2d");

      if (grabUpdatePoint.value !== null) return;

      const { color, S_X, S_Y, E_X, E_Y, id } = targetBox.value;
      context.strokeStyle = color;
      context.strokeRect(S_X, S_Y, E_X - S_X, E_Y - S_Y);
    });

    window.addEventListener("mouseup", () => {
      if (ishandleBtn.value || isStartDraw.value) {
        ishandleBtn.value = false;
        mouseup();
      }
    });

    const wcode = ref(false);

    watch(wcode, () => {
      if (!wcode.value) {
        isgrabUpdatePoint.value = "pointer";
      } else {
        isgrabUpdatePoint.value = `url(${penImg}), auto`;
      }
    });

    window.addEventListener("keydown", (e) => {
      const { keyCode } = e;
      if (keyCode === 87) {
        ImagePrinting();
        wcode.value = true;
      } else if (keyCode === 27) {
        ImagePrinting();
        wcode.value = false;
      }
    });

    watch(ishandleBtn, () => {
      wcode.value = false;
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
      getByteSize,
      isgrabUpdatePoint,
      userPointer,
      handleFile,
      lineWidth,
      imageLoad,
      imgCanvasSizeCount,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/main/img_load.scss";
</style>
