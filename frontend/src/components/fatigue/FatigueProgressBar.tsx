/** @format */
import { IoMdInformationCircleOutline } from "react-icons/io";

type ProgressProps = {
  label: string;
  value: number; // 0 ~ 100
};

export default function FatigueProgressbar({ label, value }: ProgressProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      {/* 좌측 라벨 */}
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>

      {/* 진행바 */}
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-3 bg-orange-400" style={{ width: `${value}%` }}></div>
      </div>

      {/* 우측 퍼센트 + 아이콘 */}
      <span className="text-sm font-medium whitespace-nowrap flex items-center gap-1">
        {value}%
        <IoMdInformationCircleOutline />
      </span>
    </div>
  );
}
