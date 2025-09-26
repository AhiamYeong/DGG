/** @format */

// 포맷팅 관련 유틸리티 함수

/**
 * 시간을 포맷팅하는 함수
 * @param minutes 분 단위 시간
 * @returns 포맷된 시간 문자열
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

/**
 * 거리를 포맷팅하는 함수
 * @param meters 미터 단위 거리
 * @returns 포맷된 거리 문자열
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }

  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)}km`;
}

/**
 * 가격을 포맷팅하는 함수
 * @param price 가격
 * @returns 포맷된 가격 문자열
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString()}원`;
}

/**
 * 날짜를 포맷팅하는 함수
 * @param date 날짜 객체
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 시간을 포맷팅하는 함수
 * @param date 날짜 객체
 * @returns 포맷된 시간 문자열
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * 파일 크기를 포맷팅하는 함수
 * @param bytes 바이트 단위 크기
 * @returns 포맷된 크기 문자열
 */
export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];

  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * snake_case로 내려온 변수 camelCase로 받기
 * @param obj snake_case 인터페이스
 * @returns camelCase 인터페이스
 */
// snake_case → camelCase 변환 함수
const toCamel = (str: string): string =>
  str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );

// 객체 키 재귀 변환
export function snakeToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => snakeToCamel(v)) as any;
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      acc[toCamel(key)] = snakeToCamel(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}
