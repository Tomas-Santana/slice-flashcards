import type { AudioRecorderProps } from "./AudioRecorder.types";
import html from "@/lib/render";

export default class AudioRecorder extends HTMLElement {
  static props = {
    onRecordingComplete: { type: "function", default: null },
  };
  props: AudioRecorderProps;

  private $canvas: HTMLCanvasElement | null = null;
  private $recordBtn: HTMLButtonElement | null = null;
  private $stopBtn: HTMLButtonElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private animationId: number | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording: boolean = false;

  constructor(props: AudioRecorderProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);

    this.$canvas = this.querySelector(".ar-canvas") as HTMLCanvasElement | null;
    this.$recordBtn = this.querySelector(
      ".ar-record"
    ) as HTMLButtonElement | null;
    this.$stopBtn = this.querySelector(".ar-stop") as HTMLButtonElement | null;

    if (this.$canvas) {
      this.canvasCtx = this.$canvas.getContext("2d");
      // Set initial canvas size to fill remaining width
      this.$canvas.width = 300;
      this.$canvas.height = 40;
    }

    // Wire buttons
    if (this.$recordBtn) {
      this.$recordBtn.addEventListener("click", () => this.startRecording());
    }
    if (this.$stopBtn) {
      this.$stopBtn.addEventListener("click", () => this.stopRecording());
      this.$stopBtn.disabled = true;
    }

    // Request microphone access
    this.requestMicrophoneAccess();
  }

  async getTemplate() {
    // Build SButton components with SIcon content
    const micIcon = await window.slice.build("SIcon", {
      name: "microphone",
      // style: 'solid',
      class: "",
    });

    const recordBtn = await window.slice.build("SButton", {
      content: micIcon,
      size: "icon",
      class: "ar-record",
    });

    const stopIcon = await window.slice.build("SIcon", {
      name: "stop",
      style: "solid",
      class: "",
    });

    const stopBtn = await window.slice.build("SButton", {
      content: stopIcon,
      size: "icon",
      class: "ar-stop",
    });

    return html`
      <div class="audiorecorder flex items-center gap-2 p-2  bg-white">
        ${recordBtn} ${stopBtn}
        <canvas class="ar-canvas flex-1 h-10 rounded-md"></canvas>
      </div>
    `;
  }

  async requestMicrophoneAccess() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error(
        "MediaDevices.getUserMedia() not supported on your browser!"
      );
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.setupVisualizer(this.stream);
      // Draw initial idle state
      this.drawIdleCanvas();
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  }

  setupVisualizer(stream: MediaStream) {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }

    const source = this.audioCtx.createMediaStreamSource(stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;

    const bufferLength = this.analyser.fftSize;
    this.dataArray = new Uint8Array(bufferLength);

    source.connect(this.analyser);

    // Don't start drawing automatically - wait for recording to start
  }

  drawIdleCanvas() {
    if (!this.canvasCtx || !this.$canvas) return;

    const WIDTH = this.$canvas.width;
    const HEIGHT = this.$canvas.height;

    // Clear canvas with idle background
    this.canvasCtx.fillStyle = "rgb(245, 245, 245)";
    this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw flat line in the middle
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = "rgb(200, 200, 200)";
    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(0, HEIGHT / 2);
    this.canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    this.canvasCtx.stroke();
  }

  drawVisualizer() {
    if (!this.canvasCtx || !this.$canvas || !this.analyser || !this.dataArray)
      return;

    // Only continue animation if recording
    if (!this.isRecording) {
      this.drawIdleCanvas();
      return;
    }

    this.animationId = requestAnimationFrame(() => this.drawVisualizer());

    this.analyser.getByteTimeDomainData(this.dataArray);

    const WIDTH = this.$canvas.width;
    const HEIGHT = this.$canvas.height;

    // Clear canvas
    this.canvasCtx.fillStyle = "rgb(245, 245, 245)";
    this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw waveform
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = "rgb(0, 0, 0)";
    this.canvasCtx.beginPath();

    const sliceWidth = WIDTH / this.dataArray.length;
    let x = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;

      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    this.canvasCtx.stroke();
  }

  startRecording() {
    if (!this.stream) {
      console.error("No microphone stream available");
      return;
    }

    this.chunks = [];

    // Determine the best supported audio format
    // Prefer OGG over WebM as it handles duration metadata better
    let mimeType = "audio/ogg;codecs=opus";
    if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
      mimeType = "audio/ogg;codecs=opus";
    } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
      mimeType = "audio/ogg";
    } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      mimeType = "audio/webm;codecs=opus";
    } else if (MediaRecorder.isTypeSupported("audio/webm")) {
      mimeType = "audio/webm";
    } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
      mimeType = "audio/mp4";
    }

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, {
        type: this.mediaRecorder!.mimeType,
      });
      const mimeType = this.mediaRecorder!.mimeType;
      this.chunks = [];

      if (this.props.onRecordingComplete) {
        this.props.onRecordingComplete(blob, mimeType);
      }
    };

    // Start recording with timeslices to ensure proper duration metadata
    // Using 100ms slices helps WebM files have correct duration
    this.mediaRecorder.start(100);

    // Update button states
    if (this.$recordBtn) {
      this.$recordBtn.disabled = true;
      this.$recordBtn.classList.add("opacity-50");
    }
    if (this.$stopBtn) {
      this.$stopBtn.disabled = false;
      this.$stopBtn.classList.remove("opacity-50");
    }

    // Start visualizer animation
    this.isRecording = true;
    this.drawVisualizer();
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    // Stop visualizer animation
    this.isRecording = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.drawIdleCanvas();

    // Update button states
    if (this.$recordBtn) {
      this.$recordBtn.disabled = false;
      this.$recordBtn.classList.remove("opacity-50");
    }
    if (this.$stopBtn) {
      this.$stopBtn.disabled = true;
      this.$stopBtn.classList.add("opacity-50");
    }
  }

  update() {
    // Component update logic (can be async)
  }

  disconnectedCallback() {
    // Stop animation
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Stop recording if active
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    // Stop stream tracks
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    // Close audio context
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

customElements.define("slice-audiorecorder", AudioRecorder);
