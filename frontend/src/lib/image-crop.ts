import type { Area } from "react-easy-crop";

export async function createCroppedJpeg(
  file: File,
  area: Area,
  width = 1600,
  height = 900,
): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare cropped image");
    context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Could not export cropped image")),
        "image/jpeg",
        0.9,
      );
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
