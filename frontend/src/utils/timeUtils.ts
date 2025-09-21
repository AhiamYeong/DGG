/**
 * 시간 관련 유틸리티 함수들
 */

/**
 * 현재 시간을 기준으로 최소 선택 가능한 시간을 반환
 * 15분 단위로 반올림
 */
export const getMinTime = (): Date => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // 현재 시간의 15분 단위로 반올림
  const roundedMinute = Math.ceil(currentMinute / 15) * 15;
  const minTime = new Date();
  minTime.setHours(currentHour, roundedMinute, 0, 0);
  
  return minTime;
};

/**
 * 주어진 시간이 현재 시간인지 확인 (5분 이내 차이)
 */
export const isCurrentTime = (time: Date): boolean => {
  const now = new Date();
  const timeDiff = Math.abs(time.getTime() - now.getTime());
  return timeDiff <= 5 * 60 * 1000; // 5분 = 5 * 60 * 1000ms
};

/**
 * 출발 옵션과 시간에 따른 액션 라벨 결정
 */
export const getActionLabel = (
  departureTime: Date, 
  option: 'now' | 'schedule'
): string => {
  if (option === 'now') return '안내 시작';
  
  // 현재 시간과의 차이 계산
  const now = new Date();
  const timeDiff = departureTime.getTime() - now.getTime();
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  
  // 5분 이상 차이나면 "경로 예약", 그렇지 않으면 "안내 시작"
  return minutesDiff >= 5 ? '경로 예약' : '안내 시작';
};

/**
 * 시간을 한국어 형식으로 포맷팅
 */
export const formatTime = (date: Date | { hour: number; minute: number }): string => {
  if (date instanceof Date) {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } else {
    // TimeSlot 타입 처리
    const hour = date.hour;
    const minute = date.minute;
    const period = hour >= 12 ? '오후' : '오전';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${period} ${displayHour}:${minute.toString().padStart(2, '0')}`;
  }
};

/**
 * Date 객체를 yyyy-MM-dd HH:mm:ss 형식의 문자열로 변환
 */
export const formatDateTimeForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};