import React, { useRef, useState, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  placeholderColor?: string;
}

/**
 * LazyImage — uses IntersectionObserver to defer loading until the image
 * enters the viewport, then fades in. Falls back to native loading="lazy".
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  placeholderColor = '#F5E4D8',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }  // start loading 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {/* Placeholder skeleton */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, ${placeholderColor} 25%, #EDE2D4 50%, ${placeholderColor} 75%)`,
          backgroundSize: '200% 100%',
          animation: loaded ? 'none' : 'shimmer 1.5s infinite',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.3s ease',
          zIndex: 1,
        }}
      />
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={className}
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
            display: 'block',
            position: 'relative',
            zIndex: 2,
          }}
        />
      )}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};
