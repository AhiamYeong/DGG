/** @format */
import { useState } from "react";
import { AlarmProps, AlarmUpdateProps, AllowedOffsets } from "@/api/alarmApi";

type Props = {
  alarm: AlarmProps;
  onClose: () => void;
  onSave: (updated: AlarmUpdateProps) => void;
};

export default function AlarmEditModal({ alarm, onClose, onSave }: Props) {
  const [editedAlarm, setEditedAlarm] = useState<AlarmProps>(alarm);
  // 수정 모달 내부 상태용
  const [selectedOffsets, setSelectedOffsets] = useState<AllowedOffsets[]>(
    [editedAlarm.offsetMinutes as AllowedOffsets] // 기존 값 하나로 초기화
  );

  const allowedOffsets = [10, 30, 60] as const;

  const handleSave = () => {
    onSave({
      eventTitle: editedAlarm.eventTitle,
      offsetMinutesList: selectedOffsets,
    });
    onClose();
  };

  const handleCheckboxChange = (min: AllowedOffsets, checked: boolean) => {
    setSelectedOffsets((prev) =>
      checked ? [...prev, min] : prev.filter((v) => v !== min)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
        {/* 제목 */}
        <p className="text-sm font-semibold mb-2">{editedAlarm.title}</p>

        {/* 현재 정보 (읽기 전용) */}
        <p className="text-sm mb-1">출발 시간: {alarm.departureTime}</p>
        <p className="text-sm mb-1">{`${alarm.departure}  → ${alarm.destination}`}</p>

        {/* 알림 제목 수정 */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">알림 이름 변경</p>
          {/* eventTitle */}
          <input
            type="text"
            defaultValue={alarm.eventTitle}
            onChange={(e) =>
              setEditedAlarm({ ...editedAlarm, eventTitle: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
        </div>

        {/* 언제 알려드릴까요? */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">언제 알려드릴까요?</p>
          <div className="flex gap-3">
            {allowedOffsets.map((min) => (
              <label
                key={min}
                className={`px-2 py-1 rounded-md text-sm cursor-pointer ${
                  selectedOffsets.includes(min)
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedOffsets.includes(min)}
                  onChange={(e) => handleCheckboxChange(min, e.target.checked)}
                  className="hidden"
                />
                {min}분 전
              </label>
            ))}
          </div>
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
            onClick={handleSave} // 여기서 호출
            className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
