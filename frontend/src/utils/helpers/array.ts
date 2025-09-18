// 배열 관련 유틸리티 함수

/**
 * 배열에서 중복 제거
 * @param array 중복 제거할 배열
 * @returns 중복이 제거된 배열
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * 객체 배열에서 특정 키로 중복 제거
 * @param array 객체 배열
 * @param key 중복 제거 기준이 될 키
 * @returns 중복이 제거된 배열
 */
export function removeDuplicatesByKey<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 배열을 청크로 나누기
 * @param array 나눌 배열
 * @param size 청크 크기
 * @returns 청크 배열
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 배열에서 랜덤 요소 선택
 * @param array 선택할 배열
 * @returns 랜덤 요소
 */
export function getRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * 배열에서 여러 랜덤 요소 선택
 * @param array 선택할 배열
 * @param count 선택할 개수
 * @returns 랜덤 요소 배열
 */
export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * 배열 그룹화
 * @param array 그룹화할 배열
 * @param keySelector 그룹 키 선택 함수
 * @returns 그룹화된 객체
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keySelector: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keySelector(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * 배열 정렬 (안전한 정렬)
 * @param array 정렬할 배열
 * @param compareFn 비교 함수
 * @returns 정렬된 새 배열
 */
export function safeSort<T>(array: T[], compareFn?: (a: T, b: T) => number): T[] {
  return [...array].sort(compareFn);
}
