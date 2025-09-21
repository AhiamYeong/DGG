/** @format */
import { useState } from "react";
import AlarmEditModal from "../components/AlarmEditModal";

type Alarm = {
  id: number;
  title: string;
  description?: string;
  time: string;
  route: string;
  enabled: boolean;
  notifyBefore: number[];
};

const initialAlarms: Alarm[] = [
  {
    id: 1,
    title: "10분 전",
    description: "맥날 감튀털이",
    time: "08:30",
    route: "집 → 멀티캠퍼스",
    enabled: true,
    notifyBefore: [10, 30],
  },
  {
    id: 2,
    title: "30분 전",
    description: "",
    time: "09:00",
    route: "집 → 학교",
    enabled: false,
    notifyBefore: [30],
  },
];

export default function AlarmPage() {
  const [alarms, setAlarms] = useState<Alarm[]>(initialAlarms);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  const toggleAlarm = (id: number) => {
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  };

  const handleDelete = (id: number) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
  };

  const handleSaveEdit = (updated: Alarm) => {
    setAlarms((prev) =>
      prev.map((alarm) => (alarm.id === updated.id ? updated : alarm))
    );
    setEditingAlarm(null);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-lg font-semibold mb-4">알림 모아보기</h2>

      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-4 space-y-3">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className="bg-gray-100 rounded-md px-4 py-3 flex flex-col gap-2"
          >
            {/* 상단 제목 + 버튼 */}
            <div className="flex justify-between items-center">
              <div className="flex flex-row gap-2">
                <p className="font-semibold text-sm">{alarm.title}</p>
                <p className="text-sm">{alarm.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingAlarm(alarm)}
                  className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(alarm.id)}
                  className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  삭제
                </button>
              </div>
            </div>

            {/* 시간 & 경로 */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">{alarm.time} 출발</p>
                <p className="text-sm text-gray-600">{alarm.route}</p>
              </div>
              {/* 토글 */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={alarm.enabled}
                  onChange={() => toggleAlarm(alarm.id)}
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-400 transition"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {editingAlarm && (
        <AlarmEditModal
          alarm={editingAlarm}
          onClose={() => setEditingAlarm(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
