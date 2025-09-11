import React, { useEffect, useRef, useState } from 'react';

// 네이버 Map API 타입 정의
declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapProps {
  width?: string;
  height?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const NaverMap: React.FC<NaverMapProps> = ({
  width = '100%',
  height = '300px',
  center = { lat: 37.5665, lng: 126.9780 }, // 서울시청
  zoom = 15
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 인증 실패 감지 함수 설정
    (window as any).navermap_authFailure = () => {
      console.error('네이버 Map API 인증 실패');
      alert('네이버 Map API 인증에 실패했습니다. API 키와 도메인 설정을 확인해주세요.');
    };

    // 네이버 Map API 동적 로딩
    const loadNaverMapAPI = () => {
      return new Promise((resolve, reject) => {
        // 이미 로드되어 있는지 확인
        if (window.naver && window.naver.maps) {
          resolve(window.naver);
          return;
        }

        // 스크립트 태그 생성
        const script = document.createElement('script');
        const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
        console.log('API Key:', clientId); // 디버깅용
        
        
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
        script.async = true;
        
        script.onload = () => {
          console.log('네이버 Map API 로드 완료');
          resolve(window.naver);
        };
        
        script.onerror = () => {
          console.error('네이버 Map API 로드 실패');
          reject(new Error('네이버 Map API 로드 실패'));
        };

        document.head.appendChild(script);
      });
    };

    // API 로드 및 지도 초기화
    loadNaverMapAPI()
      .then((naver: any) => {
        if (mapRef.current && naver.maps) {
          const mapInstance = new naver.maps.Map(mapRef.current, {
            center: new naver.maps.LatLng(center.lat, center.lng),
            zoom: zoom,
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: naver.maps.MapTypeControlStyle.BUTTON,
              position: naver.maps.Position.TOP_RIGHT
            },
            zoomControl: true,
            zoomControlOptions: {
              style: naver.maps.ZoomControlStyle.SMALL,
              position: naver.maps.Position.RIGHT_CENTER
            }
          });

          // 마커 추가
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(center.lat, center.lng),
            map: mapInstance,
            title: '테스트 위치'
          });

          // 정보창 추가
          const infoWindow = new naver.maps.InfoWindow({
            content: '<div style="padding:10px; font-size:14px;"><strong>테스트 위치</strong><br/>네이버 지도 API 테스트</div>'
          });

          // 마커 클릭 시 정보창 표시
          naver.maps.Event.addListener(marker, 'click', () => {
            if (infoWindow.getMap()) {
              infoWindow.close();
            } else {
              infoWindow.open(mapInstance, marker);
            }
          });

          setMap(mapInstance);
          setIsLoaded(true);
        }
      })
      .catch((error) => {
        console.error('지도 초기화 실패:', error);
      });

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [center.lat, center.lng, zoom]);

  return (
    <div className="w-full">
      <div 
        ref={mapRef} 
        style={{ width, height }}
        className="border border-gray-300 rounded-lg shadow-lg"
      />
      {!isLoaded && (
        <div className="flex items-center justify-center h-48 sm:h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm sm:text-base">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const MapTestPage: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.5665,
    lng: 126.9780
  });

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          alert('위치 정보를 가져올 수 없습니다.');
        }
      );
    } else {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
  };

  // 주요 위치들
  const locations = [
    { name: '서울시청', lat: 37.5665, lng: 126.9780 },
    { name: '강남역', lat: 37.4979, lng: 127.0276 },
    { name: '홍대입구역', lat: 37.5563, lng: 126.9226 },
    { name: '명동', lat: 37.5636, lng: 126.9826 },
    { name: '잠실역', lat: 37.5133, lng: 127.1028 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">네이버 지도 API 테스트</h1>
        

        {/* 지도 컨트롤 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">지도 컨트롤</h2>
          
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 sm:mb-4">
            <button
              onClick={getCurrentLocation}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              현재 위치로 이동
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {locations.map((location) => (
              <button
                key={location.name}
                onClick={() => setCurrentLocation({ lat: location.lat, lng: location.lng })}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors"
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>

        {/* 지도 표시 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">지도</h2>
          <NaverMap 
            center={currentLocation}
            height="300px"
            width="100%"
          />
          
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
            <p><strong>현재 위치:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
            <p><strong>기능:</strong> 마커 클릭, 줌, 지도 타입 변경, 현재 위치 확인</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTestPage;
