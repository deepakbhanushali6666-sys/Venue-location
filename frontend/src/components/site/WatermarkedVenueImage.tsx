import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { VenuePhotoWatermark } from "@/components/site/VenuePhotoWatermark";

const watermarkedImageCache = new Map<string, Promise<string>>();
const WATERMARK_TEXT = "VENUES LOCATION";

function isAlreadyWatermarked(src: string) {
  return /\/wm-[^/?]+\.jpg(?:\?|$)|%2fwm-[^/?]+\.jpg/i.test(src);
}

function createWatermarkedImage(src: string): Promise<string> {
  const cached = watermarkedImageCache.get(src);
  if (cached) return cached;

  const result = new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not create a canvas context");

        context.drawImage(image, 0, 0);
        let fontSize = Math.min(canvas.width * 0.07, canvas.height * 0.12, 84);
        context.font = `bold ${fontSize}px sans-serif`;
        fontSize *= Math.min(1, (canvas.width * 0.82) / context.measureText(WATERMARK_TEXT).width);
        context.font = `bold ${fontSize}px sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.shadowColor = "rgba(0, 0, 0, 0.6)";
        context.shadowBlur = Math.max(2, fontSize * 0.08);
        context.fillStyle = "rgba(255, 255, 255, 0.46)";
        context.fillText(WATERMARK_TEXT, canvas.width / 2, canvas.height / 2);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error(`Could not load venue photo: ${src}`));
    image.src = src;
  });

  watermarkedImageCache.set(src, result);
  void result.catch(() => watermarkedImageCache.delete(src));
  return result;
}

export function WatermarkedVenueImage({ src, ...imageProps }: ImgHTMLAttributes<HTMLImageElement>) {
  const [watermarkedSrc, setWatermarkedSrc] = useState<string>();
  const alreadyWatermarked = src ? isAlreadyWatermarked(src) : false;

  useEffect(() => {
    let active = true;
    setWatermarkedSrc(undefined);

    if (!src || alreadyWatermarked) return;
    void createWatermarkedImage(src)
      .then((imageSrc) => {
        if (active) setWatermarkedSrc(imageSrc);
      })
      .catch((error: unknown) => {
        console.error("Could not add the venue photo watermark", error);
      });

    return () => {
      active = false;
    };
  }, [alreadyWatermarked, src]);

  return (
    <>
      <img {...imageProps} src={watermarkedSrc ?? src} />
      {!watermarkedSrc && !alreadyWatermarked && <VenuePhotoWatermark src={src} />}
    </>
  );
}
