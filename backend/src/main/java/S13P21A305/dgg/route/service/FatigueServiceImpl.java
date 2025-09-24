// src/main/java/S13P21A305/dgg/route/service/FatigueServiceImpl.java
package S13P21A305.dgg.route.service;

import S13P21A305.dgg.member.domain.SurveyAnswer;
import S13P21A305.dgg.member.repository.SurveyAnswerRepository;
import S13P21A305.dgg.route.domain.Route;
import S13P21A305.dgg.route.domain.TransportType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FatigueServiceImpl implements FatigueService {

    private final SurveyAnswerRepository surveyAnswerRepository;

    // 가중치(3:4:3) 및 상수
    private static final double W_C = 0.4;   // 혼잡
    private static final double W_T = 0.3;   // 시간
    private static final double W_X = 0.3;   // 환승
    private static final double C_MAX = 5.0; // 혼잡 계수 상한
    private static final double T_MAX = 5.0; // 시간 계수 상한
    private static final double TRANSFER_TAU = 0.20; // 환승 1회당 고정 패널티(정규화)

    @Override
    public double calculateFatigue(Integer memberId, List<Route> routeList) {
        // 1) 설문 조회
        List<SurveyAnswer> answers = surveyAnswerRepository.findByMemberId(memberId);

        // 2) 기본 경로 점수 = 100*(0.4*C* + 0.3*T* + 0.3*X*)
        double base = computeBaseFatigue(routeList);

        // 3) 설문 기반 보정(체질 + 교통수단 선호)
        double factor = surveyMultipliers(answers);
        double preferFactor = transportPreference(answers, routeList);

        return clamp100(base * factor * preferFactor);
    }

    /** 3:4:3 기본 점수 계산 */
    private double computeBaseFatigue(List<Route> legs) {
        // 혼잡(대중교통만) 거리 가중 평균 계수
        double acc = 0, dist = 0;
        long totalSec = 0;
        for (Route r : legs) {
            totalSec += Math.max(0, r.getDurationMin()) * 60L;

            if (r.getType() == TransportType.WALKING) continue;
            double d = Math.max(0.0, r.getDistanceM());
            Double rate = r.getCongestionRate(); // 0~1
            double Ci = congestionCoeffByRatio(rate == null ? 0.6 : rate);
            acc  += Ci * d;
            dist += d;
        }
        double cBar = dist > 0 ? acc / dist : 1.0;
        double Cn   = norm01(cBar, C_MAX);

        // 시간 계수 정규화
        double totalMin = totalSec / 60.0;
        double T  = timeCoeffByMin(totalMin);
        double Tn = norm01(T, T_MAX);

        // 환승(패턴 수) → 고정 패널티
        int transfers = countTransfers(legs);
        double Xn = clamp01(TRANSFER_TAU * transfers);

        return clamp100(100.0 * (W_C * Cn + W_T * Tn + W_X * Xn));
    }

    // ===== 설문 보정(체질) =====
    private double surveyMultipliers(List<SurveyAnswer> answers) {
        double factor = 1.0;
        for (SurveyAnswer a : answers) {
            int qid = a.getSurveyId();   // 네 도메인 기준
            int val = a.getContent();    // 1~5 (중립=3)
            // 질문별 민감도: 약간 보수적으로 0.9~1.1 범위
            double m = switch (qid) {
                // 1) 환승 10분 이상 걸어도 괜찮은가?
                case 1 -> 0.9 + (val - 3) * 0.05;
                // 2) 추위에 강한가?
                case 2 -> 0.9 + (val - 3) * 0.05;
                // 3) 건조/습함 민감도?
                case 3 -> 0.9 + (val - 3) * 0.05;
                // 5) 평소 운동을 하시는가?
                case 5 -> 0.9 + (val - 3) * 0.05;
                default -> 1.0;
            };
            factor *= clamp(m, 0.8, 1.2);
        }
        return factor;
    }

    // ===== 설문 보정(버스/지하철 선호) =====
    private double transportPreference(List<SurveyAnswer> answers, List<Route> legs) {
        double busDist = 0, subDist = 0;
        for (Route r : legs) {
            double d = Math.max(0.0, r.getDistanceM());
            if (r.getType() == TransportType.BUS) busDist += d;
            else if (r.getType() == TransportType.SUBWAY) subDist += d;
        }
        double sum = busDist + subDist + 1e-6;

        final double fBus = busDist;
        final double fSub = subDist;
        final double fSum = sum;

        return answers.stream()
                .filter(a -> a.getSurveyId() == 4) // “버스보다 지하철을 선호하시나요?”
                .findFirst()
                .map(a -> {
                    int v = a.getContent(); // 1~5
                    // 1=버스 선호, 5=지하철 선호
                    return switch (v) {
                        case 1 -> (fBus * 0.7 + fSub * 0.3) / fSum;
                        case 2 -> (fBus * 0.6 + fSub * 0.4) / fSum;
                        case 3 -> (fBus * 0.5 + fSub * 0.5) / fSum;
                        case 4 -> (fBus * 0.4 + fSub * 0.6) / fSum;
                        case 5 -> (fBus * 0.3 + fSub * 0.7) / fSum;
                        default -> 1.0;
                    };
                })
                .orElse(1.0);
    }


    // ===== 환승 카운트: transit – WALKING – transit 패턴 =====
    private int countTransfers(List<Route> legs){
        int n = 0;
        for (int i = 1; i < legs.size() - 1; i++){
            if (isTransit(legs.get(i-1)) && legs.get(i).getType() == TransportType.WALKING && isTransit(legs.get(i+1))) {
                n++;
            }
        }
        return n;
    }
    private boolean isTransit(Route r){ return r != null && r.getType() != TransportType.WALKING; }

    // ===== 혼잡/시간 계수 & 유틸 =====
    private static double congestionCoeffByRatio(Double rate){
        double v = rate == null ? 0.0 : clamp01(rate);
        if (v <= 0.40) return 1.0;
        if (v <= 0.70) return 1.0 + (v-0.40)*(1.0/0.30); // 1 → 2
        if (v <= 0.90) return 2.0 + (v-0.70)*(1.0/0.20); // 2 → 3
        return 3.0 + (v-0.90)*(2.0/0.10);                // 3 → 5
    }
    private static double timeCoeffByMin(double t){
        if (t <= 30) return 1.0;
        if (t <= 60) return 1.0 + (t-30)*0.03;
        if (t <= 90) return 1.9 + (t-60)*0.04;
        return 3.1 + (t-90)*0.02;
    }
    private static double norm01(double val, double max){ return clamp01((val - 1.0) / (max - 1.0)); }
    private static double clamp01(double v){ return Math.max(0, Math.min(1, v)); }
    private static double clamp100(double v){ return Math.max(0, Math.min(100, v)); }
    private static double clamp(double v, double lo, double hi){ return Math.max(lo, Math.min(hi, v)); }
}
