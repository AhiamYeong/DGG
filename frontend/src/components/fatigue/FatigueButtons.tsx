/** @format */
import { LuCoffee } from "react-icons/lu";
import { RiZzzFill } from "react-icons/ri";
import { FaWalking } from "react-icons/fa";
import {
  fatigueApi,
  fatigueHistory,
  fatigueUpdateResponse,
} from "@/api/fatigueApi";

interface Props {
  setFatigue: React.Dispatch<React.SetStateAction<number>>;
  setHistoryData: React.Dispatch<React.SetStateAction<fatigueHistory[]>>;
}

export default function FatigueButtons({ setFatigue, setHistoryData }: Props) {
  const handleClick = async (
    reason: "COFFEE" | "WALK" | "NAP",
    fatigue_change: number
  ) => {
    try {
      const resp = await fatigueApi.put("/fatigues", {
        reason,
        fatigue_change: fatigue_change,
      });
      const updated: fatigueUpdateResponse = resp.data;

      // '낙관적 업데이트'를 통해 UI에 즉시 변경 사항을 반영합니다.
      // 1. 현재 피로도를 업데이트합니다.
      setFatigue(updated.fatigue);

      // 2. 실제 피로도 변화가 있을 때만 히스토리 목록에 새 기록을 추가합니다.
      if (updated.fatigue_change !== 0) {
        setHistoryData((prev) => [
          ...prev,
          {
            fatigueId: Date.now(), // 임시 ID
            created_at: updated.createdAt,
            reason: updated.reason,
            fatigue: updated.fatigue,
            fatigue_change: updated.fatigue_change,
          },
        ]);
      }
    } catch (error) {
      console.error("피로도 업데이트 실패", error);
      // TODO: 사용자에게 에러 발생을 알리는 UI 처리 (예: 토스트 메시지)
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => handleClick("COFFEE", -10)}
        className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-100"
      >
        <LuCoffee className="w-6 h-6" />
        <span className="text-sm">
          커피
          <br />
          마셨어요
        </span>
      </button>

      <button
        onClick={() => handleClick("NAP", -20)}
        className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-100"
      >
        <RiZzzFill className="w-6 h-6" />
        <span className="text-sm">낮잠 잤어요</span>
      </button>

      <button
        onClick={() => handleClick("WALK", -5)}
        className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-100"
      >
        <FaWalking className="w-6 h-6" />
        <span className="text-sm">산책 했어요</span>
      </button>
    </div>
  );
}
