/** @format */
import character from "../../assets/character.png";
import FatigueHistory from "../../components/fatigue/FatigueHistory";
import FatigueProgressbar from "../../components/fatigue/FatigueProgressBar";
import FatigueButtons from "../../components/fatigue/FatigueButtons";
import { useEffect, useState } from "react";
import { fatigueApi, MainFatigueProps } from "@/api/fatigueApi";

// 전부 하드코딩 된 페이지 -> 동적으로 연결 필요
export default function FatigueManagePage() {
  const [fatigue, setFatigue] = useState<number>(0);
  const [nickname, setNickname] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 초기 렌더링시 데이터 불러오기
  useEffect(() => {
    const fetchFatigue = async () => {
      try {
        const res = await fatigueApi.get("/fatigues");
        const data: MainFatigueProps = res.data;

        setFatigue(data.currentFatigue);
        setNickname(data.nickname);
      } catch (err) {
        console.error("에러 발생", err);
      } finally {
        setIsLoading(true);
      }
    };
    fetchFatigue();
  }, []);

  return (
    <div>
      <div className="bg-background p-4">
        <h1 className="text-2xl font-bold text-font mb-4">피로도</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold">
            {/* TOOD: "현재 피로도 관리" 내용 변경하기 */}
            <span className="font-semibold">{nickname}</span>님, <br />
            현재 피로도 관리가 잘 되고 있어요
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

          {/* 버튼 */}
          {/* TODO: 아이콘 추가 */}
          <FatigueButtons></FatigueButtons>
        </div>
      </div>
      <FatigueHistory></FatigueHistory>
    </div>
  );
}
