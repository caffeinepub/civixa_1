import React from 'react';

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

export function BackgroundLayout({ children }: BackgroundLayoutProps) {
  return (
    <div className="relative min-h-screen scan-line">
      {/* Video background */}
      <video
        className="video-bg"
        autoPlay
        loop
        muted
        playsInline
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-aerial-view-11-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay to keep UI readable */}
      <div className="video-overlay" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
