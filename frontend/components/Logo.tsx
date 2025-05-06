import Image from 'next/image';
import { FC } from 'react';

interface LogoProps {
  className?: string;
  iconHeight?: number;
}

// Aspect ratio for Union.svg (183 width / 97 height)
const ICON_ASPECT_RATIO = 183 / 97;

export const Logo: FC<LogoProps> = ({ className = '', iconHeight = 40 }) => {
  const iconWidth = Math.round(iconHeight * ICON_ASPECT_RATIO);

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/Union.svg"
        alt="SolQuest Icon"
        width={iconWidth}
        height={iconHeight}
        priority
      />
      <span className="ml-3 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-solana-purple to-solana-green">
        SOLQUEST.IO
      </span>
    </div>
  );
};