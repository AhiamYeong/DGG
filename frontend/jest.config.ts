/** @type {import('jest').Config} */
export default {
  // 기본 설정
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // 설정 파일
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // 모듈 경로 매핑 (올바른 속성명 사용)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    // CSS 모듈 모킹
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // 이미지 파일 모킹
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },
  
  // 변환 설정
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  
  // ESM 확장자 처리
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // 테스트 파일 패턴
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
  ],
  
  // 커버리지 설정 (MVP 단계에서는 단순화)
  collectCoverageFrom: [
    'src/stores/**/*.(ts|tsx)',
    'src/services/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/setupTests.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.(ts|tsx)',
    '!src/**/*.spec.(ts|tsx)',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text'],
  // MVP 단계에서는 커버리지 임계값 제거
  // coverageThreshold: {},
  
  // 테스트 타임아웃 (기본값: 5000ms)
  testTimeout: 10000,
  
  // 병렬 실행 설정
  maxWorkers: '50%',
  
  // 캐시 설정
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // 클리어 모킹
  clearMocks: true,
  restoreMocks: true,
  
  // 상세 출력
  verbose: true,
};