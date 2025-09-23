/** @format */
import { LuCoffee } from "react-icons/lu";
import { RiZzzFill } from "react-icons/ri";
import { FaWalking } from "react-icons/fa";
import { fatigueApi, fatigueHistory } from "@/api/fatigueApi";

// useState의 setter: 상위에서 상태관리 & 하위에서 상태 바꾸기만 하기 위해 분리
// 상태 단일 출처를 상위에만 두기!
// 상태 끌어올리기 (Lifting State Up)
interface Props {
  setFatigue: React.Dispatch<React.SetStateAction<number>>;
  setHistoryData: React.Dispatch<React.SetStateAction<fatigueHistory[]>>;
}

export default function FatigueButtons({ setFatigue, setHistoryData }: Props) {
  const handleClick = async (
    reason: "COFFEE" | "WALK" | "NAP",
    fatigueChange: number
  ) => {
    try {
      const resp = await fatigueApi.put("/fatigues", {
        reason,
        fatigueChange: fatigueChange,
      });
      const updated = resp.data;
      console.log("응답", resp.data);

      // 1. optimistic update
      setFatigue(updated.fatigue);
      setHistoryData((prev) => [
        {
          fatigueId: Date.now(), // 임시 ID
          createdAt: updated.createdAt,
          reason: updated.reason,
          fatigue: updated.fatigue,
          fatigueChange: updated.fatigueChanfe,
        },
        ...prev,
      ]);

      // 2 최종 싱크 맞추기
      try {
        const resp = await fatigueApi.get<fatigueHistory[]>("/fatigues/daily");
        const data = resp.data;
        setHistoryData(data);
      } catch (error) {
        console.error("에러", error);
      }

      // 현재 피로도 갱신
      setFatigue(updated.fatigue);
    } catch (error) {
      console.error("감소 실패", error);
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
