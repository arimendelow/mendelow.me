// The RAPID demo: its title frame and a Play button, and no third-party script or autoplay until the visitor asks.
// An island, because pressing Play swaps the frame for the video.
import { useEffect, useRef, useState, type SVGProps } from "react";
import { Button } from "@/components/ouro/button/button";

function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.3-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5Z" />
    </svg>
  );
}

export function RapidVideo() {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  // The button that had focus is gone once the video takes its place, so focus moves to the video.
  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);
  return (
    <div className="video">
      {playing ? (
        <iframe
          ref={frame}
          src="https://www.youtube-nocookie.com/embed/hC0A2Tu9k94?autoplay=1&rel=0"
          title="RAPID demo video"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <img className="video-poster" src="/assets/rapid-video-poster.jpg" width="1280" height="720" loading="lazy" decoding="async" alt="Title frame of the RAPID demo video, close on the robot with its logo." />
          <Button className="video-play absolute end-3 bottom-3" startIcon={PlayIcon} aria-label="Play the RAPID demo video" onClick={() => setPlaying(true)}>
            Play
          </Button>
        </>
      )}
    </div>
  );
}
