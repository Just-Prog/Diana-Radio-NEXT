'use client';

import type { CSSProperties } from 'react';

type IconProps = {
  type: string;
  size?: number;
  className?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  style?: CSSProperties;
};

const IconFont: React.FC<IconProps> = ({
  type,
  size = 24,
  className,
  onMouseDown,
  onTouchStart,
  style,
}) => {
  return (
    <span
      className={className ?? ''}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={style}
    >
      <svg aria-hidden="true" className={'icon'} height={size} width={size}>
        <use xlinkHref={`#${type}`} />
      </svg>
    </span>
  );
};

export default IconFont;
