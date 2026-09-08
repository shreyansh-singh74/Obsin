import React, { useState } from 'react';

interface UserAvatarProps {
  src: string;
  alt: string;
  /** Size / rounding / border classes, applied to both the img and the fallback. */
  className?: string;
  /** Text used for the fallback initial; defaults to the alt text. */
  fallbackLabel?: string;
}

/**
 * GitHub avatar with graceful degradation: if the image URL is missing or
 * fails to load (offline, blocked, deleted avatar), renders an initial-letter
 * circle instead of a broken image.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);
  const initial = (fallbackLabel || alt || '?').trim().charAt(0).toUpperCase();

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent-text)] font-semibold select-none overflow-hidden ${className}`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
