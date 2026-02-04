import { API_BASE_URL } from "@/lib/constants";

export const normalizeMediaUrl = (url: string) =>
  url.startsWith(API_BASE_URL) ? url.replace(API_BASE_URL, "") : url;

export const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export const getCroppedBlob = async (
  imageSrc: string,
  area: { width: number; height: number; x: number; y: number } | null
) => {
  if (!area) return null;
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
};
