import { useEffect, useRef, useState } from "react";
import ecosystemVideo from "../assets/ecosystem-video.mp4.asset.json";

type Props = {
  className?: string;
  /** Additional aria-label / accessible description of the video */
  ariaLabel?: string;
  /** Poster/thumbnail path */
  poster?: string;
  /** Autoplay muted when scrolled into view (disabled under prefers-reduced-motion) */
  autoplayOnView?: boolean;
  /** Render user-visible caption line under the video */
  showCaption?: boolean;
};

const DEFAULT_ALT =
  "Ecosystem manifesto film: real wedding professionals — videographers, caterers, wedding planners, limo drivers, and tent crews — animated as an interconnected network with the message 'The next SaaS moat isn't software, it's shared success.'";

export const ECOSYSTEM_VIDEO_POSTER =
  "/opengraph-images/next-saas-moat-video-og.jpg";
export const ECOSYSTEM_VIDEO_OG_IMAGE =
  "/opengraph-images/next-saas-moat-video-og.jpg";
export const ECOSYSTEM_VIDEO_TWITTER_IMAGE =
  "/opengraph-images/next-saas-moat-video-twitter.jpg";
export const ECOSYSTEM_VIDEO_CAPTIONS_URL =
  "/blog-videos/next-saas-moat-captions.vtt";
export const ECOSYSTEM_VIDEO_DURATION_ISO = "PT15S";
export const ECOSYSTEM_VIDEO_DURATION_SECONDS = 15;
export const ECOSYSTEM_VIDEO_URL = ecosystemVideo.url;

/**
 * EcosystemVideo — the 15-second Weddings.io manifesto film.
 *
 * Accessibility:
 * - aria-label + WebVTT captions track (English)
 * - Captions on/off toggle button (persists per-session)
 * - Poster fallback for slow networks / no-JS crawlers
 * - Respects prefers-reduced-motion: disables autoplay, exposes a Play button
 */
export function EcosystemVideo({
  className,
  ariaLabel = DEFAULT_ALT,
  poster = ECOSYSTEM_VIDEO_POSTER,
  autoplayOnView = false,
  showCaption = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Autoplay-on-scroll (only when reduced motion is NOT set)
  useEffect(() => {
    if (!autoplayOnView || reducedMotion) return;
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            el.play().catch(() => {
              /* Autoplay may be blocked; poster + controls remain. */
            });
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplayOnView, reducedMotion]);

  // Sync captions track visibility with toggle state
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const tracks = el.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      if (t.kind === "captions" || t.kind === "subtitles") {
        t.mode = captionsOn ? "showing" : "hidden";
      }
    }
  }, [captionsOn]);

  const handlePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {
      /* user gesture required */
    });
  };

  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-lg border border-border bg-black">
        <video
          ref={videoRef}
          src={ecosystemVideo.url}
          poster={poster}
          controls
          playsInline
          muted
          loop
          preload={autoplayOnView && !reducedMotion ? "metadata" : "none"}
          aria-label={ariaLabel}
          className="aspect-video w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <track
            kind="captions"
            src={ECOSYSTEM_VIDEO_CAPTIONS_URL}
            srcLang="en"
            label="English captions"
            default
          />
          {ariaLabel}
        </video>

        {/* Reduced-motion play overlay: appears when autoplay is suppressed */}
        {reducedMotion && autoplayOnView && !isPlaying && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Play ecosystem manifesto video (autoplay disabled by your reduced-motion preference)"
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white transition hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        {showCaption ? (
          <figcaption className="text-sm italic text-muted-foreground">
            {inView && autoplayOnView && !reducedMotion ? "Now playing — " : ""}
            The ecosystem manifesto (15s): videographers, caterers, planners, limo
            drivers, and tent crews as the network that makes weddings work.
          </figcaption>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setCaptionsOn((v) => !v)}
          aria-pressed={captionsOn}
          aria-label={captionsOn ? "Turn captions off" : "Turn captions on"}
          className="shrink-0 rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground transition hover:bg-secondary/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          CC {captionsOn ? "On" : "Off"}
        </button>
      </div>
    </figure>
  );
}

export const ecosystemVideoAsset = ecosystemVideo;
