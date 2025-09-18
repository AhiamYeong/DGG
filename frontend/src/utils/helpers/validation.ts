// 유효성 검사 관련 유틸리티 함수

/**
 * 이메일 유효성 검사
 * @param email 이메일 주소
 * @returns 유효성 여부
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 전화번호 유효성 검사
 * @param phone 전화번호
 * @returns 유효성 여부
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
  return phoneRegex.test(phone);
}

/**
 * 비밀번호 유효성 검사
 * @param password 비밀번호
 * @returns 유효성 여부
 */
export function isValidPassword(password: string): boolean {
  // 최소 8자, 영문, 숫자, 특수문자 포함
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * 좌표 유효성 검사
 * @param lat 위도
 * @param lng 경도
 * @returns 유효성 여부
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * URL 유효성 검사
 * @param url URL
 * @returns 유효성 여부
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 빈 값 검사
 * @param value 검사할 값
 * @returns 빈 값 여부
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 숫자 범위 검사
 * @param value 검사할 값
 * @param min 최소값
 * @param max 최대값
 * @returns 범위 내 여부
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
