import React from 'react';

interface LogoProps {
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ height = 32, className }) => (
  <img
    src="/images/tcgbuyer-logo.png"
    alt="TCGBuyer"
    height={height}
    className={className}
    style={{ height, width: 'auto' }}
  />
);
