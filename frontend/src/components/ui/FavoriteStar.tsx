import React from 'react';

type FavoriteStarProps = {
  active?: boolean;
  onToggle?: (next: boolean) => void;
  size?: number; // px
  className?: string;
  ariaLabel?: string;
};

/**
 * 즐겨찾기 별 아이콘 버튼 (배경 완전 투명)
 */
export const FavoriteStar: React.FC<FavoriteStarProps> = ({
  active = false,
  onToggle,
  size = 24,
  className = '',
  ariaLabel,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // 디버그: 즐겨찾기 별 클릭
    console.log('[FavoriteStar] click');
    onToggle?.(!active);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 모바일/데스크탑 모두에서 상위 카드 onClick으로 버블링되는 것을 방지
    e.stopPropagation();
    e.preventDefault();
    // 디버그: 즐겨찾기 별 mousedown
    console.log('[FavoriteStar] mousedown');
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    // 모바일 터치 환경에서 상위 카드 클릭으로 전파되는 것을 방지
    e.stopPropagation();
    e.preventDefault();
    // 디버그: 즐겨찾기 별 touchstart
    console.log('[FavoriteStar] touchstart');
  };

  const label = ariaLabel || (active ? '즐겨찾기 해제' : '즐겨찾기 추가');

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`
        bg-transparent hover:bg-transparent pointer-events-auto 
        focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 
        ring-0 border-0 shadow-none p-2 rounded transition-transform duration-150 hover:scale-110 
        ${className}
      `}
      aria-label={label}
      aria-pressed={active}
    >
      <svg
        width={size}
        height={size}
        className={`${active ? 'text-accent fill-current' : 'text-gray-400'} inline-block`}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
  );
};

export default FavoriteStar;
