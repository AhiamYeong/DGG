// dto/response/SimpleOkResponse.java
package S13P21A305.dgg.health.dto.response;
public record SimpleOkResponse(String status){ public static SimpleOkResponse ok(){return new SimpleOkResponse("OK");} }
