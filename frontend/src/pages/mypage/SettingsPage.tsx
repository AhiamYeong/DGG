/** @format */

import { AlarmSettingsProps, mypageApi } from "@/api/mypageApi";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AlarmSettingsProps>({
    generalEnabled: false,
    sleepEnabled: false,
  });

  const [originalSettings, setOriginalSettings] = useState<AlarmSettingsProps>({
    generalEnabled: false,
    sleepEnabled: false,
  });

  // 기존 세팅 불러오기
  useEffect(() => {
    (async () => {
      try {
        const res = await mypageApi.get<AlarmSettingsProps>(
          "mypage/alarm/settings"
        );
        setSettings(res.data);
        console.log("기존 설정 불러오기 성공");
      } catch (err) {
        console.error("설정 조회 실패:", err);
      }
    })();
  }, []);

  const handleSave = async () => {
    console.log("저장된 설정:", settings);
    try {
      await mypageApi.patch<AlarmSettingsProps>(
        "mypage/alarm/settings",
        settings
      );
      setOriginalSettings(settings); // 저장 성공 후 원본도 갱신
      alert("저장 성공!");
    } catch (err) {
      console.error("저장 실패:", err);
    }
  };

  const handleCancel = () => {
    setSettings(originalSettings); // 원래 불러온 값으로 복원
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
              checked={settings.generalEnabled}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  generalEnabled: e.target.checked,
                }))
              }
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
              checked={settings.sleepEnabled}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sleepEnabled: e.target.checked,
                }))
              }
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
