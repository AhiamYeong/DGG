/** @format */

// TODO: 동적으로 연결
export default function FatigueHistory() {
  return (
    <div className="bg-background p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold">피로도 히스토리</h3>
        <div className="mt-2">
          <p className="text-sm">07:40 아침 기상</p>
          <div className="w-full bg-gray-200 h-3 rounded">
            <div
              className="bg-orange-400 h-3 rounded"
              style={{ width: "25%" }}
            ></div>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm">08:40 커피</p>
          <div className="w-full bg-gray-200 h-3 rounded">
            <div
              className="bg-orange-400 h-3 rounded"
              style={{ width: "20%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
