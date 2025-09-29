package S13P21A305.dgg.route.service;

import S13P21A305.dgg.route.dto.BusEtaDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BusRealtimeServiceImpl implements BusRealtimeService {

	@Value("${odsay.api.key}")
	private String apiKey;

	private final ObjectMapper om = new ObjectMapper();
	private RestTemplate rt;

	private RestTemplate rt() {
		if (rt == null) {
			rt = new RestTemplate();
			rt.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
		}
		return rt;
	}

	@Override
	public Optional<BusEtaDTO> getEta(String stationId, String busRouteId) {
		if (!StringUtils.hasText(apiKey) || !StringUtils.hasText(stationId) || !StringUtils.hasText(busRouteId)) {
			return Optional.empty();
		}

		log.info("[ETA] in: stationId={} routeId={}", stationId, busRouteId);

		try {
			int[] cidCandidates = new int[] {1000, 2000, 3000}; // 지역별로 분류

			int bestEtaMin = Integer.MAX_VALUE;
			String bestRaw = null;
			String wantIdNorm = normalizeId(busRouteId);

			for (int i = 0; i < cidCandidates.length; i++) {
				int cid = cidCandidates[i];

				String url = org.springframework.web.util.UriComponentsBuilder
					.fromHttpUrl("https://api.odsay.com/v1/api/realtimeStation")
					.queryParam("apiKey", apiKey)
					.queryParam("CID", cid)
					.queryParam("stationID", stationId)
					.build()
					.toUriString();

				log.info("[ETA] try CID={} stationId={} url=/realtimeStation", cid, stationId);

				String body = rt().getForObject(url, String.class);

				log.info("[ETA] got body: CID={} len={}", cid, (body == null ? 0 : body.length()));
				if (body != null && body.length() <= 400) {
					log.info("[ETA] body(CID={}): {}", cid, body);
				}
				if (!StringUtils.hasText(body)) {
					continue;
				}

				JsonNode root = om.readTree(body);
				JsonNode err = root.path("error");
				if (!err.isMissingNode()) {
					log.info("[ETA] error(CID={}): {}", cid, err.toString());
					continue;
				}

				JsonNode result = root.path("result");
				if (result.isMissingNode()) {
					continue;
				}

				// arrivals 찾기
				JsonNode stationNode = result.path("station");

				String[] candidateKeys = new String[] {
					"arrival", "arrivals", "arrivalList",
					"realtime", "realtimeList", "real",
					"busArriveInfo"
				};

				JsonNode arrivals = null;
				String source = null;

				// station
				for (int k = 0; k < candidateKeys.length; k++) {
					String key = candidateKeys[k];
					JsonNode cand = stationNode.path(key);
					JsonNode arr = coerceToArray(cand);
					if (arr != null) { arrivals = arr; source = "station." + key; break; }
				}
				// result
				if (arrivals == null) {
					for (int k = 0; k < candidateKeys.length; k++) {
						String key = candidateKeys[k];
						JsonNode cand = result.path(key);
						JsonNode arr = coerceToArray(cand);
						if (arr != null) { arrivals = arr; source = "result." + key; break; }
					}
				}

				if (arrivals == null) {
					Iterator<String> it1 = result.fieldNames();
					while (it1.hasNext() && arrivals == null) {
						String k1 = it1.next();
						JsonNode v1 = result.get(k1);
						if (v1 == null) continue;
						JsonNode arr = coerceToArray(v1);
						if (arr != null) { arrivals = arr; source = "result." + k1; break; }
						if (v1.isObject()) {
							Iterator<String> it2 = v1.fieldNames();
							while (it2.hasNext() && arrivals == null) {
								String k2 = it2.next();
								JsonNode v2 = v1.get(k2);
								JsonNode arr2 = coerceToArray(v2);
								if (arr2 != null) { arrivals = arr2; source = "result." + k1 + "." + k2; break; }
							}
						}
					}
				}

				if (arrivals == null) {
					log.info("[ETA] no arrivals array. station fields={}, result fields={}",
						fieldNamesOf(stationNode), fieldNamesOf(result));
					continue;
				}

				log.info("[ETA] arrivals: CID={} source={} size={}", cid, source, arrivals.size());
				if (arrivals.size() > 0) {
					JsonNode first = arrivals.get(0);
					log.info("[ETA] first json: {}", first.toString()); // 실제 키 확인용
				}

				// 매칭/ETA 추출
				for (int j = 0; j < arrivals.size(); j++) {
					JsonNode it = arrivals.get(j);

					// 후보 키 확장: busID/laneId/routeID/lineId/routeId/routeNo/busNo 등
					String candId = firstTextDeep(it,
						new String[] { "busID","busId","laneId","routeId","routeID","lineId","routeNo","routeno","route","busNo","busno" },
						2 // depth
					);
					if (!StringUtils.hasText(candId)) {
						continue;
					}
					String candIdNorm = normalizeId(candId);
					if (!wantIdNorm.equals(candIdNorm)) {
						continue;
					}

					// ETA: arrivalTime/arrivalSec/etaMin/remainMin/predictTime 등 확장
					Integer etaMin = firstIntDeep(it,
						new String[] { "arrivalTime","arriveRemainTime","remainMin","etaMin","wait_min","arrivalTimeMin","predictTime","predictTime1" },
						2
					);
					Integer sec = firstIntDeep(it,
						new String[] { "arrivalSec","remainSec","remain_time","predictSecond","predictTimeSec" },
						2
					);
					if (sec != null) {
						etaMin = Math.max(0, (sec + 59) / 60);
					}
					if (etaMin == null) {
						continue;
					}

					log.info("[ETA] match: CID={} stationId={} wantId={} candId={} etaMin={}",
						cid, stationId, busRouteId, candId, etaMin);

					if (etaMin < bestEtaMin) {
						bestEtaMin = etaMin;
						bestRaw = it.toString();
					}
				}

				if (bestEtaMin != Integer.MAX_VALUE) {
					break;
				}
			}

			if (bestEtaMin == Integer.MAX_VALUE) {
				log.info("[ETA] giveup: stationId={} routeId={} (no match on all CID)", stationId, busRouteId);
				return Optional.empty();
			}

			log.info("[ETA] return: stationId={} routeId={} etaMin={}", stationId, busRouteId, bestEtaMin);
			return Optional.of(BusEtaDTO.builder().etaMin(bestEtaMin).rawMsg(bestRaw).build());

		} catch (Exception ex) {
			log.info("[ETA] exception: stationId={} routeId={} msg={}", stationId, busRouteId,
				(ex == null ? "null" : ex.getMessage()));
			return Optional.empty();
		}
	}

	private static String normalizeId(String s) {
		if (s == null) return "";
		return s.replaceAll("[^0-9]", "");
	}

	private static String firstText(JsonNode n, String... keys) {
		for (int i = 0; i < keys.length; i++) {
			String k = keys[i];
			JsonNode v = n.path(k);
			if (v.isTextual()) return v.asText();
			if (v.isNumber()) return String.valueOf(v.asLong());
		}
		return null;
	}

	private static Integer firstInt(JsonNode n, String... keys) {
		for (int i = 0; i < keys.length; i++) {
			String k = keys[i];
			JsonNode v = n.path(k);
			if (v.isNumber()) return v.asInt();
			if (v.isTextual()) {
				try { return Integer.parseInt(v.asText()); } catch (Exception ignore) {}
			}
		}
		return null;
	}

	/** 객체 또는 배열을 "배열"로 강제(객체면 자식 배열들 merge) */
	private static ArrayNode coerceToArray(JsonNode node) {
		if (node == null || node.isMissingNode()) return null;
		if (node.isArray()) return (ArrayNode) node;
		if (node.isObject()) {
			ArrayNode merged = (ArrayNode) mergeArrayChildren(node);
			return (merged != null && merged.size() > 0) ? merged : null;
		}
		return null;
	}

	/** 객체 안의 자식 배열들(arrival1, arrival2 ...)을 합쳐 하나의 배열로 반환. 없으면 null */
	private static JsonNode mergeArrayChildren(JsonNode obj) {
		if (obj == null || !obj.isObject()) return null;
		Iterator<String> it = obj.fieldNames();
		ArrayNode all = new ArrayNode(JsonNodeFactory.instance);
		while (it.hasNext()) {
			String k = it.next();
			JsonNode v = obj.get(k);
			if (v != null && v.isArray() && v.size() > 0) {
				for (int i = 0; i < v.size(); i++) all.add(v.get(i));
			}
		}
		return all.size() == 0 ? null : all;
	}

	private static String fieldNamesOf(JsonNode n) {
		if (n == null || n.isMissingNode()) return "[]";
		Iterator<String> it = n.fieldNames();
		java.util.List<String> names = new java.util.ArrayList<String>();
		while (it.hasNext()) names.add(it.next());
		return names.toString();
	}

	/** 깊이 2까지 내려가며 텍스트 키 검색 */
	private static String firstTextDeep(JsonNode node, String[] keys, int maxDepth) {
		String v = firstText(node, keys);
		if (v != null) return v;
		if (maxDepth <= 0 || node == null || !node.isObject()) return null;
		Iterator<String> it = node.fieldNames();
		while (it.hasNext()) {
			String k = it.next();
			JsonNode child = node.get(k);
			if (child != null && child.isObject()) {
				String sub = firstTextDeep(child, keys, maxDepth - 1);
				if (sub != null) return sub;
			}
		}
		return null;
	}

	/** 깊이 2까지 내려가며 정수 키 검색 */
	private static Integer firstIntDeep(JsonNode node, String[] keys, int maxDepth) {
		Integer v = firstInt(node, keys);
		if (v != null) return v;
		if (maxDepth <= 0 || node == null || !node.isObject()) return null;
		Iterator<String> it = node.fieldNames();
		while (it.hasNext()) {
			String k = it.next();
			JsonNode child = node.get(k);
			if (child != null && child.isObject()) {
				Integer sub = firstIntDeep(child, keys, maxDepth - 1);
				if (sub != null) return sub;
			}
		}
		return null;
	}
}
