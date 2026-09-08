/**
 * Image Preprocessing & Optimization Utility for LM Scan
 */

window.ImagePreprocessor = {
  async processFile(file, maxDim = 1280, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const result = this.optimizeImage(img, maxDim, quality);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error("Failed to decode uploaded image"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },

  optimizeImage(img, maxDim = 1280, quality = 0.85) {
    const canvas = document.createElement('canvas');
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    const scale = Math.min(1, maxDim / Math.max(width, height));
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const fullDataUrl = canvas.toDataURL('image/jpeg', quality);

    // Create thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 120;
    thumbCanvas.height = 120;
    const tCtx = thumbCanvas.getContext('2d');
    
    // Fit center crop
    const minSide = Math.min(canvas.width, canvas.height);
    const sx = (canvas.width - minSide) / 2;
    const sy = (canvas.height - minSide) / 2;
    tCtx.drawImage(canvas, sx, sy, minSide, minSide, 0, 0, 120, 120);
    const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

    return {
      image: fullDataUrl,
      thumbnail: thumbDataUrl,
      width: canvas.width,
      height: canvas.height
    };
  }
};
