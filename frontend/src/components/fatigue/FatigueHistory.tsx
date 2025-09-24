/** @format */
import { fatigueHistory } from "@/api/fatigueApi";

export default function FatigueHistory({ data }: { data: fatigueHistory[] }) {
  return (
    <div className="bg-background p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold">피로도 히스토리</h3>

        {data.map((item, index) => (
          <div key={index} className="mt-3">
            <div className="flex items-center justify-between text-sm">
              {/* 시간 + 라벨 */}
              <span>
                {item.createdAt.split(" ")[1].slice(0, 5)} {item.reason}
              </span>

              {/* 값 + 증감률 */}
              <div className="flex items-center gap-2">
                <span>{item.fatigue}%</span>
                {item.fatigueChange !== undefined && (
                  <span
                    className={
                      item.fatigueChange > 0
                        ? "text-red-500 text-xs"
                        : item.fatigueChange < 0
                        ? "text-blue-600 text-xs"
                        : "text-gray-400 text-xs"
                    }
                  >
                    {item.fatigueChange > 0
                      ? `+${item.fatigueChange}%`
                      : `${item.fatigueChange}%`}
                  </span>
                )}
              </div>
            </div>

            {/* 진행 바 */}
            <div className="w-full bg-gray-200 h-3 rounded mt-1">
              <div
                className="bg-orange-400 h-3 rounded"
                style={{ width: `${item.fatigue}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
