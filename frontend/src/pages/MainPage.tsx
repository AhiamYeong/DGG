/** @format */

import FatigueProgressbar from "@/components/fatigue/FatigueProgressBar";
import { useEffect, useState } from "react";
import character from "../assets/character.png";
import { fatigueApi } from "@/api/fatigueApi";
import favoriteRoutesApi from "@/api/favoriteRoutes";
import { useNavigate } from "react-router-dom";
import { useNavigationStore } from "@/stores";
import { SimpleRoute } from "@/types";

export default function Mainpage() {
  const [routes, setRoutes] = useState<{ id: number; name: string }[]>([]);
  const [fatigue, setFatigue] = useState<number>(0);
  const [nickname, setNickname] = useState<string>("");

  // TODO: 가장 가까운 알람 추가
  // const [weather, setWeather] = useState<Weather>();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFatigue = async () => {
      try {
        const resp = await fatigueApi.get(`/fatigues`);
        const data = resp.data;

        setNickname(data.nickname);
        setFatigue(data.current_fatigue);
      } catch (err) {
        console.error("에러 발생", err);
      }
    };

    // TODO: 날씨 API

    // 장소 별명 props로 떼오기
    const fetchFavoriteRoute = async () => {
      try {
        const resp = await favoriteRoutesApi.getRouteBookmarks();

        // id, name 묶어서 저장
        const mapped = resp.map((item) => ({
          id: item.bookmarkRouteId,
          name: item.name,
        }));
        setRoutes(mapped);
      } catch (error) {
        console.error("에러 발생", error);
      }
    };
    fetchFatigue();
    fetchFavoriteRoute();
  }, []);

  const handleClick = (path: string) => {
    navigate(`/${path}`);
  };

  const handleRouteClick = async (bookmarkRouteId: number) => {
    try {
      const route: SimpleRoute = await favoriteRoutesApi.getRouteBookmarkDetail(
        bookmarkRouteId
      );

      // map으로 이동
      if (!route.rawData) {
        console.log("route.rawData 존재:", route.rawData);
        route.rawData = {};
      } else {
        console.log("rawData 없음, steps만 사용");
      }
      navigate("/map", { state: route });
      useNavigationStore.getState().startNavigation(route);

      // 네비게이션 시작
    } catch (err) {
      console.error("즐겨찾기 상세 조회 실패:", err);
      alert("경로 상세 정보를 불러오지 못했습니다.");
    }
  };

  return (
    <div>
      <div className="bg-background p-4">
        <h1 className="text-2xl font-bold text-font mb-4">메인화면</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold">
            {/* TOOD: "현재 피로도 관리" 내용 변경하기 */}
            <span className="font-semibold">{nickname}</span>님, 좋은 아침이예요
          </h2>

          {/* 현재 피로도 */}
          <div className="mt-4">
            <FatigueProgressbar
              label="현재 피로도"
              value={fatigue}
            ></FatigueProgressbar>
          </div>

          {/* 캐릭터 */}
          {/* TODO: 동적으로 변경 */}
          <div className="my-6">
            <img src={character} alt="캐릭터" className="w-32 mx-auto" />
          </div>

          {/* TODO: 루트 누르면 경로 이동 */}
          {/* 루트 목록 */}
          <div className="relative">
            <div className="flex flex-row gap-5 overflow-x-auto scrollbar-hide pr-6">
              {routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handleRouteClick(route.id)}
                  className="rounded-lg bg-green-100 px-3 py-1 flex-shrink-0"
                >
                  {route.name}
                </button>
              ))}
            </div>

            {/* 오른쪽 힌트 (그라데이션) */}
            <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white"></div>
          </div>

          {/* 버튼 */}
          <div className="grid gap-2 mt-6">
            <button
              onClick={() => handleClick("map")}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-100"
            >
              <span className="font-bold">어디로 갈까요?</span>
            </button>

            <button
              onClick={() => handleClick("fatigue")}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-100"
            >
              <span className="font-bold">피로도 관리</span>
            </button>

            <button
              onClick={() => handleClick("plan")}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gray-100"
            >
              <span className="font-bold">모임 관리</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
