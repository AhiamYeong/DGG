// UI 컴포넌트 공통 타입 정의

export interface BaseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface MapControlProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  offset?: { x: number; y: number };
}

export interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fill?: 'none' | 'current' | 'inherit';
  strokeWidth?: number;
}

export interface MapButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  variant: 'location' | 'polyline' | 'remove' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
  disabled?: boolean;
}

export interface MapControlsProps {
  onLocationClick: () => void;
  onPolylineClick: () => void;
  onRemoveClick: () => void;
  position?: 'top-right' | 'bottom-right';
  className?: string;
}
