import '@testing-library/jest-dom';

// ===== 기본 브라우저 API 모킹 =====

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// ===== 네이버 지도 API 모킹 =====

// Mock window.naver (네이버 지도 API)
Object.defineProperty(window, 'naver', {
  writable: true,
  value: {
    maps: {
      Map: jest.fn().mockImplementation(() => ({
        setCenter: jest.fn(),
        setZoom: jest.fn(),
        getCenter: jest.fn(),
        getZoom: jest.fn(),
        destroy: jest.fn(),
      })),
      LatLng: jest.fn().mockImplementation((lat, lng) => ({
        _lat: lat,
        _lng: lng,
        lat: () => lat,
        lng: () => lng,
      })),
      Marker: jest.fn().mockImplementation(() => ({
        setMap: jest.fn(),
        getPosition: jest.fn(),
      })),
      InfoWindow: jest.fn().mockImplementation(() => ({
        open: jest.fn(),
        close: jest.fn(),
        getMap: jest.fn(),
      })),
      Event: {
        addListener: jest.fn(),
      },
    },
  },
});

// Mock navermap_authFailure
Object.defineProperty(window, 'navermap_authFailure', {
  writable: true,
  value: jest.fn(),
});