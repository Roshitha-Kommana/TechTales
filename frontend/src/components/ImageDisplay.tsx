import React, { useState } from 'react';

interface ImageDisplayProps {
  imageUrl?: string;
  alt: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, alt }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-xs">Generating illustration...</p>
        </div>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
        <div className="text-center p-4">
          <p className="text-gray-600 text-xs mb-1">Illustration unavailable</p>
          <p className="text-xs text-gray-400">The image service may be temporarily unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden rounded">
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 rounded">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-1"></div>
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover rounded ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        onError={() => {
          console.error('Image failed to load:', imageUrl);
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => {
          console.log('Image loaded successfully');
          setImageLoading(false);
        }}
      />
    </div>
  );
};

export default ImageDisplay;
