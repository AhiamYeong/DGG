const About = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          프로젝트 소개
        </h1>
        <p className="text-lg text-gray-600">
          웹뷰 환경에서 사용할 수 있는 모던한 프론트엔드 애플리케이션입니다.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">프로젝트 개요</h2>
          <p className="text-gray-600 mb-6">
            이 프로젝트는 웹뷰 환경에서 최적화된 사용자 경험을 제공하기 위해 
            최신 웹 기술 스택을 활용하여 구축되었습니다.
          </p>

          <h3 className="text-xl font-semibold mb-3">아키텍처 특징</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
            <li>컴포넌트 기반 아키텍처로 재사용성과 유지보수성 향상</li>
            <li>TypeScript를 통한 타입 안전성 보장</li>
            <li>Zustand를 활용한 경량 상태 관리</li>
            <li>React Router를 통한 SPA 라우팅</li>
            <li>Tailwind CSS를 통한 유틸리티 우선 스타일링</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">폴더 구조</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <pre className="text-sm text-gray-700">
{`src/
├── components/     # 재사용 가능한 UI 컴포넌트
├── pages/         # 페이지 컴포넌트
├── hooks/         # 커스텀 React 훅
├── store/         # Zustand 상태 관리
├── utils/         # 유틸리티 함수
├── types/         # TypeScript 타입 정의
├── assets/        # 정적 자산 (이미지, 아이콘 등)
└── styles/        # 스타일 파일`}
            </pre>
          </div>

          <h3 className="text-xl font-semibold mb-3">개발 환경</h3>
          <p className="text-gray-600">
            Vite를 사용하여 빠른 개발 서버와 최적화된 빌드 프로세스를 제공하며, 
            ESLint를 통한 코드 품질 관리와 TypeScript 컴파일러를 통한 타입 체크를 지원합니다.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
