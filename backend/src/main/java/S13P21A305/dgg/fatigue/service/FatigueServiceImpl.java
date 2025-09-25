package S13P21A305.dgg.fatigue.service;

import S13P21A305.dgg.fatigue.domain.FatigueLog;
import S13P21A305.dgg.fatigue.dto.request.FatigueUpdateRequest;
import S13P21A305.dgg.fatigue.dto.response.FatigueResponse;
import S13P21A305.dgg.member.domain.SurveyAnswer;
import S13P21A305.dgg.member.repository.SurveyAnswerRepository;
import S13P21A305.dgg.route.domain.Route;
import S13P21A305.dgg.route.domain.TransportType;
import S13P21A305.dgg.route.service.CongestionProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import S13P21A305.dgg.fatigue.repository.FatigueLogRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class FatigueServiceImpl implements FatigueService {

    private final FatigueLogRepository repo;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static LocalDateTime s(LocalDate d){ return d.atStartOfDay(); }
    private static LocalDateTime e(LocalDate d){ return d.plusDays(1).atStartOfDay(); }

    @Override
    public int currentFatigue(Integer memberId) {
        LocalDate today = LocalDate.now(KST);
        return repo.findTopByMemberIdAndCreatedAtBetweenOrderByCreatedAtDesc(memberId, s(today), e(today))
                .map(FatigueLog::getFatigue).orElse(0);
    }

    @Override
    @Transactional
    public FatigueResponse update(Integer memberId, FatigueUpdateRequest req) {
        LocalDateTime now = LocalDateTime.now(KST);
        LocalDate day = now.toLocalDate();

        int base = repo.findTopByMemberIdAndCreatedAtBetweenOrderByCreatedAtDesc(memberId, s(day), e(day))
                .map(FatigueLog::getFatigue).orElse(0);

        int requested = req.getFatigue_change(); // 증감 요청값
        int applied = requested;                 // 실제 적용값
        int updated = base + requested;

        if (requested < 0 && updated < 0) {        // 0 미만 방지
            applied = -base;
            updated = 0;
        } else if (requested > 0 && updated > 100) { // 100 초과 방지
            applied = 100 - base;
            updated = 100;
        }

        FatigueLog l = new FatigueLog();
        l.setMemberId(memberId);
        l.setReason(req.getReason());
        l.setFatigueChange(applied);
        l.setFatigue(updated);
        l.setCreatedAt(now);
        repo.save(l);

        return FatigueResponse.builder()
                .created_at(l.getCreatedAt())
                .reason(l.getReason())
                .fatigue(l.getFatigue())
                .fatigue_change(l.getFatigueChange())
                .build();
    }

    @Override
    public List<FatigueLog> todayHistory(Integer memberId) {
        LocalDate today = LocalDate.now(KST);
        return repo.findByMemberIdAndCreatedAtBetweenOrderByCreatedAtAsc(memberId, s(today), e(today));
    }

    @Override
    public List<Record> weeklyFatigue(Integer memberId, LocalDate monday) {
        return IntStream.range(0,7).mapToObj(i -> {
            LocalDate d = monday.plusDays(i);
            int v = repo.findTopByMemberIdAndCreatedAtBetweenOrderByCreatedAtDesc(memberId, s(d), e(d))
                    .map(FatigueLog::getFatigue).orElse(0);
            return new Record(dayKey(d.getDayOfWeek()), v);
        }).toList();
    }

    private static String dayKey(DayOfWeek dow){
        return switch (dow){
            case MONDAY -> "mon"; case TUESDAY -> "tue"; case WEDNESDAY -> "wed";
            case THURSDAY -> "thu"; case FRIDAY -> "fri"; case SATURDAY -> "sat";
            default -> "sun";
        };
    }

    private final SurveyAnswerRepository surveyAnswerRepository;

    private final CongestionProvider congestionProvider;


    // ===================== JSON "data" -> List<Route> 변환 =====================
    @SuppressWarnings("unchecked")
    private List<Route> toRoutesFromPayload(List<Map<String, Object>> data) {
        if (data == null || data.isEmpty()) return List.of();

        var sorted = data.stream()
                .sorted(Comparator.comparingInt(m -> ((Number) m.getOrDefault("order", 0)).intValue()))
                .collect(Collectors.toList());

        List<Route> routes = new ArrayList<>(sorted.size());
        for (Map<String, Object> seg : sorted) {
            String typeStr = str(seg.get("type"));
            TransportType type = parseType(typeStr);

            String lineName   = str(seg.get("lineName"));
            String startPoint = str(seg.get("startPoint"));
            String endPoint   = str(seg.get("endPoint"));

            double startLat = dbl(seg.get("startLat"));
            double startLng = dbl(seg.get("startLng"));
            double endLat   = dbl(seg.get("endLat"));
            double endLng   = dbl(seg.get("endLng"));

            // durationMin / timeTaken 둘 다 x지원
            int durationMin = ((Number) seg.getOrDefault("durationMin",
                    seg.getOrDefault("timeTaken", 0))).intValue();

            // path가 있으면 경로 길이, 없으면 좌표, 그래도 없으면 payload의 distanceM 사용
            List<Map<String, Object>> path = (List<Map<String, Object>>) seg.getOrDefault("path", null);
            double distanceM = Double.NaN;
            if (path != null && path.size() >= 2) {
                distanceM = polylineDistanceM(path);
            } else if (!Double.isNaN(startLat) && !Double.isNaN(startLng)
                    && !Double.isNaN(endLat) && !Double.isNaN(endLng)) {
                distanceM = haversineM(startLat, startLng, endLat, endLng);
            } else {
                // payload로 온 distanceM 최종 폴백
                distanceM = dbl(seg.get("distanceM"));
            }
            if (Double.isNaN(distanceM)) distanceM = 0.0;

            // WALKING은 null, 나머지는 0으로 시작(Provider가 덮어씀)
            Double congestionRate = (type == TransportType.WALKING) ? null : 0.0;

            routes.add(Route.builder()
                    .type(type)
                    .distanceM(distanceM)
                    .durationMin(durationMin)
                    .congestionRate(congestionRate)
                    .startPoint(startPoint)
                    .endPoint(endPoint)
                    .lineName(lineName)
                    .build());
        }
        return routes;
    }


    private static TransportType parseType(String s) {
        if (s == null) return TransportType.WALKING;
        return switch (s.toUpperCase(Locale.ROOT)) {
            case "SUBWAY" -> TransportType.SUBWAY;
            case "BUS"    -> TransportType.BUS;
            case "WALKING", "WALK", "TRANSFER" -> TransportType.WALKING; // 환승 보행도 WALKING으로 통일
            default -> TransportType.WALKING;
        };
    }

    private static String str(Object o) { return o == null ? null : String.valueOf(o); }
    private static double dbl(Object o) {
        if (o == null) return Double.NaN;
        if (o instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(String.valueOf(o)); } catch (Exception e) { return Double.NaN; }
    }

    private static double polylineDistanceM(List<Map<String, Object>> path) {
        double sum = 0.0;
        for (int i = 1; i < path.size(); i++) {
            double lat1 = dbl(path.get(i - 1).get("lat"));
            double lon1 = dbl(path.get(i - 1).get("lng"));
            double lat2 = dbl(path.get(i).get("lat"));
            double lon2 = dbl(path.get(i).get("lng"));
            if (!Double.isNaN(lat1) && !Double.isNaN(lon1) && !Double.isNaN(lat2) && !Double.isNaN(lon2)) {
                sum += haversineM(lat1, lon1, lat2, lon2);
            }
        }
        return sum;
    }

    private static double haversineM(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000.0; // meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // 가중치(3:4:3) 및 상수
    private static final double W_C = 0.4;   // 혼잡
    private static final double W_T = 0.3;   // 시간
    private static final double W_X = 0.3;   // 환승
    private static final double C_MAX = 5.0; // 혼잡 계수 상한
    private static final double T_MAX = 5.0; // 시간 계수 상한
    private static final double TRANSFER_TAU = 0.20; // 환승 1회당 고정 패널티(정규화)

    @Override
    public double calculateFatigue(Integer memberId, List<Route> routeList) {

        //CSV/Spark 기반 혼잡도 채우기 (Provider 사용 시)
        if (congestionProvider != null) {
            congestionProvider.enrich(routeList);
        }

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
        for (int i = 0; i < legs.size() - 1; i++){
            var a = legs.get(i);
            var b = legs.get(i+1);
            if (isTransit(a) && isTransit(b)) {
                boolean typeChange = a.getType() != b.getType();
                boolean lineChange = a.getType() == b.getType()
                        && (a.getLineName() != null || b.getLineName() != null)
                        && !Objects.equals(a.getLineName(), b.getLineName());
                if (typeChange || lineChange) n++;
            }
            // 기존 규칙(대중교통–걷기–대중교통)도 유지하려면 아래 추가:
            if (i < legs.size()-2 && isTransit(a) && legs.get(i+1).getType()==TransportType.WALKING && isTransit(legs.get(i+2))) {
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
    private static double norm01(double val, double max){ return clamp01(val / max); }
    private static double clamp01(double v){ return Math.max(0, Math.min(1, v)); }
    private static double clamp100(double v){ return Math.max(0, Math.min(100, v)); }
    private static double clamp(double v, double lo, double hi){ return Math.max(lo, Math.min(hi, v)); }

    // FatigueServiceImpl에 구현 추가
    @Override
    public double calculateFatigueFromPayload(Integer memberId, List<Map<String, Object>> data) {
        List<Route> routes = toRoutesFromPayload(data);
        return calculateFatigue(memberId, routes);
    }

}
