/** @format */
type WeeklyBarChartProps = {
  data: { day: string; value: number; max: number }[];
  label: string;
  color?: string;
};

export default function WeeklyBarChart({
  data,
  label,
  color = "bg-orange-500",
}: WeeklyBarChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="font-semibold mb-2">{label}</h3>
      <div className="flex items-end justify-between h-40">
        {data.map((item, idx) => {
          const percentage = Math.round((item.value / item.max) * 100);
          return (
            <div key={idx} className="flex flex-col items-center flex-1">
              {/* 바 차트 */}
              <div className="relative w-6 h-32 bg-gray-200 rounded">
                <div
                  className={`${color} absolute bottom-0 w-6 rounded`}
                  style={{ height: `${percentage}%` }}
                ></div>
              </div>
              {/* 요일 */}
              <span className="mt-2 text-sm">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
