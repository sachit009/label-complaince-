/**
 * Live Camera Viewfinder & WebRTC Controller for LM Scan
 */

class LiveCameraController {
  constructor(videoElement, onCaptureCallback) {
    this.video = videoElement;
    this.onCapture = onCaptureCallback;
    this.stream = null;
    this.facingMode = 'environment';
    this.torchEnabled = false;
  }

  async startCamera() {
    this.stopCamera();
    try {
      const constraints = {
        video: {
          facingMode: { ideal: this.facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();
      return true;
    } catch (err) {
      console.warn('Could not access live camera:', err);
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  async switchCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    return await this.startCamera();
  }

  async toggleTorch() {
    if (!this.stream) return false;
    const track = this.stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    
    if (capabilities.torch) {
      this.torchEnabled = !this.torchEnabled;
      await track.applyConstraints({
        advanced: [{ torch: this.torchEnabled }]
      });
      return this.torchEnabled;
    }
    return null;
  }

  captureFrame(maxDim = 1280, quality = 0.85) {
    if (!this.video || this.video.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    let width = this.video.videoWidth;
    let height = this.video.videoHeight;

    const scale = Math.min(1, maxDim / Math.max(width, height));
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    
    // Create thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 120;
    thumbCanvas.height = 120;
    const tCtx = thumbCanvas.getContext('2d');
    tCtx.drawImage(canvas, 0, 0, 120, 120);
    const thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

    return {
      image: dataUrl,
      thumbnail: thumbUrl
    };
  }
}

window.LiveCameraController = LiveCameraController;
