/** Côté le plus long de la photo stockée : largement suffisant pour l'impression d'un CV. */
const MAX_PHOTO_SIZE = 800;

export class PhotoError extends Error {}

/** Redimensionne la photo dans le navigateur et la convertit en JPEG. */
export async function prepareProfilePhoto(file: Blob): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new PhotoError('notAnImage');
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new PhotoError('unreadable');
  });
  const scale = Math.min(1, MAX_PHOTO_SIZE / Math.max(bitmap.width, bitmap.height));
  const jpeg = drawAsJpeg(bitmap, bitmap.width * scale, bitmap.height * scale);
  bitmap.close();
  return jpeg;
}

/** Photo stockable à partir d'une image du site, SVG compris (que createImageBitmap refuse). */
export async function rasterizePhoto(url: string): Promise<Blob> {
  const image = new Image();
  image.src = url;
  await image.decode();
  const scale = MAX_PHOTO_SIZE / Math.max(image.naturalWidth, image.naturalHeight);
  return drawAsJpeg(image, image.naturalWidth * scale, image.naturalHeight * scale);
}

function drawAsJpeg(source: CanvasImageSource, width: number, height: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new PhotoError('encoding'))),
      'image/jpeg',
      0.9,
    ),
  );
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Décodage manuel : `fetch(dataUrl)` serait bloqué par la CSP (connect-src 'self'). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64 = ''] = dataUrl.split(',');
  const type = /data:([^;]+)/.exec(header)?.[1] ?? 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}
