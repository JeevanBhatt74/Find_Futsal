import React from 'react'

interface LogoProps {
  className?: string
  showText?: boolean
  height?: number | string
  variant?: 'light' | 'dark'
}

export default function Logo({ className = '', showText = true, height = 44, variant = 'dark' }: LogoProps) {
  // Map exact colors from logo image
  // Light green: #1ebb73, Dark green: #0fa05f
  // Text dark: #2d3748, Subtext grey: #718096
  
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`} style={{ height }}>
      {/* ── Vector Map Pin Soccer Symbol ── */}
      <svg 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto shrink-0"
      >
        {/* Outer Pin Body Left Half (Light Green) */}
        <path 
          d="M 60 120 C 60 120 10 75 10 45 C 10 20.1 30.1 0 55 0 L 60 0 V 120 Z" 
          fill="#1EBB73" 
        />
        {/* Outer Pin Body Right Half (Dark Green) */}
        <path 
          d="M 60 120 C 60 120 110 75 110 45 C 110 20.1 89.9 0 65 0 L 60 0 V 120 Z" 
          fill="#0FA05F" 
        />
        
        {/* Inner Ball Background Mask (White) */}
        <circle cx="60" cy="45" r="33" fill="#FFFFFF" />

        {/* Inner Soccer Ball Structure Left Half (Light Green details) */}
        <path 
          d="M 60 12 C 41.8 12 27 26.8 27 45 C 27 63.2 41.8 78 60 78 V 12 Z" 
          fill="#52D093" 
        />
        {/* Inner Soccer Ball Structure Right Half (Dark Green details) */}
        <path 
          d="M 60 12 C 78.2 12 93 26.8 93 45 C 93 63.2 78.2 78 60 78 V 12 Z" 
          fill="#1EBB73" 
        />

        {/* Soccer Hexagonal Panels (White Lines & Pentagons) */}
        {/* Center Pentagon */}
        <polygon 
          points="60,35 69,42 66,52 54,52 51,42" 
          fill="#FFFFFF" 
        />
        
        {/* Hexagons Panels Left Half */}
        <path 
          d="M 60 12 C 45 12 32.5 22.1 28.5 36 L 38 41 L 43 32 L 60 35 L 60 12 Z" 
          fill="#FFFFFF" 
          opacity="0.85"
        />
        <path 
          d="M 27.2 48 C 28.5 61 38.5 71.5 51 75.5 L 54 62 L 46 56 L 36 58 L 27.2 48 Z" 
          fill="#FFFFFF" 
          opacity="0.85"
        />
        <path 
          d="M 43 32 L 36 58 L 46 56 L 51 42 L 43 32 Z" 
          fill="#2C3E50" 
          opacity="0.15" 
        />

        {/* Hexagons Panels Right Half */}
        <path 
          d="M 60 12 C 75 12 87.5 22.1 91.5 36 L 82 41 L 77 32 L 60 35 L 60 12 Z" 
          fill="#FFFFFF" 
          opacity="0.95"
        />
        <path 
          d="M 92.8 48 C 91.5 61 81.5 71.5 69 75.5 L 66 62 L 74 56 L 84 58 L 92.8 48 Z" 
          fill="#FFFFFF" 
          opacity="0.95"
        />
        <path 
          d="M 77 32 L 84 58 L 74 56 L 69 42 L 77 32 Z" 
          fill="#000000" 
          opacity="0.1" 
        />

        {/* Dynamic Shadow underneath pin */}
        <ellipse cx="60" cy="115" rx="20" ry="3" fill="#2C3E50" opacity="0.25" />
      </svg>

      {/* ── Horizontal Text Alignment ── */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span 
            className={`font-sans font-extrabold text-[25px] tracking-tight leading-none ${
              variant === 'light' ? 'text-white' : 'text-[#2C3E50]'
            }`}
          >
            FindFutsal
          </span>
          <span 
            className="text-[9px] font-black uppercase tracking-[0.24em] mt-1.5 leading-none"
            style={{ color: variant === 'light' ? '#A0AEC0' : '#718096' }}
          >
            BOOK YOUR COURT
          </span>
        </div>
      )}
    </div>
  )
}
