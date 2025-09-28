import { useRef, useCallback } from 'react';
import type { NaverMapInstance, NaverPolylineInstance } from '@/types/map';
import type { SimpleRoute } from '@/types/route-types';
import type { SubPath } from '@/types/route-api-types';
import { log } from '../utils/logger';
import { POLYLINE_STYLES, TRAFFIC_TYPES, SUBWAY_LINE_COLORS } from '../constants';

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
    console.log('🎯 drawSelectedRoute 호출됨');
    console.log('map 존재:', !!map);
    console.log('route 존재:', !!route);
    console.log('route:', route);
    
    // rawData 또는 polylineData 중 하나라도 있으면 처리
    const routeData = route.rawData || route.polylineData;
    console.log('routeData:', routeData);
    console.log('routeData.data 존재:', !!routeData?.data);
    console.log('routeData.data 길이:', routeData?.data?.length);
    
    if (!routeData) {
      console.log('❌ 경로 데이터가 없습니다.');
      log.error('경로 데이터가 없습니다.', { hasRawData: !!route.rawData, hasPolylineData: !!route.polylineData });
      return;
    }

    if (!map || !window.naver || !window.naver.maps) {
      console.log('❌ 지도가 초기화되지 않았습니다.');
      log.error('지도가 초기화되지 않았습니다.');
      return;
    }

    // 기존 폴리라인 제거
    clearPolylines();

    const naver = window.naver;
    const newPolylines: NaverPolylineInstance[] = [];

    // JSON 데이터 직접 처리 (MSW 변환 없이)
    if (routeData.data && Array.isArray(routeData.data)) {
      console.log('=== JSON 데이터 직접 처리 시작 ===');
      console.log('routeData.data 길이:', routeData.data.length);
      console.log('routeData.data:', routeData.data);
      
      routeData.data.forEach((step: any, index: number) => {
        console.log(`\n--- Step ${index + 1} 분석 ---`);
        console.log('step.type:', step.type);
        console.log('step.lineName:', step.lineName);
        console.log('step.polyline 존재:', !!step.polyline);
        console.log('step.polyline 길이:', step.polyline ? step.polyline.length : 0);
        console.log('step.path 존재:', !!step.path);
        console.log('step.path 길이:', step.path ? step.path.length : 0);
        let path: any[] = [];
        
        // polyline 배열이 있는 경우 정밀한 폴리라인 생성 (최우선)
        if (step.polyline && Array.isArray(step.polyline) && step.polyline.length > 0) {
          console.log(`정밀 폴리라인 생성: ${step.type} - ${step.lineName}`, step.polyline.length, '개 좌표');
          
          // polyline 좌표를 직접 Naver LatLng로 변환
          path = step.polyline.map((coord: any) => {
            if (coord.lat && coord.lng) {
              return new naver.maps.LatLng(coord.lat, coord.lng);
            }
            return null;
          }).filter(Boolean);

          console.log(`변환된 좌표 개수: ${path.length}`);
        }
        // path 배열이 있는 경우 역들을 연결하는 폴리라인 생성 (폴백)
        else if (step.path && Array.isArray(step.path) && step.path.length > 0) {
          console.log(`역 연결 폴리라인 생성: ${step.type} - ${step.lineName}`, step.path.length, '개 역');
          
          // path 좌표를 Naver LatLng로 변환
          path = step.path.map((station: any) => {
            if (station.lat && station.lng) {
              return new naver.maps.LatLng(station.lat, station.lng);
            }
            return null;
          }).filter(Boolean);

          console.log(`변환된 좌표 개수: ${path.length}`);
        }
        
        // 폴리라인 생성 (polyline 또는 path 데이터가 있는 경우)
        if (path && path.length > 0) {
          console.log(`✅ 폴리라인 생성 시작: ${path.length}개 좌표`);
          
          // 교통수단별 색상 결정
          let strokeColor = '#FF0000'; // 기본값
          let strokeWeight = 3;
          let strokeStyle = 'solid';

          if (step.type === 'SUBWAY') {
            strokeColor = SUBWAY_LINE_COLORS[step.lineName as keyof typeof SUBWAY_LINE_COLORS] || SUBWAY_LINE_COLORS['기타'];
            strokeWeight = 8; // 더 두껍게
            strokeStyle = 'solid';
            console.log(`지하철 색상: ${strokeColor} (${step.lineName})`);
          } else if (step.type === 'BUS') {
            strokeColor = POLYLINE_STYLES.BUS.strokeColor;
            strokeWeight = 6; // 더 두껍게
            strokeStyle = 'solid';
            console.log(`버스 색상: ${strokeColor}`);
          } else if (step.type === 'WALKING') {
            strokeColor = POLYLINE_STYLES.WALK.strokeColor;
            strokeWeight = 4; // 더 두껍게
            strokeStyle = 'shortdash';
            console.log(`도보 색상: ${strokeColor}`);
          }

          console.log(`폴리라인 스타일: ${strokeColor}, 두께: ${strokeWeight}, 스타일: ${strokeStyle}`);
          console.log('첫 번째 좌표:', path[0]);
          console.log('마지막 좌표:', path[path.length - 1]);

          // 폴리라인 생성
          try {
            const polyline = new naver.maps.Polyline({
              map: map,
              path: path,
              strokeColor: strokeColor,
              strokeWeight: strokeWeight,
              strokeStyle: strokeStyle
            });
            
            newPolylines.push(polyline);
            console.log(`✅ 폴리라인 생성 완료: ${step.type} - ${step.lineName}`);
          } catch (error) {
            console.error(`❌ 폴리라인 생성 실패: ${step.type} - ${step.lineName}`, error);
          }
        } else {
          console.log(`❌ 폴리라인 생성 건너뜀: path가 비어있음 (${path ? path.length : 0}개 좌표)`);
        }
        // 도보 구간 처리 (시작점과 끝점 연결) - polyline이나 path가 없는 경우
        if (step.type === 'WALKING' && step.startLat && step.startLng && step.endLat && step.endLng) {
          console.log(`🚶 도보 구간 폴리라인 생성: ${step.startLat}, ${step.startLng} -> ${step.endLat}, ${step.endLng}`);
          
          const walkPath = [
            new naver.maps.LatLng(step.startLat, step.startLng),
            new naver.maps.LatLng(step.endLat, step.endLng)
          ];

          try {
            const polyline = new naver.maps.Polyline({
              map: map,
              path: walkPath,
              strokeColor: POLYLINE_STYLES.WALK.strokeColor,
              strokeWeight: 3,
              strokeStyle: 'shortdash'
            });
            
            newPolylines.push(polyline);
            console.log(`✅ 도보 폴리라인 생성 완료`);
          } catch (error) {
            console.error(`❌ 도보 폴리라인 생성 실패`, error);
          }
        }
      });
      
      // 참조 저장
      polylinesRef.current = newPolylines;
      
      console.log('=== JSON 폴리라인 그리기 완료 ===');
      console.log('생성된 폴리라인 개수:', newPolylines.length);
      console.log('polylinesRef.current:', polylinesRef.current);
      
      // 폴리라인이 생성되었으면 지도를 폴리라인에 맞게 조정
      if (newPolylines.length > 0) {
        console.log('🗺️ 지도 조정 시작');
        
        // 모든 폴리라인의 좌표를 수집
        const allCoordinates: any[] = [];
        newPolylines.forEach((polyline, index) => {
          // polyline 객체에서 path 정보 추출 (타입 안전하게)
          const path = (polyline as any).getPath ? (polyline as any).getPath() : [];
          console.log(`폴리라인 ${index + 1} 좌표 개수:`, path.length);
          if (Array.isArray(path)) {
            allCoordinates.push(...path);
          }
        });
        
        console.log('전체 좌표 개수:', allCoordinates.length);
        
        if (allCoordinates.length > 0) {
          // 경계 상자 계산 (타입 안전하게)
          const bounds = new (naver.maps as any).LatLngBounds();
          allCoordinates.forEach(coord => {
            bounds.extend(coord);
          });
          
          console.log('경계 상자:', bounds);
          
          // 지도를 폴리라인에 맞게 조정 (타입 안전하게)
          (map as any).fitBounds(bounds, { padding: 50 });
          console.log('✅ 지도 조정 완료');
        }
      }
      
      log.map('JSON 폴리라인 그리기 완료', {
        polylines: newPolylines.length
      });
      
      return;
    }

    // MSW 데이터 형식 처리 (JSON 데이터를 MSW 형식으로 처리)
    if (routeData.polyline?.result?.lane) {
      console.log('MSW 폴리라인 데이터 처리:', routeData.polyline.result.lane);
      
      routeData.polyline.result.lane.forEach((lane: any) => {
        if (!lane.section || lane.section.length === 0) return;
        
        // 각 section의 graphPos를 좌표로 변환
        const coordinates: number[][] = [];
        lane.section.forEach((section: any) => {
          if (section.graphPos && section.graphPos.length > 0) {
            section.graphPos.forEach((pos: any) => {
              coordinates.push([pos.x, pos.y]); // [lng, lat]
            });
          }
        });
        
        if (coordinates.length === 0) return;
        
        // [lng, lat] → new naver.maps.LatLng(lat, lng) 변환
        const path = coordinates.map(coord => 
          new naver.maps.LatLng(coord[1], coord[0]) // [lng, lat] → [lat, lng]
        );
        
        // 호선별 색상 결정
        let strokeColor = '#FF0000'; // 기본값
        if (lane.type === 2 && lane.name) { // 지하철
          strokeColor = SUBWAY_LINE_COLORS[lane.name as keyof typeof SUBWAY_LINE_COLORS] || SUBWAY_LINE_COLORS['기타'];
        } else if (lane.type === 116 && lane.name) { // 분당선
          strokeColor = SUBWAY_LINE_COLORS[lane.name as keyof typeof SUBWAY_LINE_COLORS] || SUBWAY_LINE_COLORS['기타'];
        } else if (lane.type === 1) { // 버스
          strokeColor = POLYLINE_STYLES.BUS.strokeColor;
        }
        
        // 폴리라인 생성
        const polyline = new naver.maps.Polyline({
          map: map,
          path: path,
          strokeColor: strokeColor,
          strokeWeight: (lane.type === 2 || lane.type === 116) ? 6 : lane.type === 1 ? 5 : 3, // 지하철/분당선: 6, 버스: 5, 기타: 3
          strokeStyle: 'solid' // 모든 지하철/분당선은 실선
        });
        
        newPolylines.push(polyline);
      });
      
      // 참조 저장
      polylinesRef.current = newPolylines;
      
      log.map('MSW 폴리라인 그리기 완료', {
        polylines: newPolylines.length
      });
      
      return;
    }

    // 기존 rawData 형식 처리
    if (!routeData.subPath) {
      log.error('subPath 데이터가 없습니다.');
      return;
    }

    // 각 subPath에 대해 폴리라인 생성
    routeData.subPath.forEach((subPath: SubPath) => {
      // passShape이 있으면 사용, 없으면 passStopList.stations로 좌표 생성
      let coordinates: number[][] = [];
      
      if (subPath.passShape?.geojson?.coordinates) {
        // passShape이 있는 경우
        coordinates = subPath.passShape.geojson.coordinates;
      } else if (subPath.passStopList?.stations) {
        // 환승역만 표시 (첫 번째와 마지막 역만)
        const stations = subPath.passStopList.stations;
        if (stations.length > 0) {
          coordinates = [
            [parseFloat(stations[0].x), parseFloat(stations[0].y)], // 첫 번째 역
            [parseFloat(stations[stations.length - 1].x), parseFloat(stations[stations.length - 1].y)] // 마지막 역
          ];
        }
      } else if (subPath.startX && subPath.startY && subPath.endX && subPath.endY) {
        // 시작점과 끝점만 있는 경우 (도보 구간)
        coordinates = [
          [subPath.startX, subPath.startY],
          [subPath.endX, subPath.endY]
        ];
      }

      if (coordinates.length === 0) return;

      // [lng, lat] → new naver.maps.LatLng(lat, lng) 변환
      const path = coordinates.map(coord => 
        new naver.maps.LatLng(coord[1], coord[0]) // [lng, lat] → [lat, lng]
      );

      // 호선별 색상 결정
      let strokeColor = '#FF0000'; // 기본값
      if (subPath.trafficType === TRAFFIC_TYPES.SUBWAY && subPath.lane?.[0]?.name) {
        const lineName = subPath.lane[0].name;
        strokeColor = SUBWAY_LINE_COLORS[lineName as keyof typeof SUBWAY_LINE_COLORS] || SUBWAY_LINE_COLORS['기타'];
      } else if (subPath.trafficType === TRAFFIC_TYPES.BUS) {
        strokeColor = POLYLINE_STYLES.BUS.strokeColor;
      } else if (subPath.trafficType === TRAFFIC_TYPES.WALK) {
        strokeColor = POLYLINE_STYLES.WALK.strokeColor;
      }

      // 폴리라인 생성
      const polyline = new naver.maps.Polyline({
        map: map,
        path: path,
        strokeColor: strokeColor,
        strokeWeight: subPath.trafficType === TRAFFIC_TYPES.SUBWAY ? 6 : 
                     subPath.trafficType === TRAFFIC_TYPES.BUS ? 5 : 3,
        strokeStyle: subPath.trafficType === TRAFFIC_TYPES.WALK ? 'shortdash' : 'solid'
      });

      newPolylines.push(polyline);
    });

    // 참조 저장
    polylinesRef.current = newPolylines;

    log.map('선택된 경로 폴리라인 그리기 완료', {
      routeName: route.name,
      subPathCount: newPolylines.length
    });
  }, [map, clearPolylines]);

  return {
    drawPolylines,
    drawGangnamToGongdeokRoute,
    drawSelectedRoute,
    clearPolylines
  };
}
