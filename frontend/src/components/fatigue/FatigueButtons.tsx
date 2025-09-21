/** @format */
import { LuCoffee } from "react-icons/lu";
import { RiZzzFill } from "react-icons/ri";
import { FaWalking } from "react-icons/fa";

export default function FatigueButtons() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-100">
        <LuCoffee className="w-6 h-6" />
        <span className="text-sm">
          커피
          <br />
          마셨어요
        </span>
      </button>

      <button className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-100">
        <RiZzzFill className="w-6 h-6" />
        <span className="text-sm">낮잠 잤어요</span>
      </button>

      <button className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-100">
        <FaWalking className="w-6 h-6" />
        <span className="text-sm">산책 했어요</span>
      </button>
    </div>
  );
}
