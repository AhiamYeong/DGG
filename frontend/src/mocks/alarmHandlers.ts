/**
 * alarm Mocking Handlers
 *
 * @format
 */
import { AlarmCreateProps, AlarmProps, AlarmUpdateProps } from "@/api/alarmApi";
import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://j13a305.p.ssafy.io/api/v1";

// let으로 선언해야 변경 가능
let MockAlarms: AlarmProps[] = [
  {
    alarmId: 1201,
    title: "10분 전 알림",
    eventId: 777,
    eventTitle: "멀캠멀캠",
    departureTime: "2025-09-18 08:30:00",
    departure: "집",
    destination: "멀티캠퍼스",
    offsetMinutes: 10,
    enabled: true,
  },
  {
    alarmId: 1202,
    title: "30분 전 알림",
    eventId: 778,
    eventTitle: "맛있는 족발",
    departureTime: "2025-09-18 09:00:00",
    departure: "집",
    destination: "윤민원",
    offsetMinutes: 30,
    enabled: false,
  },
  {
    alarmId: 1203,
    title: "10분 전 알림",
    eventId: 778,
    eventTitle: "맛있는 족발",
    departureTime: "2025-09-18 09:00:00",
    departure: "집",
    destination: "윤민원",
    offsetMinutes: 10,
    enabled: false,
  },
];

export const alarmHandlers = [
  // 알림 리스트 조회
  http.get(`${API_BASE_URL}/alarm`, () => {
    return HttpResponse.json(MockAlarms);
  }),

  // 알림 생성 (추가 필요 시 작성)
  http.post(`${API_BASE_URL}/alarm`, async ({ request }) => {
    const body = (await request.json()) as AlarmCreateProps;

    const newAlarms = body.offsetMinutesList.map((offset, idx) => {
      const newId =
        MockAlarms.length > 0
          ? Math.max(...MockAlarms.map((a) => a.alarmId)) + 1 + idx
          : 1 + idx;

      return {
        alarmId: newId, // 서버가 발급한다고 가정
        title: `${offset}분 전 알림`,
        eventId: Date.now(), // mock에서는 timestamp 등으로 대체
        eventTitle: body.eventTitle,
        departureTime: body.departureTime,
        departure: body.departure,
        destination: body.destination,
        offsetMinutes: offset,
        enabled: body.enabled,
      } as AlarmProps;
    });

    // Mock 데이터에 추가
    MockAlarms = [...MockAlarms, ...newAlarms];

    // 전체 리스트 반환
    return HttpResponse.json(MockAlarms, { status: 201 });
  }),

  // 알림 수정
  http.put(`${API_BASE_URL}/alarm/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as AlarmUpdateProps;

    // Mock 데이터 업데이트
    MockAlarms = MockAlarms.map((alarm) =>
      alarm.alarmId === Number(id)
        ? {
            ...alarm,
            eventTitle: body.eventTitle ?? alarm.eventTitle,
            offsetMinutes: body.offsetMinutesList[0] ?? alarm.offsetMinutes,
          }
        : alarm
    );

    // 전체 리스트 반환
    return HttpResponse.json(MockAlarms, { status: 200 });
  }),

  // 알림 on/off
  http.patch(`${API_BASE_URL}/alarm/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as { enabled: boolean };

    MockAlarms = MockAlarms.map((alarm) =>
      alarm.alarmId === Number(id) ? { ...alarm, enabled: body.enabled } : alarm
    );

    return new HttpResponse(null, { status: 204 });
  }),

  // 알림 삭제
  http.delete(`${API_BASE_URL}/alarm/:id`, async ({ params }) => {
    const { id } = params;

    MockAlarms = MockAlarms.filter((alarm) => alarm.alarmId !== Number(id));

    return HttpResponse.json(MockAlarms, { status: 200 });
  }),

  // 가까운 알림
  http.get(`${API_BASE_URL}/alarm/next`, async () => {
    const nextAlarm =
      MockAlarms.find((alarm) => alarm.enabled) ?? MockAlarms[0];

    return HttpResponse.json(
      {
        eventTitle: nextAlarm.eventTitle,
        departureTime: nextAlarm.departureTime,
        departure: nextAlarm.departure,
        destination: nextAlarm.destination,
        offsetMinutes: nextAlarm.offsetMinutes,
      },
      { status: 200 }
    );
  }),
];
