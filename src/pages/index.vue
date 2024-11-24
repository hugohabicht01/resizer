<script setup lang="ts" generic="T extends any, O extends any">
defineOptions({
  name: "IndexPage",
});

const canvas = ref<HTMLCanvasElement | null>();
const image = ref<HTMLImageElement | null>(null);
const downloadLink = ref<HTMLAnchorElement | null>(null);

const fileChanged = async (event: Event) => {
  const { files } = event.target as HTMLInputElement;

  const imageFile = files?.[0];
  if (!imageFile) {
    return;
  }
  image.value = new Image();

  const imageSrc = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject("bad loading result");
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(imageFile);
  });

  image.value.src = imageSrc;
  await new Promise<void>((resolve, reject) => {
    if (!image.value) return;
    image.value.onload = () => resolve();
  });
  processImage();
};

const processImage = () => {
  if (!canvas.value || !image.value) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // Fill the canvas.value with a white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);

  const { xOffset, yOffset, targetWidth, targetHeight } = calcDimensions(
    image.value,
  );
  // Draw the image centered in the canvas.value
  ctx.drawImage(image.value, xOffset, yOffset, targetWidth, targetHeight);

  // Create a downloadable file
  canvas.value.toBlob((blob) => {
    if (!blob || !downloadLink.value) return;
    const url = URL.createObjectURL(blob);
    downloadLink.value.href = url;
  }, "image/jpeg");
};

const calcDimensions = (image: HTMLImageElement) => {
  const aspectRatio = image.width / image.height;
  let adjustedHeight = 1350 - 175;

  let targetWidth, targetHeight;

  // Determine the target dimensions while preserving aspect ratio
  if (aspectRatio > 1080 / adjustedHeight) {
    // Image is wider than the adjusted canvas aspect ratio
    targetWidth = 1080;
    targetHeight = 1080 / aspectRatio;
  } else {
    // Image is taller than or matches the adjusted canvas aspect ratio
    targetHeight = adjustedHeight;
    targetWidth = adjustedHeight * aspectRatio;
  }

  // Calculate the position to center the image on the canvas.value
  const xOffset = (1080 - targetWidth) / 2;
  const yOffset = (1350 - targetHeight) / 2;
  return { xOffset, yOffset, targetWidth, targetHeight };
};
</script>

<template>
  <div flex flex-col items-center>
    <h1>Resize and Embed Image</h1>
    <p>Select a JPEG file to resize and embed into a 1350x1080 canvas.</p>
    <input
      class="p-4"
      type="file"
      id="fileInput"
      accept="image/jpeg"
      @change="fileChanged"
    />
    <a ref="downloadLink" download="output.jpeg" class="btn"
      >Download Processed Image</a
    >
    <canvas
      class="p-4 shadow-xl"
      id="canvas"
      height="1350"
      width="1080"
      ref="canvas"
    ></canvas>
    <br />
  </div>
</template>
