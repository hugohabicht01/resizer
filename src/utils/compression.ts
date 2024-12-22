import JSZip from "jszip";

export type ImageLink = {
  objectUrl: string;
  filename: string;
};

export async function createZipFromObjectUrls(
  objectUrls: ImageLink[],
): Promise<string> {
  const zip = new JSZip();

  for (const link of objectUrls) {
    const { objectUrl, filename } = link;
    try {
      // Fetch the data from the object URL
      const response = await fetch(objectUrl);
      const blob = await response.blob();

      // Add the file to the ZIP archive
      zip.file(filename, blob);
    } catch (error) {
      console.error(
        `Failed to fetch or add file from URL: ${objectUrl}`,
        error,
      );
      throw error;
    }
  }

  // Generate the ZIP file as a Blob
  const zipBlob = await zip.generateAsync({ type: "blob" });

  // Create an Object URL for the ZIP file
  return URL.createObjectURL(zipBlob);
}

export function downloadObjectUrl(objectUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  //
  // Cleanup
  URL.revokeObjectURL(objectUrl);
}
