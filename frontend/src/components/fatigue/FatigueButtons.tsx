/** @format */
import { LuCoffee } from "react-icons/lu";
import { RiZzzFill } from "react-icons/ri";
import { FaWalking } from "react-icons/fa";
import { fatigueApi } from "@/api/fatigueApi";

export default function FatigueButtons() {
  const handleClick = async (
    reason: "COFFEE" | "WALK" | "NAP",
    fatigueChange: number
  ) => {
    try {
      const resp = await fatigueApi.put("/fatigues", {
        reason,
        fatigueChange: fatigueChange,
      });
      console.log("응답", resp.data);

      // TODO: 상태 갱신
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
