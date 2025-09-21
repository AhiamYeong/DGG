/** @format */

// TODO: 동적으로 연결
type HistoryItem = {
  time: string;
  label: string;
  value: number; // 현재 피로도
  change?: number; // 증감률 (%)
};

const historyData: HistoryItem[] = [
  { time: "07:40", label: "아침 기상", value: 25 },
  { time: "08:40", label: "커피", value: 20, change: -5 },
  { time: "10:40", label: "출근", value: 40, change: +20 },
];

export default function FatigueHistory() {
  return (
    <div className="bg-background p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold">피로도 히스토리</h3>

        {historyData.map((item, index) => (
          <div key={index} className="mt-3">
            <div className="flex items-center justify-between text-sm">
              {/* 시간 + 라벨 */}
              <span>
                {item.time} {item.label}
              </span>

              {/* 값 + 증감률 */}
              <div className="flex items-center gap-2">
                <span>{item.value}%</span>
                {item.change !== undefined && (
                  <span
                    className={
                      item.change > 0
                        ? "text-red-500 text-xs"
                        : item.change < 0
                        ? "text-blue-600 text-xs"
                        : "text-gray-400 text-xs"
                    }
                  >
                    {item.change > 0 ? `+${item.change}%` : `${item.change}%`}
                  </span>
                )}
              </div>
            </div>

            {/* 진행 바 */}
            <div className="w-full bg-gray-200 h-3 rounded mt-1">
              <div
                className="bg-orange-400 h-3 rounded"
                style={{ width: `${item.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
