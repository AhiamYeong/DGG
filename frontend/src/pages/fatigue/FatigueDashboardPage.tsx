/** @format */
import WeeklyBarChart from "../../components/fatigue/WeeklyBarChart";

export default function FatigueDashboardPage() {
  // mock/fatigueStats.ts
  const weeklyFatigue = [
    { day: "월", value: 20, max: 60 },
    { day: "화", value: 35, max: 70 },
    { day: "수", value: 25, max: 50 },
    { day: "목", value: 40, max: 65 },
    { day: "금", value: 50, max: 80 },
    { day: "토", value: 30, max: 60 },
    { day: "일", value: 45, max: 70 },
  ];

  const weeklySteps = [
    { day: "월", value: 8000, max: 10000 },
    { day: "화", value: 6000, max: 10000 },
    { day: "수", value: 9500, max: 10000 },
    { day: "목", value: 7000, max: 10000 },
    { day: "금", value: 5000, max: 10000 },
    { day: "토", value: 8500, max: 10000 },
    { day: "일", value: 9000, max: 10000 },
  ];

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold">이번 주 통계 보기</h2>
        <p className="mt-2 text-sm text-gray-600">
          대체로 피로도가 높은 주를 보내고 있어요
        </p>

        {/* 이번 주 피로도 */}
        <WeeklyBarChart data={weeklyFatigue} label="이번 주 피로도" />
        <p className="text-sm text-gray-600 mb-4">
          금요일에 피로도가 가장 높았어요
        </p>

        {/* 이번 주 걸음수 */}
        <WeeklyBarChart data={weeklySteps} label="이번 주 걸음수" />
        <p className="text-sm text-gray-600 mb-4">
          금요일에 가장 많이 걸었어요
        </p>
      </div>
    </div>
  );
}
