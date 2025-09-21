/** @format */

import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import ProfileInfoPage from "./mypage/ProfileInfoPage";
import ProfileEditPage from "./mypage/ProfileEditPage";
import SettingsPage from "./mypage/SettingsPage";

export default function MyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-font mb-4">마이페이지</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* 상단 nav */}
        <nav className="flex border-b bg-white text-sm text-gray-600">
          <NavLink
            to="/mypage/info"
            className={({ isActive }) =>
              `flex-1 py-3 text-center ${
                isActive
                  ? "text-green-500 font-semibold border-b-2 border-green-400"
                  : ""
              }`
            }
          >
            내 정보
          </NavLink>
          <NavLink
            to="/mypage/edit"
            className={({ isActive }) =>
              `flex-1 py-3 text-center ${
                isActive
                  ? "text-green-500 font-semibold border-b-2 border-green-400"
                  : ""
              }`
            }
          >
            개인정보 수정
          </NavLink>
          <NavLink
            to="/mypage/settings"
            className={({ isActive }) =>
              `flex-1 py-3 text-center ${
                isActive
                  ? "text-green-500 font-semibold border-b-2 border-green-400"
                  : ""
              }`
            }
          >
            설정
          </NavLink>
        </nav>

        {/* 내부 라우팅 */}
        <div className="flex-1 p-4">
          <Routes>
            {/* 기본 접근 시 info로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/mypage/info" replace />} />
            <Route path="/info" element={<ProfileInfoPage />} />
            <Route path="/edit" element={<ProfileEditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
