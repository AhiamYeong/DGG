/** @format */
import character from "../assets/character.png";
import FatigueHistory from "../components/fatigue/FatigueHistory";
import FatigueProgressbar from "../components/fatigue/FatigueProgressBar";
import FatigueButtons from "../components/fatigue/FatigueButtons";

// 전부 하드코딩 된 페이지 -> 동적으로 연결 필요
export default function FatiguePage() {
  return (
    <div>
      <div className="bg-background p-4">
        <h1 className="text-2xl font-bold text-font mb-4">피로도</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold">
            <span className="font-semibold">닉네임</span>님, <br />
            현재 피로도 관리가 잘 되고 있어요
          </h2>

          {/* 현재 피로도 */}
          <div className="mt-4">
            <FatigueProgressbar
              label="현재 피로도"
              value={20}
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
