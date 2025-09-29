package S13P21A305.dgg.data.dto.response;

import java.util.List;

public record ListResponse(
        List<String> keys,
        String nextContinuationToken
) {}
