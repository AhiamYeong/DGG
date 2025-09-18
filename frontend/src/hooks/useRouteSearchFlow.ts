import { useState, useCallback } from 'react';
import { RouteService } from '../services/routeService';
import type { SimpleRoute } from '../types/route-types';

interface RouteSearchFlowState {
  // 검색 결과 관련
  routeResults: SimpleRoute[];
  actionLabel: string;
  showDepartureOptions: boolean;
  
  // 시간 선택 관련
  showTimePicker: boolean;
  departureTime: Date;
  selectedDepartureOption: 'now' | 'schedule';
}

interface RouteSearchFlowActions {
  // 검색 플로우
  startRouteSearch: (origin: string, destination: string) => void;
  confirmTimeSelection: () => void;
  cancelTimeSelection: () => void;
  closeRouteResults: () => void;
  
  // 시간 선택
  setDepartureTime: (time: Date) => void;
  setSelectedDepartureOption: (option: 'now' | 'schedule') => void;
  
  // 경로 선택
  selectRoute: (route: SimpleRoute) => void;
}

type UseRouteSearchFlowReturn = RouteSearchFlowState & RouteSearchFlowActions;

/**
 * 경로 검색 플로우를 관리하는 통합 훅
 * - 검색 시작 → 시간 선택 → 경로 결과 표시의 전체 플로우를 관리
 */
export const useRouteSearchFlow = (): UseRouteSearchFlowReturn => {
  // 상태 관리
  const [routeResults, setRouteResults] = useState<SimpleRoute[]>([]);
  const [actionLabel, setActionLabel] = useState('안내 시작');
  const [showDepartureOptions, setShowDepartureOptions] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [departureTime, setDepartureTime] = useState(new Date());
  const [selectedDepartureOption, setSelectedDepartureOption] = useState<'now' | 'schedule'>('now');

  // 유틸리티 함수들은 별도 파일에서 import

  // 경로 검색 시작
  const startRouteSearch = useCallback((origin: string, destination: string) => {
    console.log('=== 길찾기 요청 ===');
    console.log('출발지:', origin);
    console.log('도착지:', destination);
    console.log('출발 옵션:', selectedDepartureOption);
    console.log('==================');
    
    // 출발 옵션 탭과 타임픽커 표시
    setShowDepartureOptions(true);
    setShowTimePicker(true);
  }, [selectedDepartureOption]);

  // 시간 선택 확인
  const confirmTimeSelection = useCallback(async () => {
    try {
      // 서비스를 통한 경로 검색 플로우 실행
      const result = await RouteService.executeRouteSearchFlow(
        '강남역', // TODO: 실제 출발지로 변경
        '성수역', // TODO: 실제 도착지로 변경
        departureTime,
        selectedDepartureOption
      );
      
      setRouteResults(result.routes);
      setActionLabel(result.actionLabel);
      setShowTimePicker(false);
    } catch (error) {
      console.error('경로 검색 실패:', error);
      // 에러 처리
    }
  }, [departureTime, selectedDepartureOption]);

  // 시간 선택 취소
  const cancelTimeSelection = useCallback(() => {
    setShowTimePicker(false);
  }, []);

  // 경로 결과 닫기
  const closeRouteResults = useCallback(() => {
    setRouteResults([]);
    setShowDepartureOptions(false);
  }, []);

  // 출발 시간 설정
  const updateDepartureTime = useCallback((time: Date) => {
    setDepartureTime(time);
  }, []);

  // 출발 옵션 설정
  const updateSelectedDepartureOption = useCallback((option: 'now' | 'schedule') => {
    setSelectedDepartureOption(option);
    if (option === 'now') {
      setDepartureTime(new Date());
    }
  }, []);

  // 경로 선택
  const selectRoute = useCallback((route: SimpleRoute) => {
    RouteService.handleRouteSelection(route);
  }, []);

  return {
    // State
    routeResults,
    actionLabel,
    showDepartureOptions,
    showTimePicker,
    departureTime,
    selectedDepartureOption,
    
    // Actions
    startRouteSearch,
    confirmTimeSelection,
    cancelTimeSelection,
    closeRouteResults,
    setDepartureTime: updateDepartureTime,
    setSelectedDepartureOption: updateSelectedDepartureOption,
    selectRoute,
  };
};
