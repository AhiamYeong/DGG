/** @format */
export default function FatigueDashboardPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold">이번 주 통계 보기</h2>
      <p className="mt-2 text-sm text-gray-600">
        대체로 피로도가 높은 주를 보내고 있어요
      </p>

      {/* TODO: 데이터 연결 시 그래프 컴포넌트로 교체 */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">이번 주 피로도</h3>
        <div className="h-32 bg-gray-100 flex items-center justify-center">
          그래프 자리
        </div>
      </div>
    </div>
  );
}
