import { useEffect, useRef, useState } from "react";
import ecosystemVideo from "../assets/ecosystem-video.mp4.asset.json";

type Props = {
  className?: string;
  /** Additional aria-label / accessible description of the video */
  ariaLabel?: string;
  /** Poster/thumbnail path */
  poster?: string;
  /** Autoplay muted when scrolled into view */
  autoplayOnView?: boolean;
  /** Render user-visible caption line under the video */
  showCaption?: boolean;
};

const DEFAULT_ALT =
  "Ecosystem manifesto film: real wedding professionals — videographers, caterers, wedding planners, limo drivers, and tent crews — animated as an interconnected network with the message 'The next SaaS moat isn't software, it's shared success.'";

/**
 * EcosystemVideo — the 15-second Weddings.io manifesto film.
 * Accessible: aria-label, WebVTT captions track, poster fallback, and a
 * visible caption line for browsers that don't render text tracks.
 * Optionally autoplays (muted) when scrolled into view.
 */
export function EcosystemVideo({
  className,
  ariaLabel = DEFAULT_ALT,
  poster = "/blog-images/next-saas-moat-video-poster.jpg",
  autoplayOnView = false,
  showCaption = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!autoplayOnView) return;
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
  }, [autoplayOnView]);

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-lg border border-border bg-black">
        <video
          ref={videoRef}
          src={ecosystemVideo.url}
          poster={poster}
          controls
          playsInline
          muted
          loop
          preload={autoplayOnView ? "metadata" : "none"}
          aria-label={ariaLabel}
          className="aspect-video w-full"
        >
          <track
            kind="captions"
            src="/blog-videos/next-saas-moat-captions.vtt"
            srcLang="en"
            label="English captions"
            default
          />
          {/* Fallback text for very old browsers / no-JS crawlers */}
          {ariaLabel}
        </video>
      </div>
      {showCaption && (
        <figcaption className="mt-3 text-sm italic text-muted-foreground">
          {inView && autoplayOnView ? "Now playing — " : ""}
          The ecosystem manifesto (15s): videographers, caterers, planners, limo
          drivers, and tent crews as the network that makes weddings work.
        </figcaption>
      )}
    </figure>
  );
}

export const ecosystemVideoAsset = ecosystemVideo;
