/** @format */

import { fatigueApi, SurveyAnswerProps } from "@/api/fatigueApi";
import { useEffect, useState } from "react";

// 질문 - fix
type Question = {
  id: number;
  text: string;
};

const questions: Question[] = [
  { id: 1, text: "환승 지점까지 10분 이상 걸어도 괜찮은가요?" },
  { id: 2, text: "추위에 강한가요?" },
  { id: 3, text: "건조한 날보다 습한 날이 더 힘든가요?" },
  { id: 4, text: "버스보다 지하철을 선호하시나요?" },
  { id: 5, text: "평소에 운동을 하시나요?" },
];

export default function FatigueSurveyPage() {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // 기존 설문 불러오기
  useEffect(() => {
    (async () => {
      try {
        const res = await fatigueApi.get<SurveyAnswerProps[]>("mypage/survey");

        // 데이터 있으면 넣기
        if (res.data.length > 0) {
          // 배열을 객체 {id: value}로 변환해서 상태에 저장
          const loadedAnswers: { [key: number]: number } = {};
          res.data.forEach((a) => {
            loadedAnswers[a.surveyQuestionId] = a.answerValue;
          });
          setAnswers(loadedAnswers);
          // 기존 답변이 있다면 수정모드로 변경
          setHasSubmitted(true);
          console.log("불러온 답변:", res.data);
        }
      } catch (err) {
        console.error("설문 조회 실패:", err);
      }
    })();
  }, []);

  const handleSelect = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // 설문 제출 (post)
  const handleSave = async () => {
    // 객체 → 배열 변환
    const payload: SurveyAnswerProps[] = Object.entries(answers).map(
      ([key, value]) => ({
        surveyQuestionId: Number(key),
        answerValue: value,
      })
    );

    console.log("저장된 답변 (payload):", payload);

    try {
      // 수정모드일 경우 put, 신규모드일 경우 post
      if (hasSubmitted) {
        const res = await fatigueApi.put<SurveyAnswerProps[]>(
          "mypage/survey",
          payload
        );
        console.log(res);
        alert("저장 완료");
      } else {
        const res = await fatigueApi.post<SurveyAnswerProps[]>(
          "mypage/survey",
          payload
        );
        console.log(res);
        setHasSubmitted(true); // 다음부터는 PUT 모드
        alert("저장 완료");
      }
    } catch (err) {
      console.error("제출 실패:", err);
    }
  };

  const handleCancel = () => {
    setAnswers({});
  };

  return (
    <div className="flex flex-col items-center p-6">
      {/* 제목/설명 */}
      <h2 className="text-lg font-semibold mb-2">피로 정보 수정</h2>
      <p className="text-sm text-gray-500 mb-4">
        어느 때 피로감을 느끼세요? <br />
        답변은 피로도 계산에 사용돼요
      </p>

      {/* 질문 카드 */}
      <div className="bg-gray-100 rounded-lg p-6 w-full max-w-md shadow-md space-y-6">
        {questions.map((q) => (
          <div key={q.id}>
            <p className="mb-2 text-gray-800 text-sm">{q.text}</p>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSelect(q.id, num)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs ${
                    answers[q.id] === num
                      ? "bg-green-400 border-green-400 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-2 mt-6 w-full max-w-md">
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
    </div>
  );
}
