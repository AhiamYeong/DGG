/** @format */
import { useEffect, useState } from "react";
import WeeklyBarChart from "../../components/fatigue/WeeklyBarChart";
import {
  fatigueApi,
  fatigueDataProps,
  footStepDataProps,
} from "@/api/fatigueApi";
import { mapDayToKorean } from "@/utils/dayUtils";

export default function FatigueDashboardPage() {
  const [weeklyFatigues, setWeeklyFatigues] = useState<fatigueDataProps[]>([]);
  const [weeklyFootSteps, setWeeklyFootSteps] = useState<footStepDataProps[]>(
    []
  );

  // 초기 렌더링 데이터 불러오기
  useEffect(() => {
    const fetchWeeklyFatigue = async () => {
      try {
        const resp = await fatigueApi.get(`/info/fatigues`);
        const data = resp.data;
        setWeeklyFatigues(data.data);
      } catch (error) {
        console.error("에러", error);
      }
    };

    const fetchWeeklyFootStep = async () => {
      try {
        const resp = await fatigueApi.get(`/info/foot-steps`);
        const data = resp.data;
        setWeeklyFootSteps(data.data);
      } catch (error) {
        console.error("에러", error);
      }
    };
    fetchWeeklyFatigue();
    fetchWeeklyFootStep();
  }, []);

  const maxFatigue = Math.max(...weeklyFatigues.map((f) => f.fatigue));
  const maxFatigueDay = weeklyFatigues.find(
    (f) => f.fatigue === maxFatigue
  )?.day;

  const maxFootStep = Math.max(...weeklyFootSteps.map((f) => f.footStep));
  const maxFootStepDay = weeklyFootSteps.find(
    (f) => f.footStep === maxFootStep
  )?.day;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold">이번 주 통계 보기</h2>
        <p className="mt-2 text-sm text-gray-600">
          대체로 피로도가 높은 주를 보내고 있어요
        </p>

        {/* 전부 map으로 변환해서 props 넘기기 */}
        {/* 이번 주 피로도 */}
        <WeeklyBarChart
          data={weeklyFatigues.map((f) => ({ day: f.day, value: f.fatigue }))}
          label="이번 주 피로도"
        />
        <p className="text-sm text-gray-600 mb-4">
          {mapDayToKorean(maxFatigueDay)}에 피로도가 가장 높았어요
        </p>

        {/* TODO: 걸음 수 비교 로직 확인 */}
        {/* 이번 주 걸음수 */}
        <WeeklyBarChart
          data={weeklyFootSteps.map((f) => ({ day: f.day, value: f.footStep }))}
          label="이번 주 걸음수"
          max={Math.max(...weeklyFootSteps.map((f) => f.footStep))}
        />
        <p className="text-sm text-gray-600 mb-4">
          {mapDayToKorean(maxFootStepDay)}에 가장 많이 걸었어요
        </p>
      </div>
    </div>
  );
}
