/** @format */
import { useEffect, useState } from "react";
import AlarmEditModal from "../components/AlarmEditModal";
import { AlarmProps, AlarmUpdateProps, alarmApi } from "@/api/alarmApi";

// 날짜 형식을 "M월 D일 H시 m분"으로 변환하는 함수
const formatDepartureTime = (timeString: string) => {
  if (!timeString) return "";
  try {
    const date = new Date(timeString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}월 ${day}일 ${hours}시 ${minutes}분`;
  } catch (error) {
    console.error("Invalid time string:", timeString, error);
    return "시간 정보 없음";
  }
};

export default function AlarmPage() {
  const [alarms, setAlarms] = useState<AlarmProps[]>([]);
  // 수정하는 알람 객체 1개
  const [editingAlarm, setEditingAlarm] = useState<AlarmProps | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 초기 렌더링
  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const res = await alarmApi.get<AlarmProps[]>("alarm");
        setAlarms(res.data);
      } catch (error) {
        console.error("알람 불러오기 에러", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlarms();
  }, []);

  const toggleAlarm = async (id: number, currentEnabled: boolean) => {
    // 1. 프론트 상태 즉시 업데이트 (UI 반응 먼저)
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.alarmId === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );

    try {
      // 2. 백엔드에 PATCH 요청 (enabled만 전달)
      await alarmApi.patch(`/alarm/${id}`, {
        enabled: !currentEnabled,
      });
      console.log(`알람 ${id} 상태 변경 성공`);
    } catch (error) {
      console.error("알람 상태 변경 실패", error);

      // 3. 실패 시 UI 롤백
      setAlarms((prev) =>
        prev.map((alarm) =>
          alarm.alarmId === id ? { ...alarm, enabled: currentEnabled } : alarm
        )
      );
    }
  };

  const handleDelete = async (id: number) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.alarmId !== id));

    // 백엔드에 요청
    try {
      await alarmApi.delete(`alarm/${id}`);
    } catch (error) {
      console.error("삭제 에러", error);
    }
  };

  const handleSaveEdit = async (updated: AlarmUpdateProps) => {
    if (!editingAlarm) return;

    try {
      // 1. API에 수정 요청을 보냅니다.
      await alarmApi.put(`/alarm/${editingAlarm.alarmId}`, updated);

      // 2. 모달을 닫습니다.
      setEditingAlarm(null);

      // 3. 서버로부터 최신 알람 목록을 다시 불러와 화면을 갱신합니다.
      // 이렇게 하면 여러 개의 알림 시간이 선택되었을 경우에도 정확히 반영됩니다.
      const res = await alarmApi.get<AlarmProps[]>("alarm");
      setAlarms(res.data);
    } catch (error) {
      console.error("알람 수정 실패", error);
      // TODO: 사용자에게 에러 발생을 알리는 UI 처리
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-lg font-semibold mb-4">알림 모아보기</h2>

      {isLoading ? (
        // ⬇️ 로딩 중일 때
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">불러오는 중...</p>
          {/* 혹은 스피너 */}
          {/* <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div> */}
        </div>
      ) : alarms.length === 0 ? (
        // ⬇️ 알람이 없을 때
        <p className="text-gray-500">알람이 없습니다.</p>
      ) : (
        // ⬇️ 알람 리스트
        <div className="bg-white rounded-lg shadow-md w-full max-w-md p-4 space-y-3">
          {alarms.map((alarm) => (
            <div
              key={alarm.alarmId}
              className="bg-gray-100 rounded-md px-4 py-3 flex flex-col gap-2"
            >
              {/* 상단 제목 + 버튼 */}
              <div className="flex justify-between items-center">
                <div className="flex flex-row gap-2">
                  <p className="font-semibold text-sm">{alarm.title}</p>
                  <p className="text-sm">{alarm.eventTitle}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingAlarm(alarm)}
                    className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(alarm.alarmId)}
                    className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* 시간 & 경로 */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm">
                    {formatDepartureTime(alarm.departureTime)} 출발
                  </p>
                  <p className="text-sm text-gray-600">{`${alarm.departure} -> ${alarm.destination}`}</p>
                </div>
                {/* 토글 */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={alarm.enabled}
                    onChange={() => toggleAlarm(alarm.alarmId, alarm.enabled)}
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-400 transition"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

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
