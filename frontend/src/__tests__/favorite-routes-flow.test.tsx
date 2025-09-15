import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoriteRoutesBottomSheet from '../components/functional/Route/FavoriteRoutesBottomSheet';
import { useRouteStore } from '../stores/useRouteStore';

// Mock the useBottomSheetSwipe hook
jest.mock('../hooks/useBottomSheetSwipe', () => ({
  useBottomSheetSwipe: () => ({
    height: 200,
    isDragging: false,
    touchRef: { current: null },
    bind: () => ({}),
    toggleBottomSheet: jest.fn()
  })
}));

describe('즐겨찾기 경로 플로우 통합 테스트', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Store 초기화
    useRouteStore.getState().selectRoute(null);
  });

  it('즐겨찾기 경로 목록을 표시한다', () => {
    render(<FavoriteRoutesBottomSheet />);

    // 기본 즐겨찾기 경로들이 표시되는지 확인
    expect(screen.getByText('출근길')).toBeInTheDocument();
    expect(screen.getByText('퇴근길')).toBeInTheDocument();
    expect(screen.getByText('주말 나들이')).toBeInTheDocument();
  });

  it('경로를 선택할 수 있다', async () => {
    render(<FavoriteRoutesBottomSheet />);

    // 첫 번째 경로의 선택 버튼 클릭
    const selectButtons = screen.getAllByText('선택');
    await user.click(selectButtons[0]);

    // Store 상태 확인
    const { selectedRoute } = useRouteStore.getState();
    expect(selectedRoute).toEqual({
      id: '1',
      name: '출근길',
      from: '강남역',
      to: '여의도',
      time: '08:30',
      isBookmarked: true
    });
  });

  it('새 경로 추가 버튼을 클릭할 수 있다', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<FavoriteRoutesBottomSheet />);

    // 새 경로 추가 버튼 클릭
    const addButton = screen.getByText('새 경로 추가');
    await user.click(addButton);

    // 콘솔 로그 확인 (실제 구현에서는 모달이 열려야 함)
    expect(consoleSpy).toHaveBeenCalledWith('새 경로 추가');

    consoleSpy.mockRestore();
  });

  it('즐겨찾기된 경로에 별표 아이콘이 표시된다', () => {
    render(<FavoriteRoutesBottomSheet />);

    // 즐겨찾기된 경로들 (출근길, 퇴근길)에 별표 아이콘이 있는지 확인
    const starIcons = screen.getAllByTestId('star-icon');
    expect(starIcons.length).toBeGreaterThan(0);
  });

  it('경로 정보가 올바르게 표시된다', () => {
    render(<FavoriteRoutesBottomSheet />);

    // 출근길 경로 정보 확인
    expect(screen.getAllByText('강남역')[0]).toBeInTheDocument();
    expect(screen.getAllByText('여의도')[0]).toBeInTheDocument();
    expect(screen.getByText('예약 시간: 08:30')).toBeInTheDocument();
  });
});
