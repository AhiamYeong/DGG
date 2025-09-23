/** @format */
import { useEffect, useState } from "react";
import { mypageApi, InfoProps } from "../../api/mypageApi";

export default function ProfileInfoPage() {
  const [profile, setProfile] = useState<InfoProps | null>(null);
  const [originalProfile, setOriginalProfile] = useState<InfoProps | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  // 프로필 조회
  useEffect(() => {
    (async () => {
      try {
        const res = await mypageApi.get<InfoProps>("mypage/profile");
        setProfile(res.data);
        setOriginalProfile(res.data);
      } catch (err) {
        console.error("프로필 조회 실패", err);
      }
    })();
  }, []);

  // 저장
  const handleSave = async () => {
    if (!profile) return;
    try {
      const res = await mypageApi.patch<InfoProps>("mypage/profile", profile, {
        withCredentials: true,
      });
      alert("저장 성공");
      setProfile(res.data);
      setOriginalProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("저장 실패", err);
      alert("저장 실패");
    }
  };

  // 취소
  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await mypageApi.post(`auth/logout`);
      alert("로그아웃 완료");
    } catch (error) {
      console.error("에러", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await mypageApi.patch(`mypage/me`);
      alert("회원탈퇴 완료");
    } catch (error) {
      console.error("에러", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-lg font-semibold mb-4">개인정보 수정</h2>

      <div className="bg-gray-100 rounded-lg p-6 w-full max-w-md shadow-md">
        <h3 className="font-medium mb-3">회원정보</h3>

        <div className="space-y-3">
          {/* 닉네임 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">닉네임</label>
            {isEditing ? (
              <input
                type="text"
                value={profile?.nickname ?? ""}
                onChange={(e) =>
                  setProfile(
                    (prev) => prev && { ...prev, nickname: e.target.value }
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-green-300"
              />
            ) : (
              <p className="text-sm text-gray-800">{profile?.nickname}</p>
            )}
          </div>

          {/* 이메일 → 항상 읽기 전용 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">이메일</label>
            <p className="text-sm text-gray-800">{profile?.email}</p>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-2 mt-6">
          {isEditing ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-blue-400 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-500 transition"
            >
              수정
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => handleLogout()}
            className="flex-1 bg-gray-400 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-500 transition"
          >
            로그아웃
          </button>
        </div>

        <div className="text-right mt-3">
          <button
            onClick={() => handleWithdraw()}
            className="text-sm text-gray-500 hover:underline"
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
