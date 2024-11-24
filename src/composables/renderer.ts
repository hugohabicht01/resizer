export type ImageRendererProps = {
  canvasHeight: number;
  canvasWidth: number;
  backgroundColour: string;
  wantedHeight: OrientationSizes;
  downloadName: string;
  file: File;
};

export type OrientationSizes = {
  landscape: number;
  portrait: number;
  square: number;
};

export type ImageRendererEmits = {
  onLinkChanged: [value: string];
};

export const genDownloadEvent = "genDownloadEvent";
