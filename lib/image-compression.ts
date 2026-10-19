/**
 * Compresses an image file client-side using an HTML5 Canvas.
 * Ensures that high-resolution phone camera photos (5MB - 20MB) are resized
 * down to max 1000px and converted to a lightweight JPEG (< 300KB)
 * to avoid Vercel 4.5MB request payload limit and speed up uploads.
 */
export async function compressImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82
): Promise<File> {
  // If SVG or GIF, preserve as is
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // If already under 250KB and standard jpeg/png, keep original
  if (file.size < 250 * 1024 && (file.type === "image/jpeg" || file.type === "image/png")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
              const compressedFile = new File([blob], newFileName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
