package S13P21A305.dgg.auth.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final MemberDTO memberDTO;

    public CustomOAuth2User(MemberDTO memberDTO){
        this.memberDTO = memberDTO;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        Collection<GrantedAuthority> collection = new ArrayList<>();

        collection.add(() -> "ROLE_" + memberDTO.getRole());

        return collection;
    }

    // dgg 고유 member id
    public String getMemberId(){
        return String.valueOf(memberDTO.getMemberId());
    }

    public String getName(){
        return String.valueOf(memberDTO.getName());
    }

}
