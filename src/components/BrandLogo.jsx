import React from 'react';

/**
 * BrandLogo - Canonical brand wordmark and icon for buyKꞰsell.
 * The two opposing Ks (upright K + horizontally mirrored K) are optically kerned
 * so their diagonal arms meet in the center, forming an 'N' (buy-N-sell).
 */

export function JoinedKMark({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl'
  };

  return (
    <span
      className={`inline-flex items-center font-black select-none tracking-[-0.14em] mx-[0.5px] ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={{ color: 'var(--text-accent-hero)' }}
      aria-hidden="true"
    >
      <span className="inline-block">K</span>
      <span className="inline-block transform -scale-x-100">K</span>
    </span>
  );
}

/**
 * Geometric SVG Monogram Icon:
 * Accurately drafts the upright vertical stem, the central 'N' diagonal formed
 * by the intersection of both K diagonals, and the right vertical stem.
 */
export function BrandIcon({ className = "w-8 h-8", accentColor = "var(--text-accent-hero)" }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="currentColor" className="text-slate-900 dark:text-white" />
      {/* Left stem of first K */}
      <rect x="8" y="9" width="4" height="22" rx="1.5" fill="white" className="dark:fill-slate-900" />
      {/* Right stem of mirrored K */}
      <rect x="28" y="9" width="4" height="22" rx="1.5" fill="white" className="dark:fill-slate-900" />
      {/* Left K upper diagonal */}
      <path d="M12 20L20 10H24L14.5 22L12 20Z" fill={accentColor} />
      {/* Left K lower diagonal */}
      <path d="M13 19L22 31H17.5L11 21.5L13 19Z" fill={accentColor} />
      {/* Mirrored K upper diagonal */}
      <path d="M28 20L20 10H16L25.5 22L28 20Z" fill={accentColor} opacity="0.9" />
      {/* Mirrored K lower diagonal */}
      <path d="M27 19L18 31H22.5L29 21.5L27 19Z" fill={accentColor} opacity="0.9" />
    </svg>
  );
}

export default function BrandWordmark({
  size = 'md',
  showIcon = false,
  textColor = 'text-white',
  className = ''
}) {
  const textSizes = {
    sm: 'text-xs sm:text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl'
  };

  return (
    <div
      className={`inline-flex items-center gap-2 select-none group font-sans ${className}`}
      aria-label="buyKꞰsell (Buy and Sell)"
      title="buyKꞰsell - Campus Marketplace"
    >
      {showIcon && <BrandIcon className={size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} />}
      <span className={`font-black tracking-tight inline-flex items-center ${textColor} ${textSizes[size] || textSizes.md}`}>
        <span className="font-extrabold">buy</span>
        <JoinedKMark size={size} />
        <span className="font-extrabold">sell</span>
      </span>
    </div>
  );
}
