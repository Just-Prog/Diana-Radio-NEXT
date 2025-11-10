'use client';

import type { CSSProperties } from 'react';

type IconProps = {
  type: string;
  color?: string;
  size?: number;
  className?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  style?: CSSProperties;
};

const IconFont: React.FC<IconProps> = ({
  type,
  color = 'black',
  size = 24,
  className,
  onMouseDown,
  onTouchStart,
  style,
}) => (
    <span
      className={className ?? ''}
      color={color}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={style}
    >
      <svg aria-hidden="true" className={'icon'} height={size} width={size}>
        <use xlinkHref={`#${type}`} />
      </svg>
    </span>
  );

export default IconFont;
