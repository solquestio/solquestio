import { FC } from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 50C20 33.4315 33.4315 20 50 20V20C66.5685 20 80 33.4315 80 50V50C80 66.5685 66.5685 80 50 80V80C33.4315 80 20 66.5685 20 50V50Z"
          fill="url(#paint0_linear)"
        />
        <path
          d="M45 35L60 50L45 65"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="20"
            y1="50"
            x2="80"
            y2="50"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4E46E5" />
            <stop offset="1" stopColor="#14F195" />
          </linearGradient>
        </defs>
      </svg>
      <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to">
        SOLQUEST.IO
      </span>
    </div>
  );
}; 