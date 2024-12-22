<script setup lang="ts" generic="T extends any, O extends any">
import type { OrientationSizes } from "~/composables/renderer";
import {
  createZipFromObjectUrls,
  downloadObjectUrl,
  type ImageLink,
} from "~/utils/compression";
defineOptions({
  name: "IndexPage",
});

const fileList = ref<File[]>([]);

const wantedHeight = reactive<OrientationSizes>({
  landscape: 600,
  portrait: 1350 - 175,
  square: 1350 - 200,
});
const colour = ref("#ffffff");
const debouncedColour = debouncedRef(colour, 100);

const fileChanged = async (event: Event) => {
  const { files } = event.target as HTMLInputElement;

  if (files && files?.length > 0) {
    const arr = [];
    for (let i = 0; i < files.length; i++) {
      arr.push(files.item(i)!);
    }
    fileList.value = arr;
  }
};

const genDownloads = () => {
  if (fileList.value.length === 0) {
    return;
  }
  const downloadEvent = new CustomEvent(genDownloadEvent);
  document.dispatchEvent(downloadEvent);
  // put the focus somewhere else, so that pressing enter doesn't call this again
  document.body.focus();
};

const links = ref<ImageLink[]>([]);

const linkChanged = (link: string, filename: string) => {
  links.value.push({ objectUrl: link, filename });
};

watch(
  links,
  () => {
    // when all componenents have successfully generated their links
    if (links.value.length === fileList.value.length) {
      if (links.value.length === 1) {
        const { objectUrl, filename } = links.value[0];
        downloadObjectUrl(objectUrl, filename);
        return;
      }
      createZipFromObjectUrls(links.value).then((zip) =>
        downloadObjectUrl(zip, "images.zip"),
      );
    }
  },
  { deep: true },
);
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
      multiple="true"
      @change="fileChanged"
    />
    <label for="wantedHeightPortrait"
      >Portrait height: {{ wantedHeight.portrait }}</label
    >
    <input
      type="range"
      id="wantedHeightPortrait"
      v-model.number="wantedHeight.portrait"
      min="100"
      max="1350"
      class="m-4 w-[400px]"
    />
    <label for="wantedHeightLandscape"
      >Landscape height: {{ wantedHeight.landscape }}</label
    >
    <input
      type="range"
      id="wantedHeightLandscape"
      v-model.number="wantedHeight.landscape"
      min="100"
      max="1350"
      class="m-4 w-[400px]"
    />
    <input type="color" v-model="colour" />

    <label for="wantedHeightSquare"
      >Square height: {{ wantedHeight.square }}</label
    >
    <input
      type="range"
      id="wantedHeightSquare"
      v-model.number="wantedHeight.square"
      min="100"
      max="1350"
      class="m-4 w-[400px]"
    />
    <button
      class="btn disabled:cursor-not-allowed"
      @click="genDownloads"
      :disabled="fileList.length === 0"
    >
      Download
    </button>
    <div class="grid grid-cols-2">
      <template v-for="file in fileList" :id="file.name">
        <ImageRenderer
          :background-colour="debouncedColour"
          :file="file"
          :canvas-height="1350"
          :canvas-width="1080"
          :wanted-height="wantedHeight"
          :download-name="file.name"
          @onLinkChanged="(link) => linkChanged(link, file.name)"
        />
      </template>
    </div>
  </div>
</template>
