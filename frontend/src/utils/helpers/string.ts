// 문자열 관련 유틸리티 함수

/**
 * 문자열을 카멜케이스로 변환
 * @param str 변환할 문자열
 * @returns 카멜케이스 문자열
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * 문자열을 케밥케이스로 변환
 * @param str 변환할 문자열
 * @returns 케밥케이스 문자열
 */
export function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * 문자열을 파스칼케이스로 변환
 * @param str 변환할 문자열
 * @returns 파스칼케이스 문자열
 */
export function toPascalCase(str: string): string {
  return str.replace(/(^|-)([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * 문자열을 스네이크케이스로 변환
 * @param str 변환할 문자열
 * @returns 스네이크케이스 문자열
 */
export function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * 문자열 자르기 (말줄임표 추가)
 * @param str 자를 문자열
 * @param length 최대 길이
 * @param suffix 접미사 (기본: '...')
 * @returns 자른 문자열
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
}

/**
 * 문자열에서 HTML 태그 제거
 * @param str HTML 태그가 포함된 문자열
 * @returns HTML 태그가 제거된 문자열
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * 문자열에서 특수문자 제거
 * @param str 특수문자가 포함된 문자열
 * @returns 특수문자가 제거된 문자열
 */
export function removeSpecialCharacters(str: string): string {
  return str.replace(/[^a-zA-Z0-9가-힣\s]/g, '');
}

/**
 * 문자열에서 공백 제거
 * @param str 공백이 포함된 문자열
 * @returns 공백이 제거된 문자열
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s/g, '');
}

/**
 * 문자열을 단어 단위로 자르기
 * @param str 자를 문자열
 * @param wordCount 단어 개수
 * @returns 자른 문자열
 */
export function truncateWords(str: string, wordCount: number): string {
  const words = str.split(' ');
  if (words.length <= wordCount) return str;
  return words.slice(0, wordCount).join(' ') + '...';
}

/**
 * 문자열에서 첫 글자만 대문자로 변환
 * @param str 변환할 문자열
 * @returns 첫 글자가 대문자인 문자열
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 문자열에서 모든 단어의 첫 글자를 대문자로 변환
 * @param str 변환할 문자열
 * @returns 모든 단어의 첫 글자가 대문자인 문자열
 */
export function capitalizeWords(str: string): string {
  return str.split(' ').map(word => capitalize(word)).join(' ');
}
