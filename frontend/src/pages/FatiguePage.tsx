/** @format */
import { useState } from "react";
import FatigueManagePage from "./fatigue/FatigueManagePage";
import FatigueDashboardPage from "./fatigue/FatigueDashboardPage";

export default function FatiguePage() {
  const [view, setView] = useState<"manage" | "dashboard">("manage");

  return (
    <div>
      {/* 상단 탭 */}
      <div className="flex border-b bg-white sticky top-0 z-10">
        <button
          onClick={() => setView("manage")}
          className={`flex-1 p-3 text-center ${
            view === "manage" ? "font-bold border-b-2 border-black" : ""
          }`}
        >
          관리
        </button>
        <button
          onClick={() => setView("dashboard")}
          className={`flex-1 p-3 text-center ${
            view === "dashboard" ? "font-bold border-b-2 border-black" : ""
          }`}
        >
          대시보드
        </button>
      </div>

      {/* 본문 */}
      <div className="p-4">
        {view === "manage" ? <FatigueManagePage /> : <FatigueDashboardPage />}
      </div>
    </div>
  );
}
