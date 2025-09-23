/** @format */
export const mapDayToKorean = (day?: string): string => {
  const map: Record<string, string> = {
    mon: "월요일",
    tue: "화요일",
    wed: "수요일",
    thu: "목요일",
    fri: "금요일",
    sat: "토요일",
    sun: "일요일",
  };

  // 매핑 없으면 원래 값 반환
  return map[day ?? ""] ?? day;
};
