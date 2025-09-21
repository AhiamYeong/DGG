/** @format */
import FatigueHistory from "../components/fatigue/FatigueHistory";
import character from "../assets/character.png";

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
            <p className="text-sm">현재 피로도</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-orange-400 h-4 rounded-full"
                style={{ width: "20%" }}
              ></div>
            </div>
          </div>

          {/* 캐릭터 */}
          {/* TODO: 동적으로 변경 */}
          <div className="my-6">
            <img src={character} alt="캐릭터" className="w-32 mx-auto" />
          </div>

          {/* 버튼 */}
          {/* TODO: 아이콘 추가 */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button className="px-4 py-2 rounded-lg bg-gray-100">
              커피 마셨어요
            </button>
            <button className="px-4 py-2 rounded-lg bg-gray-100">
              낮잠 잤어요
            </button>
            <button className="px-4 py-2 rounded-lg bg-gray-100">
              산책 했어요
            </button>
          </div>
        </div>
      </div>
      <FatigueHistory></FatigueHistory>
    </div>
  );
}
