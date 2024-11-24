<script setup lang="ts" generic="T extends any, O extends any">
import {
  type ImageRendererProps,
  type ImageRendererEmits,
} from "~/composables/renderer";

const canvas = ref<HTMLCanvasElement | null>();
const ctx = ref<CanvasRenderingContext2D | null>();
const image = ref<HTMLImageElement | null>(null);

const height = ref<number>(1);
const width = ref<number>(1);

const props = defineProps<ImageRendererProps>();
const emits = defineEmits<ImageRendererEmits>();

const scaleFactor = 0.5;
const scaleString = computed(() => `scale(${scaleFactor})`);

const addPixels = (val: number) => `${val}px`;

const scaledHeight = computed(() =>
  addPixels(props.canvasHeight * scaleFactor),
);
const scaledWidth = computed(() => addPixels(props.canvasWidth * scaleFactor));

const drawLocation = computed(() => image.value && calcDimensions(image.value));

onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext("2d");
  }
  if (props.file) {
    loadImage();
  }
});

async function loadImage() {
  image.value = new Image();

  const imageSrc = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject("couldn't read file");
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(props.file);
  });

  image.value.src = imageSrc;
  await new Promise<void>((resolve, reject) => {
    if (!image.value) return;
    image.value.onload = () => resolve();
  });
  processImage();
}

const aspectRatio = computed(() => {
  if (!image.value) return 0;
  return width.value / height.value;
});

const wantedHeight = computed(() => {
  if (!props.wantedHeight) {
    return null;
  }
  return props.wantedHeight[orientation.value];
});

const calcDimensions = (image: HTMLImageElement) => {
  height.value = image.height;
  width.value = image.width;

  const aspectRatio = image.width / image.height;
  let adjustedHeight = wantedHeight.value ?? 600;

  let targetWidth, targetHeight;

  if (aspectRatio > props.canvasWidth / adjustedHeight) {
    // Image is wider than the adjusted canvas aspect ratio
    targetWidth = props.canvasWidth;
    targetHeight = props.canvasWidth / aspectRatio;
  } else {
    // Image is taller than or matches the adjusted canvas aspect ratio
    targetHeight = adjustedHeight;
    targetWidth = adjustedHeight * aspectRatio;
  }

  // Determine the target dimensions while preserving aspect ratio

  // Calculate the position to center the image on the canvas.value
  const xOffset = (props.canvasWidth - targetWidth) / 2;
  const yOffset = (props.canvasHeight - targetHeight) / 2;
  return { xOffset, yOffset, targetWidth, targetHeight };
};

type OrientationType = "landscape" | "portrait" | "square";
const orientation = computed((): OrientationType => {
  if (aspectRatio.value > 1) {
    return "landscape";
  } else if (aspectRatio.value === 1) {
    return "square";
  } else {
    return "portrait";
  }
});

const processImage = async () => {
  if (!canvas.value || !image.value?.src || !drawLocation.value || !ctx.value)
    return;

  // Clear the canvas
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

  ctx.value.fillStyle = props.backgroundColour;
  ctx.value.imageSmoothingEnabled = true;
  ctx.value.imageSmoothingQuality = "high";
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height);

  // Draw the image centered in the canvas.value
  ctx.value.drawImage(
    image.value,
    drawLocation.value.xOffset,
    drawLocation.value.yOffset,
    drawLocation.value.targetWidth,
    drawLocation.value.targetHeight,
  );
  // const link = await genDownloadLink();
  // emits("onLinkChanged", link);
};

const genDownloadLink = async () => {
  // Create a downloadable file
  return new Promise<string>((res, rej) => {
    if (!canvas.value) {
      return;
    }
    canvas.value.toBlob((blob) => {
      if (!blob) {
        rej("couldnt access blob");
        return;
      }
      const url = URL.createObjectURL(blob);
      res(url);
      return;
    }, "image/jpeg");
  });
};

useEventListener(document, genDownloadEvent, (evt) => {
  console.log(`Gonna start download for ${props.downloadName}`);
  genDownloadLink().then((link) => {
    const aTag = document.createElement("a");
    aTag.href = link;
    aTag.download = props.downloadName;
    aTag.click();
  });
});

watch(() => props.file, loadImage);
watch(() => wantedHeight, processImage, { deep: true });
watch(() => props.backgroundColour, processImage);
</script>

<template>
  <div
    class="overflow-hidden m-8"
    :style="{
      width: scaledWidth,
      height: scaledHeight,
    }"
  >
    <canvas
      class="origin-top-left"
      id="canvas"
      :style="{ transform: scaleString }"
      :height="canvasHeight"
      :width="canvasWidth"
      ref="canvas"
    ></canvas>
  </div>
</template>
