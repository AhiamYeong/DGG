import { useRef, useCallback } from 'react';
import type { NaverMapInstance, NaverPolylineInstance } from '@/types/map';
import type { SimpleRoute } from '@/types/route-types';
import type { SubPath } from '@/types/route-api-types';
import { log } from '../utils/logger';
import { POLYLINE_STYLES, TRAFFIC_TYPES } from '../constants';

// ODsay API 응답을 흉내 내는 더미 데이터 타입
interface DummySubPath {
  trafficType: number; // 1: 버스, 2: 지하철, 3: 걷기
  passShape: {
    geojson: {
      coordinates: number[][]; // [lng, lat] 배열
    };
  };
}

// 교통수단별 스타일 매핑
const styleMap = {
  [TRAFFIC_TYPES.BUS]: POLYLINE_STYLES.BUS,
  [TRAFFIC_TYPES.SUBWAY]: POLYLINE_STYLES.SUBWAY,
  [TRAFFIC_TYPES.WALK]: POLYLINE_STYLES.WALK
};

// test.json 기반 강남역 -> 공덕역 더미 데이터
const dummySubPath: DummySubPath[] = [
  {
    trafficType: TRAFFIC_TYPES.WALK, // 걷기 (강남역 출구)
    passShape: {
      geojson: {
        coordinates: [
          [127.0276, 37.4979], // 강남역 출구
          [127.0276, 37.4979]  // 지하철역 입구
        ]
      }
    }
  },
  {
    trafficType: TRAFFIC_TYPES.SUBWAY, // 지하철 (2호선)
    passShape: {
      geojson: {
        coordinates: [
          [127.027619, 37.497952], // 강남
          [127.014395, 37.493902], // 교대
          [127.007702, 37.491852], // 서초
          [126.997667, 37.481496], // 방배
          [126.981363, 37.476575]  // 사당
        ]
      }
    }
  },
  {
    trafficType: TRAFFIC_TYPES.WALK, // 환승 걷기
    passShape: {
      geojson: {
        coordinates: [
          [126.981363, 37.476575], // 사당
          [126.981363, 37.476575]  // 환승
        ]
      }
    }
  },
  {
    trafficType: TRAFFIC_TYPES.SUBWAY, // 지하철 (4호선)
    passShape: {
      geojson: {
        coordinates: [
          [126.981668, 37.476798], // 사당
          [126.982193, 37.486803], // 총신대입구(이수)
          [126.980341, 37.502915], // 동작
          [126.974396, 37.522427], // 이촌
          [126.967948, 37.529241], // 신용산
          [126.972987, 37.534547]  // 삼각지
        ]
      }
    }
  },
  {
    trafficType: TRAFFIC_TYPES.WALK, // 환승 걷기
    passShape: {
      geojson: {
        coordinates: [
          [126.972987, 37.534547], // 삼각지
          [126.972987, 37.534547]  // 환승
        ]
      }
    }
  },
  {
    trafficType: TRAFFIC_TYPES.SUBWAY, // 지하철 (6호선)
    passShape: {
      geojson: {
        coordinates: [
          [126.974019, 37.535592], // 삼각지
          [126.961437, 37.539274], // 효창공원앞
          [126.951969, 37.543515]  // 공덕
        ]
      }
    }
  },
  {
    trafficType: TRAFFIC_TYPES.WALK, // 공덕역 출구
    passShape: {
      geojson: {
        coordinates: [
          [126.951969, 37.543515], // 공덕역
          [126.950498, 37.543967]  // 공덕역 1번출구
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
  const polylinesRef = useRef<NaverPolylineInstance[]>([]);

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
  const drawPolylines = useCallback((subPaths: DummySubPath[]): void => {
    if (!map || !window.naver || !window.naver.maps) {
      log.error('지도가 초기화되지 않았습니다.');
      return;
    }

    // 기존 폴리라인 제거
    clearPolylines();

    const naver = window.naver;
    const newPolylines: NaverPolylineInstance[] = [];

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

    log.map('폴리라인 그리기 완료', {
      polylines: newPolylines.length
    });
  }, [map, clearPolylines]);

  // 강남역 -> 공덕역 더미 경로 그리기
  const drawGangnamToGongdeokRoute = useCallback((): void => {
    drawPolylines(dummySubPath);
  }, [drawPolylines]);

  // 선택된 경로의 폴리라인 그리기
  const drawSelectedRoute = useCallback((route: SimpleRoute): void => {
    if (!route.rawData || !route.rawData.subPath) {
      log.error('경로 데이터가 없습니다.');
      return;
    }

    const subPaths = route.rawData.subPath.map((subPath: SubPath) => {
      // passShape이 있으면 사용, 없으면 passStopList.stations로 좌표 생성
      let coordinates: number[][] = [];
      
      if (subPath.passShape?.geojson?.coordinates) {
        // passShape이 있는 경우
        coordinates = subPath.passShape.geojson.coordinates;
      } else if (subPath.passStopList?.stations) {
        // passStopList.stations를 사용해서 좌표 생성
        coordinates = subPath.passStopList.stations.map((station) => [
          parseFloat(station.x), // 경도
          parseFloat(station.y)  // 위도
        ]);
      } else if (subPath.startX && subPath.startY && subPath.endX && subPath.endY) {
        // 시작점과 끝점만 있는 경우 (도보 구간)
        coordinates = [
          [subPath.startX, subPath.startY],
          [subPath.endX, subPath.endY]
        ];
      }

      return {
        trafficType: subPath.trafficType,
        passShape: {
          geojson: {
            coordinates
          }
        }
      };
    });

    drawPolylines(subPaths);
    log.map('선택된 경로 폴리라인 그리기 완료', {
      routeName: route.name,
      subPathCount: subPaths.length
    });
  }, [drawPolylines]);

  return {
    drawPolylines,
    drawGangnamToGongdeokRoute,
    drawSelectedRoute,
    clearPolylines
  };
}
