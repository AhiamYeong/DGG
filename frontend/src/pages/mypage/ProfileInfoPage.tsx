/** @format */

import { useState } from "react";

export default function ProfileInfoPage() {
  const [nickname, setNickname] = useState("홍길동"); // 초기값 예시
  const [email, setEmail] = useState("test@example.com");

  const handleSave = () => {
    console.log("저장:", { nickname, email });
    // TODO: API 연동
  };

  const handleCancel = () => {
    // TODO: 원래 값으로 되돌리기
    console.log("취소");
  };

  return (
    <div className="flex flex-col items-center p-6">
      {/* 페이지 제목 */}
      <h2 className="text-lg font-semibold mb-4">개인정보 수정</h2>

      {/* 카드 */}
      <div className="bg-gray-100 rounded-lg p-6 w-full max-w-md shadow-md">
        <h3 className="font-medium mb-3">회원정보 변경</h3>

        <div className="space-y-3">
          {/* 닉네임 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-green-300"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-green-300"
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-400 text-white rounded-md py-2 text-sm font-medium hover:bg-green-500 transition"
          >
            저장
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 text-sm font-medium hover:bg-gray-300 transition"
          >
            취소
          </button>
        </div>

        {/* 회원탈퇴 */}
        <div className="text-right mt-3">
          <button className="text-sm text-gray-500 hover:underline">
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
