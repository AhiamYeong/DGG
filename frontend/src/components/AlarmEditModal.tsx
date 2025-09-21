/** @format */
import { useState } from "react";

type Alarm = {
  id: number;
  title: string;
  description?: string;
  time: string;
  route: string;
  enabled: boolean;
  notifyBefore: number[];
};

type Props = {
  alarm: Alarm;
  onClose: () => void;
  onSave: (updated: Alarm) => void;
};

export default function AlarmEditModal({ alarm, onClose, onSave }: Props) {
  const [editedAlarm, setEditedAlarm] = useState<Alarm>(alarm);

  const handleCheckboxChange = (min: number, checked: boolean) => {
    const updatedNotify = checked
      ? [...editedAlarm.notifyBefore, min]
      : editedAlarm.notifyBefore.filter((v) => v !== min);
    setEditedAlarm({ ...editedAlarm, notifyBefore: updatedNotify });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
        {/* 제목 */}
        <p className="text-sm font-semibold mb-2">{editedAlarm.title}</p>

        {/* 현재 정보 (읽기 전용) */}
        <p className="text-sm mb-1">출발 시간: {alarm.time}</p>
        <p className="text-sm mb-1">출발지 → 도착지: {alarm.route}</p>

        {/* 언제 알려드릴까요? */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">언제 알려드릴까요?</p>
          <div className="flex gap-3">
            {[10, 30, 60].map((min) => (
              <label
                key={min}
                className={`px-2 py-1 rounded-md text-sm cursor-pointer ${
                  editedAlarm.notifyBefore.includes(min)
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={editedAlarm.notifyBefore.includes(min)}
                  onChange={(e) => handleCheckboxChange(min, e.target.checked)}
                  className="hidden"
                />
                {min}분 전
              </label>
            ))}
          </div>
        </div>

        {/* 출발 시간 수정 */}
        <div className="mt-4">
          <label className="block text-sm text-gray-700 mb-1">
            출발 시간 변경
          </label>
          <input
            type="time"
            value={editedAlarm.time}
            onChange={(e) =>
              setEditedAlarm({ ...editedAlarm, time: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={() => onSave(editedAlarm)}
            className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
