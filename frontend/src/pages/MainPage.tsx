/** @format */

import FatigueProgressbar from "@/components/fatigue/FatigueProgressBar";
import { useEffect, useState } from "react";
import character from "../assets/character.png";
import { fatigueApi } from "@/api/fatigueApi";
import bookmarkApi from "@/api/bookmarkApi";
import { useNavigate } from "react-router-dom";

export default function Mainpage() {
  const [nickname, setNickname] = useState<String>("");
  const [fatigue, setFatigue] = useState<number>(0);

  // TODO: 가장 가까운 알람 추가
  // const [weather, setWeather] = useState<Weather>();
  const [routeNames, setRouteNames] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFatigue = async () => {
      const resp = await fatigueApi.get(`/fatigues`);
      const data = resp.data;

      setNickname(data.nickname);
      setFatigue(data.currentFatigue);
    };

    // TODO: 날씨 API

    // 장소 별명 props로 떼오기
    const fetchFavoriteRoute = async () => {
      const resp = await bookmarkApi.getRouteBookmarks();
      const names = resp.map((item) => item.name);
      setRouteNames(names);
    };
    fetchFatigue();
    fetchFavoriteRoute();
  }, []);

  const handleClick = (path: string) => {
    navigate(`/${path}`);
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
          <div className="flex flex-row gap-5 justify-center">
            {routeNames.map((item, idx) => (
              <button
                key={idx}
                className="rounded-lg bg-green-100 px-1 py-1"
                onClick={() => handleClick("")}
              >
                {item}
              </button>
            ))}
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
