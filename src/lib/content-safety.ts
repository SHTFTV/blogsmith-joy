// Client-side explicit-content screening for images, using nsfwjs — a
// TensorFlow.js model that runs entirely in the browser. No API key, no
// account, no per-image cost, and no photo ever leaves the guest's device
// to be "moderated" by a third party.
//
// Loaded via CDN <script> tags at runtime, deliberately NOT as an npm
// import: importing nsfwjs/@tensorflow/tfjs directly pulled ~40MB of
// bundled model weights into this project's server-side render bundle
// (confirmed by an actual build, not assumed) — even though the code only
// ever runs in a browser event handler. That's a real problem on
// size-limited serverless/edge platforms, not just bundle bloat. Loading
// via <script> tag keeps these libraries completely outside the Vite/Nitro
// module graph, so the server bundle is never touched by them at all.
//
// Honest tradeoff either way: the guest's browser still downloads ~5-8MB of
// model weights the first time they pick a photo, since that's inherent to
// doing real on-device classification for free. It's cached after first
// load, but a guest on weak venue wifi may notice a delay before their
// first upload starts. Worth knowing before a real event, not something to
// hide.
//
// Honest limitation: this only screens still images. Video frames are not
// sampled/checked — video stays manual-review-only for the planner.

const TFJS_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
const NSFWJS_URL = "https://cdn.jsdelivr.net/npm/nsfwjs@4.3.0/dist/browser/nsfwjs.min.js";

declare global {
  interface Window {
    tf?: unknown;
    nsfwjs?: {
      load: (model?: string) => Promise<{
        classify: (input: unknown) => Promise<{ className: string; probability: number }[]>;
      }>;
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

let modelPromise: ReturnType<typeof loadModel> | null = null;

async function loadModel() {
  if (!window.tf) await loadScript(TFJS_URL);
  if (!window.nsfwjs) await loadScript(NSFWJS_URL);
  if (!window.nsfwjs) throw new Error("nsfwjs failed to load");
  return window.nsfwjs.load("MobileNetV2");
}

function getModel() {
  if (!modelPromise) modelPromise = loadModel();
  return modelPromise;
}

const BLOCK_THRESHOLD = 0.75; // how confident the model must be before we block

export type SafetyResult = { safe: true } | { safe: false; reason: string };

export async function screenImageFile(file: File): Promise<SafetyResult> {
  try {
    const model = await getModel();
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);

    const predictions = await model.classify(canvas);
    const flagged = predictions.find(
      (p) =>
        (p.className === "Porn" || p.className === "Hentai") && p.probability > BLOCK_THRESHOLD,
    );
    if (flagged) {
      return {
        safe: false,
        reason: "This image was flagged by automatic content screening and can't be uploaded.",
      };
    }
    return { safe: true };
  } catch (err) {
    // If the model fails to load or classify for any reason (slow network,
    // unsupported browser, etc.), fail OPEN rather than blocking every
    // upload — a missed screening is better than the whole feature being
    // unusable. The planner's manual approval step is still the real
    // backstop either way.
    console.error("Content screening unavailable, allowing upload:", err);
    return { safe: true };
  }
}
