import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from '../components/functional/SearchBox';
import { useSearchStore } from '../stores/useSearchStore';

describe('검색 플로우 통합 테스트', () => {
  const user = userEvent.setup();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    // Store 초기화
    useSearchStore.getState().clearAll();
    mockOnSearch.mockClear();
  });

  it('출발지와 도착지를 입력하고 검색할 수 있다', async () => {
    render(<SearchBox onSearch={mockOnSearch} />);

    // 출발지 입력
    const originInput = screen.getByPlaceholderText('출발지 검색');
    await user.type(originInput, '강남역');

    // 도착지 입력
    const destinationInput = screen.getByPlaceholderText('도착지 검색');
    await user.type(destinationInput, '여의도');

    // 검색 버튼이 활성화되었는지 확인
    const searchButton = screen.getByTitle('길찾기');
    expect(searchButton).not.toBeDisabled();

    // 검색 버튼 클릭
    await user.click(searchButton);

    // onSearch 콜백이 호출되었는지 확인
    expect(mockOnSearch).toHaveBeenCalledWith('강남역', '여의도', []);

    // Store 상태 확인
    const { origin, destination } = useSearchStore.getState();
    expect(origin).toBe('강남역');
    expect(destination).toBe('여의도');
  });

  it('경유지를 추가할 수 있다', async () => {
    render(<SearchBox onSearch={mockOnSearch} />);

    // 경유지 추가 버튼 클릭
    const addWaypointButton = screen.getByTitle('경유지 추가');
    await user.click(addWaypointButton);

    // 경유지 입력 필드가 나타났는지 확인
    const waypointInput = screen.getByPlaceholderText('경유지 1 검색');
    expect(waypointInput).toBeInTheDocument();

    // 경유지 입력
    await user.type(waypointInput, '홍대입구역');

    // Store 상태 확인
    const { waypoints } = useSearchStore.getState();
    expect(waypoints).toHaveLength(1);
    expect(waypoints[0].value).toBe('홍대입구역');
  });

  it('최대 5개의 경유지만 추가할 수 있다', async () => {
    render(<SearchBox onSearch={mockOnSearch} />);

    const addWaypointButton = screen.getByTitle('경유지 추가');

    // 5개의 경유지 추가
    for (let i = 0; i < 5; i++) {
      await user.click(addWaypointButton);
    }

    // 6번째 추가 시도 시 버튼이 비활성화되는지 확인
    expect(addWaypointButton).toBeDisabled();
    expect(addWaypointButton).toHaveAttribute('title', '최대 5개까지 추가 가능');

    // Store 상태 확인
    const { waypoints } = useSearchStore.getState();
    expect(waypoints).toHaveLength(5);
  });

  it('입력값을 클리어할 수 있다', async () => {
    render(<SearchBox onSearch={mockOnSearch} />);

    // 출발지 입력
    const originInput = screen.getByPlaceholderText('출발지 검색');
    await user.type(originInput, '강남역');

    // 클리어 버튼 클릭 (출발지 입력 필드의 클리어 버튼)
    const clearButtons = screen.getAllByRole('button');
    const clearButton = clearButtons.find(button => 
      button.querySelector('svg path[d*="M6 18L18 6M6 6l12 12"]')
    );
    
    if (clearButton) {
      await user.click(clearButton);
    }

    // 입력값이 클리어되었는지 확인
    expect(originInput).toHaveValue('');

    // Store 상태 확인
    const { origin } = useSearchStore.getState();
    expect(origin).toBe('');
  });
});
