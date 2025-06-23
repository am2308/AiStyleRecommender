import React, { useState, useEffect, useRef } from 'react';
import { getResponsiveImageUrl, fixImageCors, getFallbackImageForCategory } from '../utils/imageOptimizer';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholderSrc?: string;
  category?: string;
  onError?: () => void;
  onLoad?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderSrc,
  category = 'Tops',
  onError,
  onLoad
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [elementRef, isInView] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '200px',
    triggerOnce: true
  });
  const imageRef = useRef<HTMLImageElement>(null);

  // Get default placeholder based on category if not provided
  const defaultPlaceholder = placeholderSrc || getFallbackImageForCategory(category);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setHasError(false);
    
    // Only load the image if it's in view
    if (isInView && src) {
      // Fix CORS issues and get responsive image URL
      const fixedSrc = fixImageCors(src);
      const responsiveSrc = getResponsiveImageUrl(fixedSrc, width);
      
      setImageSrc(responsiveSrc);
    }
  }, [src, isInView, width]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    setHasError(true);
    setImageSrc(defaultPlaceholder);
    if (onError) onError();
  };

  return (
    <div 
      ref={elementRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
    >
      {/* Placeholder/Blur-up image */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Main image - only render if in view */}
      {isInView && (
        <img
          ref={imageRef}
          src={imageSrc || defaultPlaceholder}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          width={width}
          height={height}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default React.memo(LazyImage);