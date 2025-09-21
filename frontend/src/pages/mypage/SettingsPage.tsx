/** @format */

import { useState } from "react";

export default function SettingsPage() {
  const [alarm, setAlarm] = useState(true);
  const [sleepAlarm, setSleepAlarm] = useState(false);

  const handleSave = () => {
    console.log("저장된 설정:", { alarm, sleepAlarm });
    // TODO: API 연동
  };

  const handleCancel = () => {
    // 원래 상태로 복원하도록 구현 가능
    setAlarm(true);
    setSleepAlarm(false);
  };

  return (
    <div className="flex flex-col items-center p-6">
      {/* 제목 */}
      <h2 className="text-lg font-semibold mb-4">push 알람 설정</h2>

      {/* 카드 */}
      <div className="bg-gray-50 border rounded-lg p-4 w-full max-w-md shadow-sm space-y-3">
        {/* 알림 */}
        <div className="flex justify-between items-center bg-gray-100 rounded-md px-4 py-3">
          <span className="text-gray-800 text-sm">알림</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={alarm}
              onChange={(e) => setAlarm(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-400 transition"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </div>

        {/* 잠자기 시간 알림 */}
        <div className="flex justify-between items-center bg-gray-100 rounded-md px-4 py-3">
          <span className="text-gray-800 text-sm">잠자기 시간 알림</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={sleepAlarm}
              onChange={(e) => setSleepAlarm(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-400 transition"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 mt-6 w-full max-w-md">
        <button
          onClick={handleSave}
          className="flex-1 bg-green-400 text-white rounded-md py-2 text-sm font-medium hover:bg-green-500 transition"
        >
          저장
        </button>
        <button
          onClick={handleCancel}
          className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 text-sm font-medium hover:bg-gray-300 transition"
        >
          취소
        </button>
      </div>
    </div>
  );
}
