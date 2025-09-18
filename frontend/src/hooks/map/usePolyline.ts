import { useRef, useCallback } from 'react';
import type { NaverMapInstance } from '../../types/map';

// ODsay API 응답을 흉내 내는 더미 데이터 타입
interface DummySubPath {
  trafficType: number; // 1: 버스, 2: 지하철, 3: 걷기
  passShape: {
    geojson: {
      coordinates: number[][]; // [lng, lat] 배열
    };
  };
}

import { POLYLINE_STYLES, TRAFFIC_TYPES } from '../../utils/constants';

// 교통수단별 스타일 매핑
const styleMap = {
  [TRAFFIC_TYPES.BUS]: POLYLINE_STYLES.BUS,
  [TRAFFIC_TYPES.SUBWAY]: POLYLINE_STYLES.SUBWAY,
  [TRAFFIC_TYPES.WALK]: POLYLINE_STYLES.WALK
};

// 강남역 -> 성수역 더미 데이터
const dummySubPath: DummySubPath[] = [
  {
    trafficType: TRAFFIC_TYPES.WALK, // 걷기
    passShape: {
      geojson: {
        coordinates: [
          [127.0276, 37.4979], // 강남역 출구
          [127.0280, 37.4982], // 강남역 근처
          [127.0285, 37.4985]  // 지하철역 입구
        ]
      }
    }
  },
  {
    trafficType: TRAFFIC_TYPES.SUBWAY, // 지하철 (2호선)
    passShape: {
      geojson: {
        coordinates: [
          [127.0285, 37.4985], // 강남역
          [127.0290, 37.4990], // 선릉역
          [127.0295, 37.4995], // 삼성역
          [127.0300, 37.5000], // 종합운동장역
          [127.0305, 37.5005], // 잠실역
          [127.0310, 37.5010], // 잠실나루역
          [127.0315, 37.5015], // 강변역
          [127.0320, 37.5020], // 구의역
          [127.0325, 37.5025], // 건대입구역
          [127.0330, 37.5030], // 성수역
          [127.0335, 37.5035]  // 성수역 플랫폼
        ]
      }
    }
  },
  {
    trafficType: TRAFFIC_TYPES.WALK, // 걷기
    passShape: {
      geojson: {
        coordinates: [
          [127.0335, 37.5035], // 성수역 플랫폼
          [127.0340, 37.5040], // 성수역 출구
          [127.0345, 37.5045]  // 성수역 근처 목적지
        ]
      }
    }
  }
];

/**
 * 폴리라인 관리를 담당하는 커스텀 훅
 * 폴리라인 생성, 제거, 관리
 */
export function usePolyline(map: NaverMapInstance | null) {
  const polylinesRef = useRef<any[]>([]);

  // 기존 폴리라인 제거
  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach(polyline => {
      if (polyline && polyline.setMap) {
        polyline.setMap(null);
      }
    });
    polylinesRef.current = [];
  }, []);

  // 폴리라인 그리기 함수
  const drawPolylines = useCallback((subPaths: DummySubPath[]) => {
    if (!map || !window.naver || !window.naver.maps) {
      console.error('지도가 초기화되지 않았습니다.');
      return;
    }

    // 기존 폴리라인 제거
    clearPolylines();

    const naver = window.naver;
    const newPolylines: any[] = [];

    // 각 subPath에 대해 폴리라인 생성
    subPaths.forEach((subPath) => {
      const coordinates = subPath.passShape.geojson.coordinates;
      const style = styleMap[subPath.trafficType as keyof typeof styleMap];

      // [lng, lat] → new naver.maps.LatLng(lat, lng) 변환
      const path = coordinates.map(coord => 
        new naver.maps.LatLng(coord[1], coord[0]) // [lng, lat] → [lat, lng]
      );

      // 폴리라인 생성
      const polyline = new naver.maps.Polyline({
        map: map,
        path: path,
        strokeColor: style.strokeColor,
        strokeWeight: style.strokeWeight,
        strokeStyle: style.strokeStyle as any
      });

      newPolylines.push(polyline);
    });

    // 참조 저장
    polylinesRef.current = newPolylines;

    console.log('폴리라인 그리기 완료:', {
      polylines: newPolylines.length
    });
  }, [map, clearPolylines]);

  // 강남역 -> 성수역 더미 경로 그리기
  const drawGangnamToSeongsuRoute = useCallback(() => {
    drawPolylines(dummySubPath);
  }, [drawPolylines]);

  return {
    drawPolylines,
    drawGangnamToSeongsuRoute,
    clearPolylines
  };
}
