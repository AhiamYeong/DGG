package S13P21A305.dgg.health;

import S13P21A305.dgg.health.controller.HealthController;
import S13P21A305.dgg.health.service.HealthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class HealthControllerStandaloneTest {

    MockMvc mvc;
    HealthService healthService;

    @BeforeEach
    void setUp() {
        healthService = Mockito.mock(HealthService.class);
        var controller = new HealthController(healthService);
        mvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice() // 필요 시 넣기
                .build();
    }

    @Test
    void 수면업서트_API_테스트() throws Exception {
        var payload = """
        {
          "sleepDate": "2025-09-21",
          "sleepScore": 80,
          "sleepGoalMin": 420,
          "sleepStartMs": 1758125400000,
          "sleepEndMs":   1758147000000,
          "activeCalories": 200.0,
          "activitySec": 1800
        }
        """;

        mvc.perform(post("/api/v1/health/sleep")
                        .header("X-Member-Id", 1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void 활동로그_API_테스트() throws Exception {
        var payload = """
        {
          "windowEnd": "2025-09-21T09:10:00+09:00",
          "totalStep": 300,
          "totalActiveTimeSec": 120,
          "totalActiveCaloriesBurned": 10.5,
          "totalCaloriesBurned": 15.0,
          "totalDistanceM": 240.0
        }
        """;

        mvc.perform(post("/api/v1/health/activity")
                        .header("X-Member-Id", 1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }
}
